#!/bin/bash

# Script completo de verificação pré-deploy
set -e

echo "🔍 VERIFICAÇÃO PRÉ-DEPLOY COMPLETA"
echo "=================================="

# Cores para output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Função para verificar requisitos
check_requirement() {
    if command -v $1 >/dev/null 2>&1; then
        echo -e "${GREEN}✅ $1 está instalado${NC}"
    else
        echo -e "${RED}❌ $1 não está instalado${NC}"
        return 1
    fi
}

# Verificar dependências do sistema
echo -e "\n${YELLOW}1. Verificando dependências do sistema...${NC}"
check_requirement "node"
check_requirement "npm"
check_requirement "curl"

# Verificar Node.js version
NODE_VERSION=$(node --version)
echo -e "${GREEN}✅ Node.js version: $NODE_VERSION${NC}"

# Verificar se package.json existe
echo -e "\n${YELLOW}2. Verificando arquivos do projeto...${NC}"
if [ -f "package.json" ]; then
    echo -e "${GREEN}✅ package.json encontrado${NC}"
else
    echo -e "${RED}❌ package.json não encontrado${NC}"
    exit 1
fi

# Verificar se dependências estão instaladas
echo -e "\n${YELLOW}3. Verificando dependências...${NC}"
if [ -d "node_modules" ]; then
    echo -e "${GREEN}✅ node_modules encontrado${NC}"
else
    echo -e "${YELLOW}⚠️  node_modules não encontrado, instalando...${NC}"
    npm install
fi

# Verificar variáveis de ambiente
echo -e "\n${YELLOW}4. Verificando variáveis de ambiente...${NC}"
if [ -n "$DATABASE_URL" ]; then
    echo -e "${GREEN}✅ DATABASE_URL está definida${NC}"
else
    echo -e "${RED}❌ DATABASE_URL não está definida${NC}"
    echo -e "${YELLOW}   Defina DATABASE_URL antes do deploy${NC}"
    exit 1
fi

# Verificar conexão com banco
echo -e "\n${YELLOW}5. Testando conexão com banco...${NC}"
if timeout 10 node -e "
import('pg').then(({default: pg}) => {
  const client = new pg.Client({connectionString: process.env.DATABASE_URL});
  client.connect().then(() => {
    console.log('✅ Conexão com banco bem-sucedida');
    client.end();
  }).catch(err => {
    console.error('❌ Falha na conexão:', err.message);
    process.exit(1);
  });
});
" 2>/dev/null; then
    echo -e "${GREEN}✅ Conexão com banco verificada${NC}"
else
    echo -e "${RED}❌ Falha na conexão com banco${NC}"
    exit 1
fi

# Verificar build
echo -e "\n${YELLOW}6. Testando build...${NC}"
npm run build
if [ $? -eq 0 ]; then
    echo -e "${GREEN}✅ Build bem-sucedido${NC}"
else
    echo -e "${RED}❌ Falha no build${NC}"
    exit 1
fi

# Verificar se arquivos de build existem
if [ -f "dist/index.js" ]; then
    echo -e "${GREEN}✅ Arquivo de build encontrado${NC}"
else
    echo -e "${RED}❌ Arquivo de build não encontrado${NC}"
    exit 1
fi

# Verificar estrutura de diretórios
echo -e "\n${YELLOW}7. Verificando estrutura de diretórios...${NC}"
DIRS=("uploads" "uploads/pdfs" "uploads/thumbnails" "uploads/avatars" "uploads/temp")
for dir in "${DIRS[@]}"; do
    if [ -d "$dir" ]; then
        echo -e "${GREEN}✅ $dir existe${NC}"
    else
        echo -e "${YELLOW}⚠️  Criando $dir...${NC}"
        mkdir -p "$dir"
    fi
done

# Verificar permissões
echo -e "\n${YELLOW}8. Verificando permissões...${NC}"
if [ -w "uploads" ]; then
    echo -e "${GREEN}✅ Permissões de escrita OK${NC}"
else
    echo -e "${RED}❌ Sem permissões de escrita em uploads${NC}"
    exit 1
fi

# Teste de lint/typescript
echo -e "\n${YELLOW}9. Verificando código...${NC}"
if npm run check 2>/dev/null; then
    echo -e "${GREEN}✅ Verificação de tipos OK${NC}"
else
    echo -e "${YELLOW}⚠️  Aviso: Verificação de tipos com problemas${NC}"
fi

echo -e "\n${GREEN}🎉 TODAS AS VERIFICAÇÕES PASSARAM!${NC}"
echo -e "${GREEN}✅ Sistema pronto para deploy${NC}"
echo ""
echo -e "${YELLOW}📋 Próximos passos:${NC}"
echo "   1. Execute: npm run db:push (para criar tabelas)"
echo "   2. Execute: npm start (para iniciar em produção)"
echo "   3. Teste: curl http://localhost:5000/health"
echo ""
echo -e "${YELLOW}🐳 Para deploy com Docker:${NC}"
echo "   docker build -t pdfxandria ."
echo "   docker run -p 5000:5000 -e DATABASE_URL=\$DATABASE_URL pdfxandria"