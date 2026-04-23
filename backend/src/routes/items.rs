use actix_web::{web, get, post, put, delete, Responder, HttpResponse};
use serde::Deserialize;
use crate::{DbPool, models::{ItemRequest, ItemDetail, BatchDetail, SuccessResponse}};
use diesel::prelude::*;
use chrono::{NaiveDate, Local};

#[derive(Deserialize)]
pub struct ItemsQuery {
    category: Option<i32>,
    search: Option<String>,
    page: Option<i32>,
    limit: Option<i32>,
}

#[derive(Deserialize)]
pub struct ExpiringQuery {
    days: Option<i32>,
}

#[get("/items")]
async fn get_items(
    pool: web::Data<DbPool>,
    query: web::Query<ItemsQuery>,
) -> impl Responder {
    let category = query.category;
    let search = query.search.clone();
    let page = query.page.unwrap_or(1);
    let limit = query.limit.unwrap_or(10);
    let offset = (page - 1) * limit;
    
    let mut conn = pool.get().unwrap();
    use crate::schema::items::dsl as items_dsl;
    use crate::schema::categories::dsl as categories_dsl;
    use crate::schema::locations::dsl as locations_dsl;
    
    // 先计算总数
    let mut count_query = items_dsl::items
        .inner_join(categories_dsl::categories)
        .inner_join(locations_dsl::locations)
        .into_boxed();
    
    if let Some(cat_id) = category {
        count_query = count_query.filter(items_dsl::category_id.eq(cat_id));
    }
    
    if let Some(ref search_term) = search {
        count_query = count_query.filter(items_dsl::name.like(format!("%{search_term}%")));
    }
    
    let total = count_query.count().get_result::<i64>(&mut conn).unwrap();
    
    // 再查询实际数据
    let mut db_query = items_dsl::items
        .inner_join(categories_dsl::categories)
        .inner_join(locations_dsl::locations)
        .select((
            items_dsl::id,
            items_dsl::name,
            categories_dsl::name,
            locations_dsl::name,
            items_dsl::quantity,
            items_dsl::created_at,
            items_dsl::updated_at
        ))
        .into_boxed();
    
    if let Some(cat_id) = category {
        db_query = db_query.filter(items_dsl::category_id.eq(cat_id));
    }
    
    if let Some(ref search_term) = search {
        db_query = db_query.filter(items_dsl::name.like(format!("%{search_term}%")));
    }
    
    let results = db_query
        .offset(offset as i64)
        .limit(limit as i64)
        .load::<(i32, String, String, String, i32, chrono::NaiveDateTime, chrono::NaiveDateTime)>(&mut conn)
        .unwrap();
    
    let items_list: Vec<serde_json::Value> = results.into_iter().map(|(id, name, category_name, location_name, quantity, created_at, updated_at)| {
        serde_json::json!({
            "id": id,
            "name": name,
            "category": category_name,
            "location": location_name,
            "quantity": quantity,
            "created_at": created_at,
            "updated_at": updated_at
        })
    }).collect();
    
    let response = serde_json::json!({
        "items": items_list,
        "total": total
    });
    
    HttpResponse::Ok().json(response)
}

#[get("/items/{item_id}")]
async fn get_item(
    item_id: web::Path<i32>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let item_id_val = item_id.into_inner();
    let mut conn = pool.get().unwrap();
    use crate::schema::items::dsl as items_dsl;
    use crate::schema::categories::dsl as categories_dsl;
    use crate::schema::locations::dsl as locations_dsl;
    use crate::schema::item_batches::dsl as item_batches_dsl;
    
    let item_data = items_dsl::items
        .inner_join(categories_dsl::categories)
        .inner_join(locations_dsl::locations)
        .filter(items_dsl::id.eq(item_id_val))
        .select((
            items_dsl::id,
            items_dsl::name,
            categories_dsl::name,
            locations_dsl::name,
            items_dsl::quantity,
            items_dsl::created_at,
            items_dsl::updated_at
        ))
        .first::<(i32, String, String, String, i32, chrono::NaiveDateTime, chrono::NaiveDateTime)>(&mut conn)
        .unwrap();
    
    let batches_data = item_batches_dsl::item_batches
        .filter(item_batches_dsl::item_id.eq(item_id_val))
        .load::<crate::models::ItemBatch>(&mut conn)
        .unwrap();
    
    let today = Local::now().date_naive();
    let batches: Vec<BatchDetail> = batches_data.into_iter().map(|batch| {
        let days_until_expiry = (batch.expiry_date.signed_duration_since(today)).num_days() as i32;
        BatchDetail {
            id: batch.id,
            quantity: batch.quantity,
            expiry_date: batch.expiry_date,
            days_until_expiry: days_until_expiry
        }
    }).collect();
    
    let item = ItemDetail {
        id: item_data.0,
        name: item_data.1,
        category: item_data.2,
        location: item_data.3,
        quantity: item_data.4,
        batches: batches,
        created_at: item_data.5,
        updated_at: item_data.6
    };
    
    HttpResponse::Ok().json(item)
}

