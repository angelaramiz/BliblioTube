@echo off
REM Script de instalación rápida para BiblioTube en Windows

echo.
echo 🚀 Iniciando instalación de BiblioTube...
echo.

REM Verificar que Node.js está instalado
where node >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo ❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org
    pause
    exit /b 1
)

for /f "tokens=*" %%i in ('node --version') do set NODE_VERSION=%%i
echo ✅ Node.js encontrado: %NODE_VERSION%
echo.

REM Instalar dependencias
echo 📦 Instalando dependencias...
call npm install

REM Verificar Expo CLI
where expo >nul 2>nul
if %ERRORLEVEL% NEQ 0 (
    echo 📥 Instalando Expo CLI globalmente...
    call npm install -g expo-cli
)

for /f "tokens=*" %%i in ('expo --version') do set EXPO_VERSION=%%i
echo ✅ Expo CLI encontrado: %EXPO_VERSION%
echo.

REM Crear archivo de configuración
echo ⚙️ Creando archivo de configuración...
if not exist ".env.local" (
    copy .env.example .env.local
    echo ✅ Archivo .env.local creado
    echo ⚠️  IMPORTANTE: Edita .env.local con tus credenciales de Supabase
) else (
    echo ✅ Archivo .env.local ya existe
)

echo.
echo ✅ ¡Instalación completada!
echo.
echo 📝 Próximos pasos:
echo 1. Edita .env.local con tus credenciales de Supabase
echo 2. Configura las tablas en Supabase (ver SUPABASE_SETUP.md)
echo 3. Ejecuta: npm start
echo.
echo 🎉 ¡Listo para desarrollar!
echo.
pause
