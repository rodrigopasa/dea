#!/bin/bash

# Script de inicialização para produção
set -e

echo "🚀 Iniciando aplicação em modo produção..."

# Verificar se DATABASE_URL está definida
if [ -z "$DATABASE_URL" ]; then
    echo "❌ ERROR: DATABASE_URL não está definida"
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

# Criar diretórios necessários
echo "📁 Criando diretórios necessários..."
mkdir -p uploads/{pdfs,thumbnails,avatars,temp,pdf-edits}

# Executar migrações do banco
echo "🗄️  Executando migrações do banco..."
npm run db:push

# Aguardar o banco estar pronto
echo "⏳ Aguardando banco de dados..."
timeout 30 bash -c 'until curl -f http://localhost:$PORT/health > /dev/null 2>&1; do sleep 1; done' || echo "Timeout aguardando health check"

# Iniciar aplicação
echo "🎯 Iniciando aplicação..."
exec node server/index.js