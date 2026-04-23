use actix_web::{web, get, post, put, delete, Responder, HttpResponse};
use crate::{DbPool, models::{CategoryRequest, SuccessResponse}};
use diesel::prelude::*;
use chrono::Local;

#[get("/categories")]
async fn get_categories(
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::categories::dsl::*;
    let results = categories
        .load::<crate::models::Category>(&mut conn)
        .unwrap();
    
    let categories_json = serde_json::json!({
        "categories": results
    });
    
    HttpResponse::Ok().json(categories_json)
}

#[post("/categories")]
async fn add_category(
    category_req: web::Json<CategoryRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::categories::dsl::*;
    
    let category_id = diesel::insert_into(categories)
        .values((
            user_id.eq(Some(1)),
            name.eq(&category_req.name),
            is_default.eq(false),
            created_at.eq(Local::now().naive_local())
        ))
        .returning(id)
        .get_result::<i32>(&mut conn)
        .unwrap();
    
    let new_category = serde_json::json!({
        "id": category_id, 
        "name": category_req.name, 
        "is_default": false
    });
    
    HttpResponse::Ok().json(new_category)
}

#[put("/categories/{cat_id}")]
async fn update_category(
    cat_id: web::Path<i32>,
    category_req: web::Json<CategoryRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let category_id_val = cat_id.into_inner();
    let mut conn = pool.get().unwrap();
    use crate::schema::categories::dsl::*;
    
    diesel::update(categories.filter(id.eq(category_id_val)))
        .set(name.eq(&category_req.name))
        .execute(&mut conn)
        .unwrap();
    
    let cat = categories
        .filter(id.eq(category_id_val))
        .first::<crate::models::Category>(&mut conn)
        .unwrap();
    
    let updated_category = serde_json::json!({"id": cat.id, "name": cat.name, "is_default": cat.is_default});
    
    HttpResponse::Ok().json(updated_category)
}

#[delete("/categories/{cat_id}")]
async fn delete_category(
    cat_id: web::Path<i32>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let category_id_val = cat_id.into_inner();
    let mut conn = pool.get().unwrap();
    use crate::schema::categories::dsl::*;
    diesel::delete(categories.filter(id.eq(category_id_val)))
        .execute(&mut conn)
        .unwrap();
    
    HttpResponse::Ok().json(SuccessResponse { success: true })
}
