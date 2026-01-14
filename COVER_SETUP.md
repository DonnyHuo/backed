# 封面图片自动生成配置

## 功能说明

当用户创建文章时，系统会自动根据文章标题生成一张封面图片。

## Cloudinary 配置（生产环境必需）

### 1. 注册 Cloudinary 账号

访问 [https://cloudinary.com/](https://cloudinary.com/) 注册免费账号。

### 2. 获取配置信息

登录后，在 Dashboard 可以看到：
- Cloud Name
- API Key
- API Secret

### 3. 配置环境变量

在 `.env` 文件中添加：

```env
CLOUDINARY_CLOUD_NAME=your-cloud-name
CLOUDINARY_API_KEY=your-api-key
CLOUDINARY_API_SECRET=your-api-secret
```

### 4. Vercel 环境变量配置

如果部署到 Vercel，需要在 Vercel 项目设置中添加以上三个环境变量。

## 开发环境

开发环境中，如果没有配置 Cloudinary，封面图片会保存到 `public/covers/` 目录。

**注意**：Vercel 等 Serverless 环境不支持本地文件存储，生产环境必须配置 Cloudinary。

## 封面生成特性

- **尺寸**：1200x630px（标准社交媒体图片尺寸）
- **样式**：根据文章标题自动生成渐变背景和颜色
- **文字**：自动换行，适配不同长度的标题
- **存储**：自动上传到 Cloudinary 或保存到本地

## 故障处理

如果封面生成失败，文章仍会正常创建（只是没有封面图片）。可以在后续手动上传封面。

