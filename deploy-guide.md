# 腾讯云轻量服务器部署指南

## 部署文件
生产环境文件已构建完成，位于 `dist` 目录：
- index.html (入口文件)
- assets/ (CSS和JS文件)
- vite.svg (图标)

## 部署步骤

### 方式一：使用 SCP 上传（推荐）

1. **打开命令行，使用 SCP 上传文件到服务器：**
```bash
scp -r dist/* root@你的服务器IP:/var/www/html/
```

### 方式二：使用 FTP 工具
使用 FileZilla 或 WinSCP 等工具上传 dist 文件夹内容到服务器

### 方式三：使用腾讯云控制台
1. 登录腾讯云轻量应用服务器控制台
2. 使用文件管理功能上传 dist 文件夹内容

## 服务器配置

### 如果使用 Nginx：

1. **编辑 Nginx 配置文件：**
```bash
sudo nano /etc/nginx/sites-available/default
```

2. **添加以下配置：**
```nginx
server {
    listen 80;
    server_name 你的域名或IP;
    root /var/www/html;
    index index.html;

    location / {
        try_files $uri $uri/ /index.html;
    }

    # 静态资源缓存
    location /assets/ {
        expires 1y;
        add_header Cache-Control "public, immutable";
    }
}
```

3. **重启 Nginx：**
```bash
sudo nginx -t
sudo systemctl restart nginx
```

### 如果使用 Apache：

1. **创建 .htaccess 文件在 dist 目录：**
```apache
<IfModule mod_rewrite.c>
  RewriteEngine On
  RewriteBase /
  RewriteRule ^index\.html$ - [L]
  RewriteCond %{REQUEST_FILENAME} !-f
  RewriteCond %{REQUEST_FILENAME} !-d
  RewriteRule . /index.html [L]
</IfModule>
```

2. **重启 Apache：**
```bash
sudo systemctl restart apache2
```

## 快速部署脚本

创建 `deploy.sh` 文件用于快速部署：
```bash
#!/bin/bash
SERVER_IP="你的服务器IP"
SERVER_USER="root"
DEPLOY_PATH="/var/www/html"

echo "开始部署到腾讯云服务器..."
scp -r dist/* $SERVER_USER@$SERVER_IP:$DEPLOY_PATH/
echo "部署完成！"
echo "访问地址: http://$SERVER_IP"
```

## 验证部署
部署完成后，在浏览器访问：
- http://你的服务器IP
- 或 http://你的域名

## 常见问题

1. **页面刷新404错误**
   - 确保配置了 URL 重写规则（try_files 或 .htaccess）

2. **静态资源加载失败**
   - 检查文件权限：`sudo chmod -R 755 /var/www/html`
   - 检查 SELinux：`sudo setenforce 0`

3. **端口访问问题**
   - 在腾讯云控制台开放 80 和 443 端口
   - 检查防火墙：`sudo ufw allow 80`
