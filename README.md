# 小管家微信小程序

小管家是一款家庭物品管理微信小程序，帮助用户记录和管理家庭物品信息，包括物品名称、分类、数量、存放地点和保质期。

## 功能特性

- 物品信息录入，支持分批次录入保质期
- 物品分类管理，支持自定义分类
- 存放地点管理，支持自定义存放地点
- 临期物品提醒
- 物品搜索和筛选
- 物品编辑和删除

## 项目结构

```
xiaoguanjia/
├── frontend/           # 微信小程序前端
│   ├── app.json        # 小程序配置文件
│   ├── app.js          # 小程序入口文件
│   ├── app.wxss        # 全局样式文件
│   ├── pages/          # 页面目录
│   │   ├── index/       # 首页
│   │   ├── items/       # 物品列表页
│   │   ├── item-detail/ # 物品详情页
│   │   ├── add-item/    # 添加/编辑物品页
│   │   └── settings/    # 设置页
│   └── images/          # 图片资源
├── backend/            # Rust后端服务
│   ├── src/            # 源代码
│   │   ├── main.rs      # 后端入口文件
│   │   ├── models/      # 数据模型
│   │   ├── routes/      # API路由
│   │   ├── schema.rs    # 数据库表结构
│   │   └── utils/       # 工具函数
│   └── Cargo.toml       # 依赖管理
├── PRD.md              # 产品需求文档
├── Technical_Architecture.md # 技术架构文档
└── README.md           # 项目说明文档
```

## 技术栈

- 前端：微信小程序原生开发
- 后端：Rust + Rocket框架
- 数据库：PostgreSQL
- 缓存：Redis
- 认证：微信小程序登录
- 部署：Nginx反向代理

## 后端API

### 认证API
- `POST /api/auth/login` - 微信登录

### 物品API
- `GET /api/items` - 获取物品列表
- `GET /api/items/:id` - 获取物品详情
- `POST /api/items` - 添加物品
- `PUT /api/items/:id` - 更新物品
- `DELETE /api/items/:id` - 删除物品
- `GET /api/items/expiring` - 获取临期物品

### 分类API
- `GET /api/categories` - 获取分类列表
- `POST /api/categories` - 添加分类
- `PUT /api/categories/:id` - 更新分类
- `DELETE /api/categories/:id` - 删除分类

### 存放地点API
- `GET /api/locations` - 获取存放地点列表
- `POST /api/locations` - 添加存放地点
- `PUT /api/locations/:id` - 更新存放地点
- `DELETE /api/locations/:id` - 删除存放地点

## 部署说明

1. **前端部署**：
   - 在微信开发者工具中导入frontend目录
   - 配置小程序的AppID
   - 上传代码并发布

2. **后端部署**：
   - 配置PostgreSQL数据库
   - 设置环境变量：WECHAT_APP_ID和WECHAT_APP_SECRET
   - 编译Rust项目：`cargo build --release`
   - 启动后端服务
   - 配置Nginx反向代理

3. **数据库初始化**：
   - 运行数据库迁移脚本
   - 插入预设分类和存放地点数据

## 注意事项

- 确保微信小程序的request合法域名配置了后端API地址
- 确保后端服务的CORS配置正确
- 确保数据库连接配置正确
