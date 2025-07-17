-- Criação da tabela de histórico de slugs para redirecionamento
CREATE TABLE IF NOT EXISTS "slug_history" (
    "id" SERIAL PRIMARY KEY,
    "old_slug" TEXT NOT NULL,
    "new_slug" TEXT NOT NULL,
    "pdf_id" INTEGER NOT NULL,
    "created_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    "redirect_until" TIMESTAMP DEFAULT (CURRENT_TIMESTAMP + INTERVAL '1 year')
);

-- Índices para otimizar consultas
CREATE INDEX IF NOT EXISTS "slug_history_old_slug_idx" ON "slug_history" ("old_slug");
CREATE INDEX IF NOT EXISTS "slug_history_pdf_id_idx" ON "slug_history" ("pdf_id");