#[post("/items")]
async fn add_item(
    item_req: web::Json<ItemRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::items::dsl as items_dsl;
    use crate::schema::item_batches::dsl as item_batches_dsl;
    
    let new_item_id = diesel::insert_into(items_dsl::items)
        .values((
            items_dsl::user_id.eq(1),
            items_dsl::category_id.eq(item_req.category_id),
            items_dsl::location_id.eq(item_req.location_id),
            items_dsl::name.eq(&item_req.name),
            items_dsl::quantity.eq(item_req.quantity),
            items_dsl::created_at.eq(chrono::Local::now().naive_local()),
            items_dsl::updated_at.eq(chrono::Local::now().naive_local())
        ))
        .returning(items_dsl::id)
        .get_result::<i32>(&mut conn)
        .unwrap();
    
    for batch in &item_req.batches {
        let expiry_date = NaiveDate::parse_from_str(&batch.expiry_date, "%Y-%m-%d").unwrap();
        diesel::insert_into(item_batches_dsl::item_batches)
            .values((
                item_batches_dsl::item_id.eq(new_item_id),
                item_batches_dsl::quantity.eq(batch.quantity),
                item_batches_dsl::expiry_date.eq(&expiry_date),
                item_batches_dsl::created_at.eq(chrono::Local::now().naive_local())
            ))
            .execute(&mut conn)
            .unwrap();
    }
    
    let new_item = serde_json::json!({
        "id": new_item_id,
        "name": item_req.name,
        "category_id": item_req.category_id,
        "location_id": item_req.location_id,
        "quantity": item_req.quantity,
        "batches": item_req.batches
    });
    
    HttpResponse::Ok().json(new_item)
}

#[put("/items/{item_id}")]
async fn update_item(
    item_id: web::Path<i32>,
    item_req: web::Json<ItemRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let item_id_val = item_id.into_inner();
    let mut conn = pool.get().unwrap();
    use crate::schema::items::dsl as items_dsl;
    use crate::schema::item_batches::dsl as item_batches_dsl;
    
    diesel::update(items_dsl::items.filter(items_dsl::id.eq(item_id_val)))
        .set((
            items_dsl::category_id.eq(item_req.category_id),
            items_dsl::location_id.eq(item_req.location_id),
            items_dsl::name.eq(&item_req.name),
            items_dsl::quantity.eq(item_req.quantity),
            items_dsl::updated_at.eq(chrono::Local::now().naive_local())
        ))
        .execute(&mut conn)
        .unwrap();
    
    diesel::delete(item_batches_dsl::item_batches.filter(item_batches_dsl::item_id.eq(item_id_val)))
        .execute(&mut conn)
        .unwrap();
    
    for batch in &item_req.batches {
        let expiry_date = NaiveDate::parse_from_str(&batch.expiry_date, "%Y-%m-%d").unwrap();
        diesel::insert_into(item_batches_dsl::item_batches)
            .values((
                item_batches_dsl::item_id.eq(item_id_val),
                item_batches_dsl::quantity.eq(batch.quantity),
                item_batches_dsl::expiry_date.eq(&expiry_date),
                item_batches_dsl::created_at.eq(chrono::Local::now().naive_local())
            ))
            .execute(&mut conn)
            .unwrap();
    }
    
    let updated_item = serde_json::json!({
        "id": item_id_val,
        "name": item_req.name,
        "category_id": item_req.category_id,
        "location_id": item_req.location_id,
        "quantity": item_req.quantity,
        "batches": item_req.batches
    });
    
    HttpResponse::Ok().json(updated_item)
}

#[delete("/items/{item_id}")]
async fn delete_item(
    item_id: web::Path<i32>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let item_id_val = item_id.into_inner();
    let mut conn = pool.get().unwrap();
    use crate::schema::items::dsl as items_dsl;
    diesel::delete(items_dsl::items.filter(items_dsl::id.eq(item_id_val)))
        .execute(&mut conn)
        .unwrap();
    
    HttpResponse::Ok().json(SuccessResponse { success: true })
}

#[get("/items/expiring")]
async fn get_expiring_items(
    pool: web::Data<DbPool>,
    query: web::Query<ExpiringQuery>,
) -> impl Responder {
    let days = query.days.unwrap_or(7);
    let today = Local::now().date_naive();
    let end_date = today + chrono::Duration::days(days as i64);
    
    let mut conn = pool.get().unwrap();
    use crate::schema::items::dsl as items_dsl;
    use crate::schema::categories::dsl as categories_dsl;
    use crate::schema::locations::dsl as locations_dsl;
    use crate::schema::item_batches::dsl as item_batches_dsl;
    
    let results = items_dsl::items
        .inner_join(categories_dsl::categories)
        .inner_join(locations_dsl::locations)
        .inner_join(item_batches_dsl::item_batches)
        .filter(item_batches_dsl::expiry_date.between(today, end_date))
        .select((
            items_dsl::id,
            items_dsl::name,
            categories_dsl::name,
            locations_dsl::name,
            item_batches_dsl::quantity,
            item_batches_dsl::expiry_date
        ))
        .load::<(i32, String, String, String, i32, NaiveDate)>(&mut conn)
        .unwrap();
    
    let items_list: Vec<serde_json::Value> = results.into_iter().map(|(id, name, category_name, location_name, quantity, expiry_date)| {
        let days_until_expiry = (expiry_date.signed_duration_since(today)).num_days() as i32;
        serde_json::json!({
            "id": id,
            "name": name,
            "category": category_name,
            "location": location_name,
            "quantity": quantity,
            "expiry_date": expiry_date,
            "daysUntilExpiry": days_until_expiry
        })
    }).collect();
    
    let expiring_items = serde_json::json!({
        "items": items_list
    });
    
    HttpResponse::Ok().json(expiring_items)
}
