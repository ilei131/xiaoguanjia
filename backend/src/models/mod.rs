use chrono::{NaiveDateTime, NaiveDate};
use diesel::{Queryable, Insertable};
use serde::{Deserialize, Serialize};
use crate::schema::*;

// 用户模型
#[derive(Queryable, Serialize, Deserialize)]
pub struct User {
    pub id: i32,
    pub openid: String,
    pub nickname: Option<String>,
    pub avatar: Option<String>,
    pub email: String,
    pub password_hash: String,
    pub role: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

// 用于插入的用户模型
#[derive(Insertable, Serialize, Deserialize)]
#[diesel(table_name = users)]
pub struct NewUser {
    pub openid: String,
    pub nickname: Option<String>,
    pub avatar: Option<String>,
    pub email: String,
    pub password_hash: String,
    pub role: String,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

// 分类模型
#[derive(Queryable, Serialize, Deserialize)]
pub struct Category {
    pub id: i32,
    pub user_id: Option<i32>,
    pub name: String,
    pub is_default: bool,
    pub created_at: NaiveDateTime,
}

// 用于插入的分类模型
#[derive(Insertable, Serialize, Deserialize)]
#[diesel(table_name = categories)]
pub struct NewCategory {
    pub user_id: Option<i32>,
    pub name: String,
    pub is_default: bool,
    pub created_at: NaiveDateTime,
}

// 存放地点模型
#[derive(Queryable, Serialize, Deserialize)]
pub struct Location {
    pub id: i32,
    pub user_id: Option<i32>,
    pub name: String,
    pub is_default: bool,
    pub created_at: NaiveDateTime,
}

// 用于插入的存放地点模型
#[derive(Insertable, Serialize, Deserialize)]
#[diesel(table_name = locations)]
pub struct NewLocation {
    pub user_id: Option<i32>,
    pub name: String,
    pub is_default: bool,
    pub created_at: NaiveDateTime,
}

// 物品模型
#[derive(Queryable, Serialize, Deserialize)]
pub struct Item {
    pub id: i32,
    pub user_id: i32,
    pub category_id: i32,
    pub location_id: i32,
    pub name: String,
    pub quantity: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

// 用于插入的物品模型
#[derive(Insertable, Serialize, Deserialize)]
#[diesel(table_name = items)]
pub struct NewItem {
    pub user_id: i32,
    pub category_id: i32,
    pub location_id: i32,
    pub name: String,
    pub quantity: i32,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

// 物品批次模型
#[derive(Queryable, Serialize, Deserialize)]
pub struct ItemBatch {
    pub id: i32,
    pub item_id: i32,
    pub quantity: i32,
    pub expiry_date: NaiveDate,
    pub created_at: NaiveDateTime,
}

// 用于插入的物品批次模型
#[derive(Insertable, Serialize, Deserialize)]
#[diesel(table_name = item_batches)]
pub struct NewItemBatch {
    pub item_id: i32,
    pub quantity: i32,
    pub expiry_date: NaiveDate,
    pub created_at: NaiveDateTime,
}

// 物品详情响应模型
#[derive(Serialize, Deserialize)]
pub struct ItemDetail {
    pub id: i32,
    pub name: String,
    pub category: String,
    pub location: String,
    pub quantity: i32,
    pub batches: Vec<BatchDetail>,
    pub created_at: NaiveDateTime,
    pub updated_at: NaiveDateTime,
}

// 批次详情模型
#[derive(Serialize, Deserialize)]
pub struct BatchDetail {
    pub id: i32,
    pub quantity: i32,
    pub expiry_date: NaiveDate,
    pub days_until_expiry: i32,
}

// 微信登录请求模型
#[derive(Deserialize)]
pub struct WechatLoginRequest {
    pub code: String,
}

// 网站登录请求模型
#[derive(Deserialize)]
pub struct LoginRequest {
    pub email: String,
    pub password: String,
}

// 登录响应模型
#[derive(Serialize)]
pub struct LoginResponse {
    pub token: String,
    pub user_id: i32,
    pub email: String,
    pub role: String,
}

// 注册请求模型
#[derive(Deserialize)]
pub struct RegisterRequest {
    pub email: String,
    pub password: String,
    pub nickname: String,
}

// 修改密码请求模型
#[derive(Deserialize)]
pub struct ChangePasswordRequest {
    pub old_password: String,
    pub new_password: String,
}

// 找回密码请求模型
#[derive(Deserialize)]
pub struct ForgotPasswordRequest {
    pub email: String,
}

// 物品请求模型
#[derive(Deserialize)]
pub struct ItemRequest {
    pub name: String,
    pub category_id: i32,
    pub location_id: i32,
    pub quantity: i32,
    pub batches: Vec<BatchRequest>,
}

// 批次请求模型
#[derive(Serialize, Deserialize)]
pub struct BatchRequest {
    pub quantity: i32,
    pub expiry_date: String,
}

// 分类请求模型
#[derive(Deserialize)]
pub struct CategoryRequest {
    pub name: String,
}

// 存放地点请求模型
#[derive(Deserialize)]
pub struct LocationRequest {
    pub name: String,
}

// 通用响应模型
#[derive(Serialize)]
pub struct Response<T> {
    pub data: T,
}

// 成功响应模型
#[derive(Serialize)]
pub struct SuccessResponse {
    pub success: bool,
}
