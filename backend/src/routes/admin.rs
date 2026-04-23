use actix_web::{web, get, delete, Responder, HttpResponse};
use crate::{DbPool, models::User};
use diesel::prelude::*;

// 获取所有用户
#[get("/admin/users")]
async fn get_users(
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::users::dsl::*;
    
    let users_list = users.load::<User>(&mut conn).unwrap();
    
    HttpResponse::Ok().json(users_list)
}

// 删除用户
#[delete("/admin/users/{id}")]
async fn delete_user(
    path: web::Path<i32>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let user_id = path.into_inner();
    let mut conn = pool.get().unwrap();
    use crate::schema::users::dsl::*;
    
    diesel::delete(users.filter(id.eq(user_id)))
        .execute(&mut conn)
        .unwrap();
    
    HttpResponse::Ok().json(serde_json::json!({
        "success": true
    }))
}

pub fn config(cfg: &mut web::ServiceConfig) {
    cfg.service(
        web::scope("/api")
            .service(get_users)
            .service(delete_user)
    );
}
