CREATE TABLE "favorites" (
	"user_id" integer NOT NULL,
	"pdf_id" integer NOT NULL,
	"created_at" timestamp DEFAULT now(),
	CONSTRAINT "favorites_user_id_pdf_id_pk" PRIMARY KEY("user_id","pdf_id")
);
--> statement-breakpoint
CREATE TABLE "seo_settings" (
	"id" serial PRIMARY KEY NOT NULL,
	"site_title" text DEFAULT 'PDFShare' NOT NULL,
	"site_description" text DEFAULT 'Compartilhe e descubra documentos' NOT NULL,
	"site_keywords" text DEFAULT 'pdf, documentos, compartilhamento' NOT NULL,
	"og_image" text DEFAULT '/generated-icon.png' NOT NULL,
	"twitter_handle" text DEFAULT '@pdfshare',
	"google_verification" text DEFAULT '',
	"bing_verification" text DEFAULT '',
	"robots_txt" text DEFAULT 'User-agent: *
Disallow: /admin
Disallow: /uploads/pdfs/
Allow: /uploads/thumbnails/
Sitemap: /sitemap.xml' NOT NULL,
	"ga_tracking_id" text DEFAULT '',
	"pdf_title_format" text DEFAULT '${title} - PDFShare' NOT NULL,
	"updated_at" timestamp DEFAULT now()
);
--> statement-breakpoint
ALTER TABLE "pdfs" ADD COLUMN "page_count" integer DEFAULT 0;