#!/bin/bash

# Script de inicialização para produção
set -e

echo "🚀 Iniciando aplicação em modo produção..."

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL não está definida"
    echo "💡 Configure DATABASE_URL antes de continuar"
    exit 1
fi

# Verificar se NODE_ENV está definido
if [ -z "$NODE_ENV" ]; then
    echo "⚠️  NODE_ENV não definido, usando 'production'"
    export NODE_ENV=production
fi

# Verificar se PORT está definido
if [ -z "$PORT" ]; then
    echo "⚠️  PORT não definido, usando 5000"
    export PORT=5000
fi

echo "🔧 Configurações:"
echo "   NODE_ENV: $NODE_ENV"
echo "   PORT: $PORT"
echo "   DATABASE_URL: $(echo $DATABASE_URL | sed 's/.*@/****@/')"

# Verificar se arquivo de build existe
if [ ! -f "dist/index.js" ]; then
    echo "❌ Arquivo de build não encontrado em dist/index.js"
    echo "💡 Execute 'npm run build' primeiro"
    exit 1
fi

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p uploads/{pdfs,thumbnails,avatars,temp,pdf-edits}

# Executar migrações do banco (opcional - a aplicação faz isso automaticamente)
echo "🗄️  Aplicando migrações do banco..."
npm run db:push || echo "⚠️  Migrações falharam - aplicação tentará criar tabelas automaticamente"

# Iniciar aplicação
echo "🎯 Iniciando aplicação..."
echo "📍 Aplicação estará disponível em http://localhost:$PORT"
echo "🔍 Health check: http://localhost:$PORT/health"

# Usar exec para substituir o processo shell pelo node
exec node dist/index.js
