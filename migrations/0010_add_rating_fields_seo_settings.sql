-- Adicionar colunas avg_rating e total_ratings na tabela pdfs
ALTER TABLE pdfs ADD COLUMN avg_rating integer DEFAULT 0;
ALTER TABLE pdfs ADD COLUMN total_ratings integer DEFAULT 0;

-- Criar tabela seo_settings
CREATE TABLE IF NOT EXISTS seo_settings (
    id serial PRIMARY KEY,
    site_title text NOT NULL DEFAULT 'PDFShare',
    site_description text NOT NULL DEFAULT 'Compartilhe e descubra documentos',
    site_keywords text NOT NULL DEFAULT 'pdf, documentos, compartilhamento',
    og_image text NOT NULL DEFAULT '/generated-icon.png',
    twitter_handle text DEFAULT '@pdfshare',
    google_verification text DEFAULT '',
    bing_verification text DEFAULT '',
    robots_txt text NOT NULL DEFAULT 'User-agent: *
Disallow: /admin
Disallow: /uploads/pdfs/
Allow: /uploads/thumbnails/
Sitemap: /sitemap.xml',
    ga_tracking_id text DEFAULT '',
    pdf_title_format text NOT NULL DEFAULT '${title} - PDFShare',
    openai_api_key text DEFAULT '',
    updated_at timestamp DEFAULT CURRENT_TIMESTAMP
);

-- Inserir configuração padrão de SEO
INSERT INTO seo_settings (site_title, site_description) 
VALUES ('PDFxandria - Compartilhe documentos online', 'Plataforma completa para armazenar, compartilhar e descobrir documentos em PDF')
ON CONFLICT DO NOTHING;