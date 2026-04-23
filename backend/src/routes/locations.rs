use actix_web::{web, get, post, put, delete, Responder, HttpResponse};
use crate::{DbPool, models::{LocationRequest, SuccessResponse}};
use diesel::prelude::*;
use chrono::Local;

#[get("/locations")]
async fn get_locations(
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::locations::dsl::*;
    let results = locations
        .load::<crate::models::Location>(&mut conn)
        .unwrap();
    
    let locations_json = serde_json::json!({
        "locations": results
    });
    
    HttpResponse::Ok().json(locations_json)
}

#[post("/locations")]
async fn add_location(
    location_req: web::Json<LocationRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::locations::dsl::*;
    
    let location_id = diesel::insert_into(locations)
        .values((
            user_id.eq(Some(1)),
            name.eq(&location_req.name),
            is_default.eq(false),
            created_at.eq(Local::now().naive_local())
        ))
        .returning(id)
        .get_result::<i32>(&mut conn)
        .unwrap();
    
    let new_location = serde_json::json!({
        "id": location_id, 
        "name": location_req.name, 
        "is_default": false
    });
    
    HttpResponse::Ok().json(new_location)
}

#[put("/locations/{loc_id}")]
async fn update_location(
    loc_id: web::Path<i32>,
    location_req: web::Json<LocationRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let location_id_val = loc_id.into_inner();
    let mut conn = pool.get().unwrap();
    use crate::schema::locations::dsl::*;
    
    diesel::update(locations.filter(id.eq(location_id_val)))
        .set(name.eq(&location_req.name))
        .execute(&mut conn)
        .unwrap();
    
    let loc = locations
        .filter(id.eq(location_id_val))
        .first::<crate::models::Location>(&mut conn)
        .unwrap();
    
    let updated_location = serde_json::json!({"id": loc.id, "name": loc.name, "is_default": loc.is_default});
    
    HttpResponse::Ok().json(updated_location)
}

#[delete("/locations/{loc_id}")]
async fn delete_location(
    loc_id: web::Path<i32>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let location_id_val = loc_id.into_inner();
    let mut conn = pool.get().unwrap();
    use crate::schema::locations::dsl::*;
    diesel::delete(locations.filter(id.eq(location_id_val)))
        .execute(&mut conn)
        .unwrap();
    
    HttpResponse::Ok().json(SuccessResponse { success: true })
}
