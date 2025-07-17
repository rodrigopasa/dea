CREATE TABLE IF NOT EXISTS "users" (
  "id" SERIAL PRIMARY KEY,
  "username" TEXT NOT NULL UNIQUE,
  "password" TEXT NOT NULL,
  "is_admin" BOOLEAN DEFAULT FALSE
);

CREATE TABLE IF NOT EXISTS "categories" (
  "id" SERIAL PRIMARY KEY,
  "name" TEXT NOT NULL UNIQUE,
  "slug" TEXT NOT NULL UNIQUE
);

CREATE TABLE IF NOT EXISTS "pdfs" (
  "id" SERIAL PRIMARY KEY,
  "title" TEXT NOT NULL,
  "slug" TEXT NOT NULL,
  "description" TEXT NOT NULL,
  "file_path" TEXT NOT NULL,
  "cover_image" TEXT,
  "page_count" INTEGER DEFAULT 0,
  "is_public" BOOLEAN DEFAULT TRUE,
  "views" INTEGER DEFAULT 0,
  "downloads" INTEGER DEFAULT 0,
  "category_id" INTEGER NOT NULL,
  "user_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "dmca_requests" (
  "id" SERIAL PRIMARY KEY,
  "pdf_id" INTEGER NOT NULL,
  "requestor_name" TEXT NOT NULL,
  "requestor_email" TEXT NOT NULL,
  "reason" TEXT NOT NULL,
  "status" TEXT DEFAULT 'pending',
  "created_at" TIMESTAMP DEFAULT NOW()
);

CREATE TABLE IF NOT EXISTS "favorites" (
  "user_id" INTEGER NOT NULL,
  "pdf_id" INTEGER NOT NULL,
  "created_at" TIMESTAMP DEFAULT NOW(),
  PRIMARY KEY ("user_id", "pdf_id")
);

CREATE TABLE IF NOT EXISTS "session" (
  "sid" TEXT NOT NULL PRIMARY KEY,
  "sess" JSON NOT NULL,
  "expire" TIMESTAMP(6) NOT NULL
);