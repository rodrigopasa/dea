import { db } from './database';
import { sql } from 'drizzle-orm';

async function createTables() {
  try {
    // Usuários
    console.log('Criando tabela de usuários...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        username TEXT NOT NULL UNIQUE,
        password TEXT,
        is_admin BOOLEAN DEFAULT FALSE,
        is_blocked BOOLEAN DEFAULT FALSE,
        storage_limit INTEGER DEFAULT 1073741824,
        storage_used INTEGER DEFAULT 0,
        name TEXT,
        email TEXT UNIQUE,
        avatar TEXT,
        bio TEXT,
        google_id TEXT UNIQUE,
        google_access_token TEXT,
        google_refresh_token TEXT,
        google_token_expiry TIMESTAMP WITH TIME ZONE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Categorias
    console.log('Criando tabela de categorias...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS categories (
        id SERIAL PRIMARY KEY,
        name TEXT NOT NULL UNIQUE,
        slug TEXT NOT NULL UNIQUE,
        icon TEXT DEFAULT 'folder',
        color TEXT DEFAULT '#4f46e5'
      );
    `);

    // PDFs
    console.log('Criando tabela de PDFs...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS pdfs (
        id SERIAL PRIMARY KEY,
        title TEXT NOT NULL,
        slug TEXT NOT NULL,
        description TEXT NOT NULL,
        file_path TEXT NOT NULL,
        file_hash TEXT,
        cover_image TEXT,
        page_count INTEGER DEFAULT 0,
        is_public BOOLEAN DEFAULT TRUE,
        is_approved BOOLEAN DEFAULT TRUE,
        views INTEGER DEFAULT 0,
        downloads INTEGER DEFAULT 0,
        likes_count INTEGER DEFAULT 0,
        dislikes_count INTEGER DEFAULT 0,
        total_ratings INTEGER DEFAULT 0,
        category_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // DMCA Requests
    console.log('Criando tabela de solicitações DMCA...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS dmca_requests (
        id SERIAL PRIMARY KEY,
        pdf_id INTEGER NOT NULL,
        requestor_name TEXT NOT NULL,
        requestor_email TEXT NOT NULL,
        reason TEXT NOT NULL,
        status TEXT DEFAULT 'pending',
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Favoritos
    console.log('Criando tabela de favoritos...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS favorites (
        user_id INTEGER NOT NULL,
        pdf_id INTEGER NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        PRIMARY KEY (user_id, pdf_id)
      );
    `);

    // Comentários
    console.log('Criando tabela de comentários...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS comments (
        id SERIAL PRIMARY KEY,
        pdf_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        content TEXT NOT NULL,
        page_number INTEGER DEFAULT 1,
        position JSONB DEFAULT '{}',
        resolved BOOLEAN DEFAULT FALSE,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        parent_id INTEGER
      );
    `);

    // Avaliações
    console.log('Criando tabela de avaliações...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ratings (
        id SERIAL PRIMARY KEY,
        pdf_id INTEGER NOT NULL,
        user_id INTEGER NOT NULL,
        is_positive BOOLEAN NOT NULL,
        created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
        UNIQUE(user_id, pdf_id)
      );
    `);

    // SEO Settings
    console.log('Criando tabela de configurações SEO...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS seo_settings (
        id SERIAL PRIMARY KEY,
        site_title TEXT NOT NULL DEFAULT 'PDFShare',
        site_description TEXT NOT NULL DEFAULT 'Compartilhe e descubra documentos',
        site_keywords TEXT NOT NULL DEFAULT 'pdf, documentos, compartilhamento',
        og_image TEXT NOT NULL DEFAULT '/generated-icon.png',
        twitter_handle TEXT DEFAULT '@pdfshare',
        google_verification TEXT DEFAULT '',
        bing_verification TEXT DEFAULT '',
        robots_txt TEXT NOT NULL DEFAULT 'User-agent: *
Disallow: /admin
Disallow: /uploads/pdfs/
Allow: /uploads/thumbnails/
Sitemap: /sitemap.xml',
        ga_tracking_id TEXT DEFAULT '',
        pdf_title_format TEXT NOT NULL DEFAULT '{title} - PDFShare',
        openai_api_key TEXT DEFAULT '',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ad Settings
    console.log('Criando tabela de configurações de anúncios...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS ad_settings (
        id SERIAL PRIMARY KEY,
        enabled BOOLEAN DEFAULT FALSE,
        provider TEXT DEFAULT 'adsense',
        ad_client TEXT,
        positions JSONB DEFAULT '{"home_top": {"enabled": false, "adSlot": ""}, "home_middle": {"enabled": false, "adSlot": ""}, "home_bottom": {"enabled": false, "adSlot": ""}, "sidebar_top": {"enabled": false, "adSlot": ""}, "sidebar_bottom": {"enabled": false, "adSlot": ""}, "pdf_details_before_content": {"enabled": false, "adSlot": ""}, "pdf_details_after_content": {"enabled": false, "adSlot": ""}, "category_top": {"enabled": false, "adSlot": ""}, "search_results_inline": {"enabled": false, "adSlot": ""}}',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Auth Settings
    console.log('Criando tabela de configurações de autenticação...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS auth_settings (
        id SERIAL PRIMARY KEY,
        google_enabled BOOLEAN DEFAULT FALSE,
        google_client_id TEXT DEFAULT '',
        google_client_secret TEXT DEFAULT '',
        google_callback_url TEXT DEFAULT '/api/auth/google/callback',
        email_enabled BOOLEAN DEFAULT FALSE,
        email_service TEXT DEFAULT 'smtp',
        email_host TEXT DEFAULT '',
        email_port INTEGER DEFAULT 587,
        email_user TEXT DEFAULT '',
        email_password TEXT DEFAULT '',
        email_from TEXT DEFAULT '',
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Site Settings
    console.log('Criando tabela de configurações do site...');
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS site_settings (
        id SERIAL PRIMARY KEY,
        maintenance_mode BOOLEAN DEFAULT FALSE,
        allow_registration BOOLEAN DEFAULT TRUE,
        allow_public_uploads BOOLEAN DEFAULT TRUE,
        require_approval BOOLEAN DEFAULT FALSE,
        require_email_verification BOOLEAN DEFAULT TRUE,
        updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
      );
    `);



    console.log('Todas as tabelas criadas com sucesso!');
  } catch (error) {
    console.error('Erro ao criar tabelas:', error);
    throw error;
  }
}

createTables()
  .then(() => {
    console.log('Scripts de criação de tabelas executados com sucesso!');
    process.exit(0);
  })
  .catch((error) => {
    console.error('Erro durante a execução dos scripts:', error);
    process.exit(1);
  });