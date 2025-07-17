-- Adicionar tabela de configurações de anúncios
CREATE TABLE IF NOT EXISTS "ad_settings" (
  "id" SERIAL PRIMARY KEY,
  "enabled" BOOLEAN DEFAULT FALSE,
  "provider" TEXT DEFAULT 'adsense',
  "ad_client" TEXT,
  "positions" JSONB DEFAULT '{
    "home_top": {"enabled": false, "adSlot": ""},
    "home_middle": {"enabled": false, "adSlot": ""},
    "home_bottom": {"enabled": false, "adSlot": ""},
    "sidebar_top": {"enabled": false, "adSlot": ""},
    "sidebar_bottom": {"enabled": false, "adSlot": ""},
    "pdf_details_before_content": {"enabled": false, "adSlot": ""},
    "pdf_details_after_content": {"enabled": false, "adSlot": ""},
    "category_top": {"enabled": false, "adSlot": ""},
    "search_results_inline": {"enabled": false, "adSlot": ""}
  }',
  "updated_at" TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configurações iniciais, se a tabela estiver vazia
INSERT INTO "ad_settings" ("id", "enabled", "provider", "ad_client")
SELECT 1, FALSE, 'adsense', ''
WHERE NOT EXISTS (SELECT 1 FROM "ad_settings");