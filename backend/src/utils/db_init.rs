use diesel::prelude::*;
use diesel::pg::PgConnection;
use std::env;

pub fn init_database() {
    let database_url = env::var("DATABASE_URL").expect("DATABASE_URL must be set");
    let mut conn = PgConnection::establish(&database_url).expect("Failed to connect to database");

    // 创建users表
    diesel::sql_query("CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        openid VARCHAR(255) NOT NULL UNIQUE,
        nickname VARCHAR(255),
        avatar VARCHAR(255),
        email VARCHAR(255) NOT NULL DEFAULT '',
        password_hash VARCHAR(255) NOT NULL DEFAULT '',
        role VARCHAR(50) NOT NULL DEFAULT 'user',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )").execute(&mut conn).expect("Failed to create users table");

    // 创建categories表
    diesel::sql_query("CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )").execute(&mut conn).expect("Failed to create categories table");

    // 创建locations表
    diesel::sql_query("CREATE TABLE IF NOT EXISTS locations (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id),
        name VARCHAR(255) NOT NULL,
        is_default BOOLEAN NOT NULL DEFAULT false,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )").execute(&mut conn).expect("Failed to create locations table");

    // 创建items表
    diesel::sql_query("CREATE TABLE IF NOT EXISTS items (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id),
        category_id INTEGER NOT NULL REFERENCES categories(id),
        location_id INTEGER NOT NULL REFERENCES locations(id),
        name VARCHAR(255) NOT NULL,
        quantity INTEGER NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )").execute(&mut conn).expect("Failed to create items table");

    // 创建item_batches表
    diesel::sql_query("CREATE TABLE IF NOT EXISTS item_batches (
        id SERIAL PRIMARY KEY,
        item_id INTEGER NOT NULL REFERENCES items(id),
        quantity INTEGER NOT NULL,
        expiry_date DATE NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
    )").execute(&mut conn).expect("Failed to create item_batches table");

    // 插入默认分类
    let default_categories = ["食品", "饮料", "日用品", "化妆品", "药品", "其他"];
    for category in &default_categories {
        diesel::sql_query("INSERT INTO categories (name, is_default) VALUES ($1, true) ON CONFLICT DO NOTHING")
            .bind::<diesel::sql_types::Text, _>(category)
            .execute(&mut conn)
            .expect("Failed to insert default categories");
    }

    // 插入默认存放地点
    let default_locations = ["厨房", "客厅", "卧室", "浴室", "书房", "其他"];
    for location in &default_locations {
        diesel::sql_query("INSERT INTO locations (name, is_default) VALUES ($1, true) ON CONFLICT DO NOTHING")
            .bind::<diesel::sql_types::Text, _>(location)
            .execute(&mut conn)
            .expect("Failed to insert default locations");
    }

    println!("Database initialized successfully");
}