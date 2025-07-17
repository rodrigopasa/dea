-- Migração para adicionar a tabela seo_settings
CREATE TABLE IF NOT EXISTS "seo_settings" (
  "id" SERIAL PRIMARY KEY,
  "site_title" TEXT NOT NULL DEFAULT 'PDFShare',
  "site_description" TEXT NOT NULL DEFAULT 'Compartilhe e descubra documentos',
  "site_keywords" TEXT NOT NULL DEFAULT 'pdf, documentos, compartilhamento',
  "og_image" TEXT NOT NULL DEFAULT '/generated-icon.png',
  "twitter_handle" TEXT DEFAULT '@pdfshare',
  "google_verification" TEXT DEFAULT '',
  "bing_verification" TEXT DEFAULT '',
  "robots_txt" TEXT NOT NULL DEFAULT 'User-agent: *
Disallow: /admin
Disallow: /uploads/pdfs/
Allow: /uploads/thumbnails/
Sitemap: /sitemap.xml',
  "ga_tracking_id" TEXT DEFAULT '',
  "pdf_title_format" TEXT NOT NULL DEFAULT '${title} - PDFShare',
  "openai_api_key" TEXT DEFAULT '',
  "updated_at" TIMESTAMP DEFAULT NOW()
);

-- Inserir registro padrão se não existir
INSERT INTO "seo_settings" ("site_title", "site_description", "site_keywords", "og_image", "twitter_handle", "robots_txt", "pdf_title_format")
SELECT 'PDFxandria', 'Compartilhe e descubra documentos em PDF', 'pdf, documentos, compartilhamento, livros, educação', '/generated-icon.png', '@pdfxandria', 'User-agent: *
Disallow: /admin
Disallow: /uploads/pdfs/
Allow: /uploads/thumbnails/
Sitemap: /sitemap.xml', '${title} em PDF ou Leia Online'
WHERE NOT EXISTS (SELECT 1 FROM "seo_settings");