# STAGE 1: Build Stage
# Trocamos para a imagem 'slim' (base Debian), que tem mais pacotes disponíveis.
FROM node:20-slim AS builder

# Instala as dependências de sistema para Debian/Ubuntu.
# Usamos 'apt-get' e os nomes de pacotes são diferentes.
RUN apt-get update && apt-get install -y --no-install-recommends \
    python3 \
    make \
    g++ \
    libcairo2-dev \
    libpango1.0-dev \
    libjpeg-dev \
    libgif-dev \
    librsvg2-dev

# Define o diretório de trabalho no contêiner.
WORKDIR /app

# Copia os arquivos de pacote para aproveitar o cache do Docker.
COPY package*.json ./

# Instala todas as dependências (dev e prod) a partir do arquivo de lock.
RUN npm ci

# Copia o restante do código-fonte da aplicação.
COPY . .

# Compila a aplicação.
RUN npm run build

# Remove as dependências de desenvolvimento para a cópia no próximo estágio.
RUN npm prune --production


# STAGE 2: Production Stage
# Este estágio cria a imagem final e otimizada, contendo apenas o necessário para rodar em produção.
FROM node:20-slim

# Instala as dependências de sistema de RUNTIME para Debian.
# pdftk agora está disponível como 'pdftk-java'.
RUN apt-get update && apt-get install -y --no-install-recommends \
    libcairo2 \
    libpango-1.0-0 \
    libjpeg62-turbo \
    libgif7 \
    curl \
    dumb-init \
    pdftk-java \
    poppler-utils \
    && apt-get clean && rm -rf /var/lib/apt/lists/*

# Define o diretório de trabalho.
WORKDIR /app

# Copia os arquivos de pacote do estágio builder.
COPY --from=builder /app/package*.json ./

# Copia o arquivo de configuração do Drizzle.
COPY --from=builder /app/drizzle.config.* ./

# Copia as dependências de produção já compiladas do estágio builder.
COPY --from=builder /app/node_modules ./node_modules

# Copia a aplicação compilada e a pasta 'shared' (que contém o schema).
COPY --from=builder /app/dist ./dist
COPY --from=builder /app/shared ./shared

# --- INÍCIO DA CORREÇÃO DE PERMISSÕES ---

# 1. Cria explicitamente todos os diretórios de upload.
RUN mkdir -p /app/uploads/pdfs && \
    mkdir -p /app/uploads/thumbnails && \
    mkdir -p /app/uploads/avatars && \
    mkdir -p /app/uploads/pdf-edits && \
    mkdir -p /app/uploads/temp

# 2. Cria um usuário e grupo não-root (sintaxe para Debian).
RUN addgroup --system --gid 1001 nodejs && adduser --system --uid 1001 --gid 1001 nextjs

# 3. Altera a propriedade de TODA a pasta /app, incluindo os diretórios de upload recém-criados.
RUN chown -R nextjs:nodejs /app

# 4. Muda para o usuário não-root.
USER nextjs

# --- FIM DA CORREÇÃO DE PERMISSÕES ---

# Define volumes separados para cada tipo de upload para armazenamento persistente.
# O Coolify irá mapear cada um destes para o armazenamento do host.
VOLUME ["/app/uploads/pdfs", "/app/uploads/thumbnails", "/app/uploads/avatars", "/app/uploads/pdf-edits", "/app/uploads/temp"]

# Expõe a porta em que a aplicação irá rodar.
EXPOSE ${PORT:-5000}

# Health check para garantir que a aplicação está saudável.
HEALTHCHECK --interval=30s --timeout=10s --start-period=40s --retries=5 \
  CMD curl -f http://localhost:${PORT:-5000}/health || exit 1

# Comando para iniciar a aplicação, utilizando 'dumb-init'.
ENTRYPOINT ["dumb-init", "--"]
CMD ["npm", "start"]
