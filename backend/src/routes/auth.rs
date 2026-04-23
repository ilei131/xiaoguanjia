use actix_web::{web, post, Responder, HttpResponse};
use reqwest::Client;
use crate::{DbPool, models::{WechatLoginRequest, LoginRequest, RegisterRequest, ChangePasswordRequest, ForgotPasswordRequest, LoginResponse, User, NewUser}};
use diesel::prelude::*;
use jsonwebtoken::{encode, Header, EncodingKey};
use std::env;
use argon2::{Argon2, PasswordHash, PasswordVerifier, PasswordHasher as _};
use argon2::password_hash::SaltString;
use chrono::Local;
use rand::thread_rng;

// 微信登录
#[post("/auth/wechat-login")]
pub async fn wechat_login(
    login_req: web::Json<WechatLoginRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    // 调用微信 API 获取 openid
    let client = Client::new();
    let app_id = env::var("WECHAT_APP_ID").unwrap_or("test_app_id".to_string());
    let app_secret = env::var("WECHAT_APP_SECRET").unwrap_or("test_app_secret".to_string());
    let url = format!("https://api.weixin.qq.com/sns/jscode2session?appid={}&secret={}&js_code={}&grant_type=authorization_code", app_id, app_secret, login_req.code);
    
    let response = client.get(&url).send().await.unwrap();
    let data: serde_json::Value = response.json().await.unwrap();
    let openid_val = data["openid"].as_str().unwrap_or("test_openid").to_string();
    
    // 检查用户是否存在，不存在则创建
    let mut conn = pool.get().unwrap();
    use crate::schema::users::dsl::*;
    
    let user_opt = users.filter(openid.eq(&openid_val)).first::<User>(&mut conn).optional().unwrap();
    
    let user = match user_opt {
        Some(u) => u,
        None => {
            let new_user = NewUser {
                openid: openid_val.clone(),
                nickname: None,
                avatar: None,
                email: format!("wechat_{}@example.com", openid_val),
                password_hash: "".to_string(),
                role: "user".to_string(),
                created_at: Local::now().naive_local(),
                updated_at: Local::now().naive_local(),
            };
            
            diesel::insert_into(users)
                .values(&new_user)
                .get_result::<User>(&mut conn)
                .unwrap()
        }
    };
    
    // 生成JWT token
    let token = encode(&Header::default(), &user.id, &EncodingKey::from_secret(b"secret")).unwrap();
    
    HttpResponse::Ok().json(serde_json::json!({
        "token": token,
        "user_id": user.id,
        "nickname": user.nickname,
        "avatar": user.avatar
    }))
}

// 网站登录
#[post("/auth/login")]
pub async fn login(
    login_req: web::Json<LoginRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::users::dsl::*;
    
    let user_opt = users.filter(email.eq(&login_req.email)).first::<User>(&mut conn).optional().unwrap();
    
    match user_opt {
        Some(user) => {
            if !user.password_hash.is_empty() {
                let argon2 = Argon2::default();
                let pwd_hash = PasswordHash::new(&user.password_hash).unwrap();
                if argon2.verify_password(login_req.password.as_bytes(), &pwd_hash).is_ok() {
                    let token = encode(&Header::default(), &user.id, &EncodingKey::from_secret(b"secret")).unwrap();
                    HttpResponse::Ok().json(LoginResponse {
                        token,
                        user_id: user.id,
                        email: user.email,
                        role: user.role,
                    })
                } else {
                    HttpResponse::Unauthorized().json(serde_json::json!({
                        "error": "Invalid password"
                    }))
                }
            } else {
                HttpResponse::Unauthorized().json(serde_json::json!({
                    "error": "Password not set"
                }))
            }
        }
        None => {
            HttpResponse::Unauthorized().json(serde_json::json!({
                "error": "User not found"
            }))
        }
    }
}

// 注册
#[post("/auth/register")]
pub async fn register(
    register_req: web::Json<RegisterRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::users::dsl::*;
    
    // 检查邮箱是否已存在
    if users.filter(email.eq(&register_req.email)).first::<User>(&mut conn).optional().unwrap().is_some() {
        return HttpResponse::BadRequest().json(serde_json::json!({
            "error": "Email already exists"
        }));
    }
    
    // 生成密码哈希
    let salt = SaltString::generate(&mut thread_rng());
    let argon2 = Argon2::default();
    let pwd_hash = argon2.hash_password(register_req.password.as_bytes(), &salt).unwrap().to_string();
    
    // 创建新用户
    let new_user = NewUser {
        openid: format!("web_{}", register_req.email),
        nickname: Some(register_req.nickname.clone()),
        avatar: None,
        email: register_req.email.clone(),
        password_hash: pwd_hash,
        role: "user".to_string(),
        created_at: Local::now().naive_local(),
        updated_at: Local::now().naive_local(),
    };
    
    let user = diesel::insert_into(users)
        .values(&new_user)
        .get_result::<User>(&mut conn)
        .unwrap();
    
    // 生成JWT token
    let token = encode(&Header::default(), &user.id, &EncodingKey::from_secret(b"secret")).unwrap();
    
    HttpResponse::Ok().json(LoginResponse {
        token,
        user_id: user.id,
        email: user.email,
        role: user.role,
    })
}

// 修改密码
#[post("/auth/change-password")]
pub async fn change_password(
    change_req: web::Json<ChangePasswordRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    // 从JWT token中获取用户ID
    // 这里简化处理，实际应该从请求头中获取token并解析
    let user_id = 1; // 临时值
    
    let mut conn = pool.get().unwrap();
    use crate::schema::users::dsl::*;
    
    let user = users.filter(id.eq(user_id)).first::<User>(&mut conn).unwrap();
    
    // 验证旧密码
    let argon2 = Argon2::default();
    let pwd_hash = PasswordHash::new(&user.password_hash).unwrap();
    if argon2.verify_password(change_req.old_password.as_bytes(), &pwd_hash).is_err() {
        return HttpResponse::Unauthorized().json(serde_json::json!({
            "error": "Invalid old password"
        }));
    }
    
    // 生成新密码哈希
    let salt = SaltString::generate(&mut thread_rng());
    let new_pwd_hash = argon2.hash_password(change_req.new_password.as_bytes(), &salt).unwrap().to_string();
    
    // 更新密码
    diesel::update(users.filter(id.eq(user_id)))
        .set(crate::schema::users::password_hash.eq(new_pwd_hash))
        .execute(&mut conn)
        .unwrap();
    
    HttpResponse::Ok().json(serde_json::json!({
        "success": true
    }))
}

// 找回密码
#[post("/auth/forgot-password")]
pub async fn forgot_password(
    forgot_req: web::Json<ForgotPasswordRequest>,
    pool: web::Data<DbPool>,
) -> impl Responder {
    let mut conn = pool.get().unwrap();
    use crate::schema::users::dsl::*;
    
    let user_opt = users.filter(email.eq(&forgot_req.email)).first::<User>(&mut conn).optional().unwrap();
    
    match user_opt {
        Some(_) => {
            // 这里应该发送重置密码邮件
            // 简化处理，直接返回成功
            HttpResponse::Ok().json(serde_json::json!({
                "success": true
            }))
        }
        None => {
            HttpResponse::BadRequest().json(serde_json::json!({
                "error": "User not found"
            }))
        }
    }
}