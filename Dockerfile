# STAGE 1: Build Stage
# Este estágio instala todas as dependências (incluindo as de desenvolvimento)
# e compila a sua aplicação.
FROM node:20-alpine AS builder

# Instala as dependências de sistema necessárias para compilar módulos nativos (como o node-canvas).
# Elas NÃO estarão na imagem final de produção.
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    cairo-dev \
    jpeg-dev \
    pango-dev \
    musl-dev \
    giflib-dev \
    pixman-dev \
    pangomm-dev \
    libjpeg-turbo-dev \
    freetype-dev

# Define o diretório de trabalho no contêiner.
WORKDIR /app

# Copia os arquivos de pacote para aproveitar o cache do Docker.
COPY package*.json ./

# Instala todas as dependências (dev e prod) a partir do arquivo de lock.
RUN npm ci

# Copia o restante do código-fonte da aplicação.
COPY . .

# Compila a aplicação. Isso deve criar o diretório 'dist' com o código final.
RUN npm run build


# STAGE 2: Production Stage
# Este estágio cria a imagem final e otimizada, contendo apenas o necessário para rodar em produção.
FROM node:20-alpine

# Instala SOMENTE as dependências de sistema de RUNTIME (tempo de execução).
# Precisamos das bibliotecas, mas não dos pacotes '-dev'.
# 'curl' é para o healthcheck e 'dumb-init' para o gerenciamento correto de sinais do processo.
RUN apk add --no-cache \
    cairo \
    pango \
    libjpeg-turbo \
    giflib \
    pixman \
    freetype \
    curl \
    dumb-init

# Define o diretório de trabalho.
WORKDIR /app

# Copia os arquivos de pacote do contexto local.
COPY package*.json ./

# Instala APENAS as dependências de produção usando o arquivo de lock.
RUN npm ci --omit=dev

# Copia a aplicação compilada do estágio 'builder'.
COPY --from=builder /app/dist ./dist

# Cria um usuário e grupo não-root para maior segurança.
RUN addgroup -g 1001 -S nodejs && adduser -S nextjs -u 1001

# Altera a propriedade dos arquivos da aplicação para o usuário não-root.
RUN chown -R nextjs:nodejs /app

# Muda para o usuário não-root.
USER nextjs

# Expõe a porta em que a aplicação irá rodar.
# O Coolify irá injetar a variável de ambiente PORT.
EXPOSE ${PORT:-5000}

# Health check para garantir que a aplicação está saudável.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

# Comando para iniciar a aplicação, utilizando 'dumb-init'.
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
