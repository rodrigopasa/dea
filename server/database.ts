import { drizzle } from 'drizzle-orm/node-postgres';
import pg from 'pg';
import * as schema from '@shared/schema';
import { sql } from 'drizzle-orm';

// Configure connection pool
const pool = new pg.Pool({
  connectionString: process.env.DATABASE_URL,
});

// Create drizzle instance
export const db = drizzle(pool, { schema });

// Initialize database tables
export async function initDatabase() {
  try {
    console.log('Initializing database...');
    
    // Create users table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "users" (
        "id" SERIAL PRIMARY KEY,
        "username" TEXT NOT NULL UNIQUE,
        "password" TEXT NOT NULL,
        "is_admin" BOOLEAN DEFAULT FALSE,
        "is_blocked" BOOLEAN DEFAULT FALSE,
        "name" TEXT,
        "email" TEXT,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create categories table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "categories" (
        "id" SERIAL PRIMARY KEY,
        "name" TEXT NOT NULL UNIQUE,
        "slug" TEXT NOT NULL UNIQUE,
        "icon" TEXT DEFAULT 'folder',
        "color" TEXT DEFAULT '#4f46e5'
      );
    `);
    
    // Create PDFs table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "pdfs" (
        "id" SERIAL PRIMARY KEY,
        "title" TEXT NOT NULL,
        "slug" TEXT NOT NULL,
        "description" TEXT NOT NULL,
        "file_path" TEXT NOT NULL,
        "file_hash" TEXT,
        "cover_image" TEXT,
        "page_count" INTEGER DEFAULT 0,
        "is_public" BOOLEAN DEFAULT TRUE,
        "views" INTEGER DEFAULT 0,
        "downloads" INTEGER DEFAULT 0,
        "likes_count" INTEGER DEFAULT 0,
        "dislikes_count" INTEGER DEFAULT 0,
        "total_ratings" INTEGER DEFAULT 0,
        "category_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create slug history table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "slug_history" (
        "id" SERIAL PRIMARY KEY,
        "old_slug" TEXT NOT NULL,
        "new_slug" TEXT NOT NULL,
        "pdf_id" INTEGER NOT NULL REFERENCES pdfs(id),
        "created_at" TIMESTAMP DEFAULT NOW(),
        "redirect_until" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create DMCA requests table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "dmca_requests" (
        "id" SERIAL PRIMARY KEY,
        "pdf_id" INTEGER NOT NULL,
        "requestor_name" TEXT NOT NULL,
        "requestor_email" TEXT NOT NULL,
        "reason" TEXT NOT NULL,
        "status" TEXT DEFAULT 'pending',
        "created_at" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create favorites table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "favorites" (
        "user_id" INTEGER NOT NULL,
        "pdf_id" INTEGER NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW(),
        PRIMARY KEY ("user_id", "pdf_id")
      );
    `);
    
    // Create comments table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "comments" (
        "id" SERIAL PRIMARY KEY,
        "pdf_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "content" TEXT NOT NULL,
        "page_number" INTEGER DEFAULT 1,
        "position" JSON DEFAULT '{}',
        "resolved" BOOLEAN DEFAULT FALSE,
        "created_at" TIMESTAMP DEFAULT NOW(),
        "updated_at" TIMESTAMP DEFAULT NOW(),
        "parent_id" INTEGER
      );
    `);
    
    // Create ratings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "ratings" (
        "id" SERIAL PRIMARY KEY,
        "pdf_id" INTEGER NOT NULL,
        "user_id" INTEGER NOT NULL,
        "is_positive" BOOLEAN NOT NULL,
        "created_at" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create SEO settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "seo_settings" (
        "id" SERIAL PRIMARY KEY,
        "site_title" TEXT NOT NULL DEFAULT 'PDFxandria',
        "site_description" TEXT NOT NULL DEFAULT 'Explore and download PDF documents',
        "site_keywords" TEXT NOT NULL DEFAULT 'pdf, documents, download, free',
        "og_image" TEXT NOT NULL DEFAULT '/generated-icon.png',
        "twitter_handle" TEXT DEFAULT '@pdfxandria',
        "google_verification" TEXT DEFAULT '',
        "bing_verification" TEXT DEFAULT '',
        "robots_txt" TEXT NOT NULL DEFAULT 'User-agent: *\nDisallow: /admin\nDisallow: /uploads/pdfs/\nAllow: /uploads/thumbnails/\nSitemap: /sitemap.xml',
        "ga_tracking_id" TEXT DEFAULT '',
        "pdf_title_format" TEXT NOT NULL DEFAULT '{title} - PDFxandria',
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    // Create site settings table
    await db.execute(sql`
      CREATE TABLE IF NOT EXISTS "site_settings" (
        "id" SERIAL PRIMARY KEY,
        "maintenance_mode" BOOLEAN DEFAULT FALSE,
        "allow_public_downloads" BOOLEAN DEFAULT TRUE,
        "require_email_for_download" BOOLEAN DEFAULT FALSE,
        "updated_at" TIMESTAMP DEFAULT NOW()
      );
    `);
    
    console.log('Database tables created successfully.');
    return true;
  } catch (error) {
    console.error('Error initializing database:', error);
    return false;
  }
}