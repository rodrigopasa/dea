#!/bin/sh
# O 'set -e' garante que o script irá parar se algum comando falhar.
set -e

# Mensagem para o log, para sabermos que o script está rodando.
echo "Running entrypoint script to fix volume permissions..."

# Altera o dono de todos os diretórios de upload para o usuário 'nextjs'.
# Isso é crucial porque o volume é montado com o dono 'root' por padrão.
chown -R nextjs:nodejs /app/uploads

echo "Permissions applied successfully to /app/uploads."

# O comando 'exec "$@"' executa o comando principal que foi passado para o script.
# No nosso caso, será "npm start" (definido no CMD do Dockerfile).
exec "$@"
