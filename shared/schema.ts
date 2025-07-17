import { pgTable, text, serial, integer, boolean, timestamp, primaryKey, json } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod";
import { relations } from "drizzle-orm";

// Schema for public PDF website with admin-only uploads

export const seoSettings = pgTable("seo_settings", {
  id: serial("id").primaryKey(),
  siteTitle: text("site_title").notNull().default("PDFxandria"),
  siteDescription: text("site_description").notNull().default("Biblioteca digital de PDFs gratuita - Explore, baixe e compartilhe documentos"),
  siteKeywords: text("site_keywords").notNull().default("pdf grátis, documentos digitais, biblioteca pdf, download pdf, compartilhar documentos"),
  siteUrl: text("site_url").default(""),
  ogImage: text("og_image").notNull().default("/generated-icon.png"),
  twitterHandle: text("twitter_handle").default("@pdfxandria"),
  googleVerification: text("google_verification").default(""),
  bingVerification: text("bing_verification").default(""),
  robotsTxt: text("robots_txt").notNull().default("User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /uploads/pdfs/\nAllow: /uploads/thumbnails/\nAllow: /uploads/avatars/\n\n# Sitemap\nSitemap: /sitemap.xml\n\n# Crawl-delay\nCrawl-delay: 1\n\n# Specific bot configurations\nUser-agent: Googlebot\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /uploads/pdfs/\nAllow: /uploads/thumbnails/\nAllow: /uploads/avatars/\n\nUser-agent: Bingbot\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /uploads/pdfs/\nAllow: /uploads/thumbnails/\nAllow: /uploads/avatars/"),
  gaTrackingId: text("ga_tracking_id").default(""),
  pdfTitleFormat: text("pdf_title_format").notNull().default("${title} | Download PDF Grátis - PDFxandria"),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Users table - only for admin access
export const users = pgTable("users", {
  id: serial("id").primaryKey(),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  isAdmin: boolean("is_admin").default(false),
  isBlocked: boolean("is_blocked").default(false),
  name: text("name"),
  email: text("email"),
  createdAt: timestamp("created_at").defaultNow(),
  updatedAt: timestamp("updated_at").defaultNow(),
});

export const categories = pgTable("categories", {
  id: serial("id").primaryKey(),
  name: text("name").notNull().unique(),
  slug: text("slug").notNull().unique(),
  icon: text("icon").default("folder"),
  color: text("color").default("#4f46e5"),
});

export const pdfs = pgTable("pdfs", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  slug: text("slug").notNull(),
  description: text("description").notNull(),
  filePath: text("file_path").notNull(),
  fileHash: text("file_hash"),
  coverImage: text("cover_image"),
  pageCount: integer("page_count").default(0),
  isPublic: boolean("is_public").default(true),
  views: integer("views").default(0),
  downloads: integer("downloads").default(0),
  likesCount: integer("likes_count").default(0),
  dislikesCount: integer("dislikes_count").default(0),
  totalRatings: integer("total_ratings").default(0),
  categoryId: integer("category_id").notNull(),
  userId: integer("user_id").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Slug history for redirects
export const slugHistory = pgTable("slug_history", {
  id: serial("id").primaryKey(),
  oldSlug: text("old_slug").notNull(),
  newSlug: text("new_slug").notNull(),
  pdfId: integer("pdf_id").notNull().references(() => pdfs.id),
  createdAt: timestamp("created_at").defaultNow(),
  redirectUntil: timestamp("redirect_until").defaultNow()
});

// DMCA requests
export const dmcaRequests = pgTable("dmca_requests", {
  id: serial("id").primaryKey(),
  pdfId: integer("pdf_id").notNull(),
  requestorName: text("requestor_name").notNull(),
  requestorEmail: text("requestor_email").notNull(),
  reason: text("reason").notNull(),
  status: text("status").default("pending"),
  createdAt: timestamp("created_at").defaultNow(),
});



// Public ratings (using IP or session to prevent duplicate votes)
export const ratings = pgTable("ratings", {
  id: serial("id").primaryKey(),
  pdfId: integer("pdf_id").notNull(),
  userIp: text("user_ip").notNull(),
  sessionId: text("session_id"),
  isPositive: boolean("is_positive").notNull(),
  createdAt: timestamp("created_at").defaultNow(),
});

// Site settings
export const siteSettings = pgTable("site_settings", {
  id: serial("id").primaryKey(),
  maintenanceMode: boolean("maintenance_mode").default(false),
  allowPublicDownloads: boolean("allow_public_downloads").default(true),
  requireEmailForDownload: boolean("require_email_for_download").default(false),
  updatedAt: timestamp("updated_at").defaultNow(),
});

// Insert schemas
export const insertUserSchema = createInsertSchema(users).omit({
  id: true,
  createdAt: true,
  updatedAt: true,
});

export const insertCategorySchema = createInsertSchema(categories).omit({
  id: true,
});

export const insertPdfSchema = createInsertSchema(pdfs).omit({
  id: true,
  createdAt: true,
  views: true,
  downloads: true,
  likesCount: true,
  dislikesCount: true,
});

export const insertDmcaRequestSchema = createInsertSchema(dmcaRequests).omit({
  id: true,
  createdAt: true,
});

export const insertRatingSchema = createInsertSchema(ratings).pick({
  pdfId: true,
  userIp: true,
  sessionId: true,
  isPositive: true,
});

export const insertSeoSettingsSchema = createInsertSchema(seoSettings).omit({
  id: true,
  updatedAt: true,
});

export const insertSiteSettingsSchema = createInsertSchema(siteSettings).omit({
  id: true,
  updatedAt: true,
});

// Types
export type User = typeof users.$inferSelect;
export type InsertUser = z.infer<typeof insertUserSchema>;

export type Category = typeof categories.$inferSelect;
export type InsertCategory = z.infer<typeof insertCategorySchema>;

export type Pdf = typeof pdfs.$inferSelect & {
  positivePercentage?: number;
  negativePercentage?: number;
};
export type InsertPdf = z.infer<typeof insertPdfSchema>;

export type DmcaRequest = typeof dmcaRequests.$inferSelect;
export type InsertDmcaRequest = z.infer<typeof insertDmcaRequestSchema>;

export type Rating = typeof ratings.$inferSelect;
export type InsertRating = z.infer<typeof insertRatingSchema>;

export type SeoSettings = typeof seoSettings.$inferSelect;
export type InsertSeoSettings = z.infer<typeof insertSeoSettingsSchema>;

export type SiteSettings = typeof siteSettings.$inferSelect;
export type InsertSiteSettings = z.infer<typeof insertSiteSettingsSchema>;