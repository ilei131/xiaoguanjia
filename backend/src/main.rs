use actix_web::{web, App, HttpServer, middleware::Logger};
use actix_cors::Cors;
use diesel::pg::PgConnection;
use diesel::r2d2::{self, ConnectionManager};

mod models;
mod routes;
mod schema;
mod utils;

pub type DbPool = r2d2::Pool<ConnectionManager<PgConnection>>;

#[actix_web::main]
async fn main() -> std::io::Result<()> {
    dotenv::dotenv().ok();
    
    let database_url = std::env::var("DATABASE_URL")
        .expect("DATABASE_URL must be set");
    
    // 初始化数据库
    utils::db_init::init_database();
    
    let manager = ConnectionManager::<PgConnection>::new(database_url);
    let pool = r2d2::Pool::builder()
        .build(manager)
        .expect("Failed to create pool");

    HttpServer::new(move || {
        App::new()
            .wrap(Logger::default())
            .wrap(Cors::default()
                .allow_any_origin()
                .allow_any_method()
                .allow_any_header())
            .app_data(web::Data::new(pool.clone()))
            .service(web::scope("/api")
                .service(routes::auth::login)
                .service(routes::auth::wechat_login)
                .service(routes::auth::register)
                .service(routes::auth::change_password)
                .service(routes::auth::forgot_password)
                .service(routes::items::get_items)
                .service(routes::items::get_item)
                .service(routes::items::add_item)
                .service(routes::items::update_item)
                .service(routes::items::delete_item)
                .service(routes::items::get_expiring_items)
                .service(routes::categories::get_categories)
                .service(routes::categories::add_category)
                .service(routes::categories::update_category)
                .service(routes::categories::delete_category)
                .service(routes::locations::get_locations)
                .service(routes::locations::add_location)
                .service(routes::locations::update_location)
                .service(routes::locations::delete_location)
                .service(routes::admin::get_users)
                .service(routes::admin::delete_user)
            )
    })
    .bind("127.0.0.1:8080")?
    .run()
    .await
}