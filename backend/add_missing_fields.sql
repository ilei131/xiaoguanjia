-- 添加email字段
ALTER TABLE users ADD COLUMN email VARCHAR(255) NOT NULL DEFAULT '';

-- 添加password_hash字段
ALTER TABLE users ADD COLUMN password_hash VARCHAR(255) NOT NULL DEFAULT '';

-- 添加role字段
ALTER TABLE users ADD COLUMN role VARCHAR(50) NOT NULL DEFAULT 'user';

-- 创建email索引
CREATE INDEX IF NOT EXISTS users_email_idx ON users(email);
