@echo off
chcp 65001 >nul
echo ========================================
echo Claude Desktop 配置文件创建工具
echo ========================================
echo.

REM 检查 Claude 文件夹是否存在
set CLAUDE_DIR=%APPDATA%\Claude
if not exist "%CLAUDE_DIR%" (
    echo [错误] Claude 文件夹不存在: %CLAUDE_DIR%
    echo 请确保已安装 Claude Desktop
    pause
    exit /b 1
)

echo [信息] Claude 文件夹路径: %CLAUDE_DIR%
echo.

REM 检查配置文件是否已存在
set CONFIG_FILE=%CLAUDE_DIR%\claude_desktop_config.json
if exist "%CONFIG_FILE%" (
    echo [警告] 配置文件已存在！
    echo 路径: %CONFIG_FILE%
    echo.
    choice /C YN /M "是否覆盖现有配置文件？(Y=是, N=否)"
    if errorlevel 2 (
        echo [取消] 保留现有配置文件
        pause
        exit /b 0
    )
    echo [信息] 将覆盖现有配置文件
)

echo.
echo 请选择数据库类型:
echo 1. MySQL
echo 2. PostgreSQL
echo 3. Redis
echo 4. 空配置（稍后手动编辑）
echo.
choice /C 1234 /N /M "请输入选项 (1-4): "

if errorlevel 4 goto EMPTY_CONFIG
if errorlevel 3 goto REDIS_CONFIG
if errorlevel 2 goto POSTGRES_CONFIG
if errorlevel 1 goto MYSQL_CONFIG

:MYSQL_CONFIG
echo.
echo [MySQL 配置]
set /p DB_HOST="数据库主机 (默认: localhost): " || set DB_HOST=localhost
set /p DB_PORT="数据库端口 (默认: 3306): " || set DB_PORT=3306
set /p DB_USER="用户名 (默认: root): " || set DB_USER=root
set /p DB_PASS="密码: "
set /p DB_NAME="数据库名: "

(
echo {
echo   "mcpServers": {
echo     "mysql-db": {
echo       "command": "npx",
echo       "args": [
echo         "universal-db-mcp",
echo         "--type", "mysql",
echo         "--host", "%DB_HOST%",
echo         "--port", "%DB_PORT%",
echo         "--user", "%DB_USER%",
echo         "--password", "%DB_PASS%",
echo         "--database", "%DB_NAME%"
echo       ]
echo     }
echo   }
echo }
) > "%CONFIG_FILE%"
goto SUCCESS

:POSTGRES_CONFIG
echo.
echo [PostgreSQL 配置]
set /p DB_HOST="数据库主机 (默认: localhost): " || set DB_HOST=localhost
set /p DB_PORT="数据库端口 (默认: 5432): " || set DB_PORT=5432
set /p DB_USER="用户名 (默认: postgres): " || set DB_USER=postgres
set /p DB_PASS="密码: "
set /p DB_NAME="数据库名: "

(
echo {
echo   "mcpServers": {
echo     "postgres-db": {
echo       "command": "npx",
echo       "args": [
echo         "universal-db-mcp",
echo         "--type", "postgres",
echo         "--host", "%DB_HOST%",
echo         "--port", "%DB_PORT%",
echo         "--user", "%DB_USER%",
echo         "--password", "%DB_PASS%",
echo         "--database", "%DB_NAME%"
echo       ]
echo     }
echo   }
echo }
) > "%CONFIG_FILE%"
goto SUCCESS

:REDIS_CONFIG
echo.
echo [Redis 配置]
set /p DB_HOST="Redis 主机 (默认: localhost): " || set DB_HOST=localhost
set /p DB_PORT="Redis 端口 (默认: 6379): " || set DB_PORT=6379
set /p DB_PASS="密码 (可选，直接回车跳过): "

if "%DB_PASS%"=="" (
    REM 无密码配置
    (
    echo {
    echo   "mcpServers": {
    echo     "redis-cache": {
    echo       "command": "npx",
    echo       "args": [
    echo         "universal-db-mcp",
    echo         "--type", "redis",
    echo         "--host", "%DB_HOST%",
    echo         "--port", "%DB_PORT%"
    echo       ]
    echo     }
    echo   }
    echo }
    ) > "%CONFIG_FILE%"
) else (
    REM 有密码配置
    (
    echo {
    echo   "mcpServers": {
    echo     "redis-cache": {
    echo       "command": "npx",
    echo       "args": [
    echo         "universal-db-mcp",
    echo         "--type", "redis",
    echo         "--host", "%DB_HOST%",
    echo         "--port", "%DB_PORT%",
    echo         "--password", "%DB_PASS%"
    echo       ]
    echo     }
    echo   }
    echo }
    ) > "%CONFIG_FILE%"
)
goto SUCCESS

:EMPTY_CONFIG
(
echo {
echo   "mcpServers": {}
echo }
) > "%CONFIG_FILE%"
echo [信息] 已创建空配置文件，请手动编辑
goto SUCCESS

:SUCCESS
echo.
echo ========================================
echo [成功] 配置文件已创建！
echo ========================================
echo 文件路径: %CONFIG_FILE%
echo.
echo 下一步操作:
echo 1. 重启 Claude Desktop
echo 2. 在对话中测试数据库连接
echo.
choice /C YN /M "是否现在打开配置文件查看？(Y=是, N=否)"
if errorlevel 2 goto END
notepad "%CONFIG_FILE%"

:END
echo.
echo 感谢使用！
pause
