#!/bin/bash
# Script de instalación rápida para BiblioTube

echo "🚀 Iniciando instalación de BiblioTube..."
echo ""

# Verificar que Node.js está instalado
if ! command -v node &> /dev/null; then
    echo "❌ Node.js no está instalado. Por favor instala Node.js desde https://nodejs.org"
    exit 1
fi

echo "✅ Node.js encontrado: $(node --version)"
echo ""

# Instalar dependencias
echo "📦 Instalando dependencias..."
npm install

# Verificar Expo CLI
if ! command -v expo &> /dev/null; then
    echo "📥 Instalando Expo CLI globalmente..."
    npm install -g expo-cli
fi

echo "✅ Expo CLI encontrado: $(expo --version)"
echo ""

# Crear archivo de configuración
echo "⚙️ Creando archivo de configuración..."
if [ ! -f ".env.local" ]; then
    cp .env.example .env.local
    echo "✅ Archivo .env.local creado"
    echo "⚠️  IMPORTANTE: Edita .env.local con tus credenciales de Supabase"
else
    echo "✅ Archivo .env.local ya existe"
fi

echo ""
echo "✅ ¡Instalación completada!"
echo ""
echo "📝 Próximos pasos:"
echo "1. Edita .env.local con tus credenciales de Supabase"
echo "2. Configura las tablas en Supabase (ver SUPABASE_SETUP.md)"
echo "3. Ejecuta: npm start"
echo ""
echo "🎉 ¡Listo para desarrollar!"
