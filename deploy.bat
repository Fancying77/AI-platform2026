@echo off
chcp 65001 >nul
REM 腾讯云服务器部署脚本 (Windows版本)
REM 使用方法：
REM 1. 修改下面的服务器信息
REM 2. 双击运行 deploy.bat

REM ========== 配置信息 ==========
set SERVER_IP=你的服务器IP
set SERVER_USER=root
set DEPLOY_PATH=/var/www/html
REM ==============================

echo ======================================
echo   产品AI工作平台 - 部署脚本
echo ======================================
echo.
echo 目标服务器: %SERVER_USER%@%SERVER_IP%
echo 部署路径: %DEPLOY_PATH%
echo.

REM 检查 dist 目录是否存在
if not exist "dist" (
    echo ❌ 错误: dist 目录不存在
    echo 请先运行: npm run build
    pause
    exit /b 1
)

echo 📦 开始上传文件...
scp -r dist/* %SERVER_USER%@%SERVER_IP%:%DEPLOY_PATH%/

if %errorlevel% equ 0 (
    echo.
    echo ✅ 部署成功！
    echo.
    echo 访问地址: http://%SERVER_IP%
    echo.
    echo 如果页面无法访问，请检查：
    echo 1. 服务器防火墙是否开放 80 端口
    echo 2. Nginx/Apache 是否正在运行
    echo 3. 文件权限是否正确
) else (
    echo.
    echo ❌ 部署失败
    echo 请检查：
    echo 1. 服务器IP和用户名是否正确
    echo 2. SSH密钥是否配置
    echo 3. 网络连接是否正常
    echo 4. 是否安装了 OpenSSH 或 Git Bash
)

echo.
pause
