-- Cria tabela para configurações gerais do site
CREATE TABLE IF NOT EXISTS "site_settings" (
  "id" SERIAL PRIMARY KEY,
  "maintenance_mode" BOOLEAN DEFAULT FALSE,
  "allow_registration" BOOLEAN DEFAULT TRUE,
  "allow_public_uploads" BOOLEAN DEFAULT TRUE,
  "require_approval" BOOLEAN DEFAULT FALSE,
  "require_email_verification" BOOLEAN DEFAULT TRUE,
  "updated_at" TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações padrão se a tabela estiver vazia
INSERT INTO "site_settings" ("maintenance_mode", "allow_registration", "allow_public_uploads", "require_approval", "require_email_verification")
SELECT FALSE, TRUE, TRUE, FALSE, TRUE
WHERE NOT EXISTS (SELECT 1 FROM "site_settings" LIMIT 1);