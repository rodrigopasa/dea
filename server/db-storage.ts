import { eq, desc, and, inArray, isNull, sql, gte } from 'drizzle-orm';
import { IStorage } from './storage';
import { db } from './db';
import * as path from 'path';
import * as fs from 'fs';
import * as crypto from 'crypto';
import { users, type User, type InsertUser, 
         categories, type Category, type InsertCategory, 
         pdfs, type Pdf, type InsertPdf, 
         dmcaRequests, type DmcaRequest, type InsertDmcaRequest,
         seoSettings, type SeoSettings, type InsertSeoSettings,
         ratings, type Rating, type InsertRating,
         siteSettings, type SiteSettings, type InsertSiteSettings,
         slugHistory } from '@shared/schema';
import connectPg from 'connect-pg-simple';
import session from 'express-session';
import pg from 'pg';

// Configure PostgreSQL session - lazy initialization
const PostgresSessionStore = connectPg(session);
let sessionPool: pg.Pool | null = null;

function getSessionPool() {
  if (!sessionPool) {
    sessionPool = new pg.Pool({
      connectionString: process.env.DATABASE_URL,
    });
  }
  return sessionPool;
}

export class PostgresStorage implements IStorage {
  sessionStore: any;

  constructor() {
    this.sessionStore = new PostgresSessionStore({
      pool: getSessionPool(),
      tableName: 'session',
      createTableIfMissing: true,
    });
  }

  // Slug history methods
  async addSlugHistory(oldSlug: string, newSlug: string, pdfId: number): Promise<any> {
    try {
      const redirectUntil = new Date();
      redirectUntil.setFullYear(redirectUntil.getFullYear() + 1);
      
      // Check if redirect already exists and update it
      const existing = await db.select()
        .from(slugHistory)
        .where(
          and(
            eq(slugHistory.oldSlug, oldSlug),
            eq(slugHistory.pdfId, pdfId)
          )
        )
        .limit(1);
      
      if (existing.length > 0) {
        // Update existing redirect
        const result = await db.update(slugHistory)
          .set({
            newSlug,
            redirectUntil,
            createdAt: new Date()
          })
          .where(eq(slugHistory.id, existing[0].id))
          .returning();
        
        return result[0];
      } else {
        // Create new redirect
        const result = await db.insert(slugHistory).values({
          oldSlug,
          newSlug,
          pdfId,
          redirectUntil
        }).returning();
        
        return result[0];
      }
    } catch (error) {
      console.error("Error adding slug history:", error);
      throw error;
    }
  }
  
  async getSlugRedirect(oldSlug: string): Promise<string | null> {
    try {
      const now = new Date();
      
      const redirects = await db.select()
        .from(slugHistory)
        .where(
          and(
            eq(slugHistory.oldSlug, oldSlug),
            gte(slugHistory.redirectUntil, now)
          )
        )
        .orderBy(desc(slugHistory.createdAt))
        .limit(1);
      
      return redirects.length > 0 ? redirects[0].newSlug : null;
    } catch (error) {
      console.error("Error getting slug redirect:", error);
      return null;
    }
  }

  // User methods
  async getUser(id: number): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting user:", error);
      return undefined;
    }
  }

  async getUserByUsername(username: string): Promise<User | undefined> {
    try {
      const result = await db.select().from(users).where(eq(users.username, username));
      return result[0];
    } catch (error) {
      console.error("Error getting user by username:", error);
      return undefined;
    }
  }

  async createUser(userData: InsertUser): Promise<User> {
    try {
      const result = await db.insert(users).values(userData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating user:", error);
      throw error;
    }
  }

  async getAllUsers(): Promise<User[]> {
    try {
      return await db.select().from(users).orderBy(desc(users.createdAt));
    } catch (error) {
      console.error("Error getting all users:", error);
      return [];
    }
  }

  async updateUser(id: number, data: Partial<User>): Promise<User> {
    try {
      const result = await db.update(users).set(data).where(eq(users.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating user:", error);
      throw error;
    }
  }

  async deleteUser(id: number): Promise<boolean> {
    try {
      await db.delete(users).where(eq(users.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting user:", error);
      return false;
    }
  }

  // Category methods
  async getCategory(id: number): Promise<Category | undefined> {
    try {
      const result = await db.select().from(categories).where(eq(categories.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting category:", error);
      return undefined;
    }
  }

  async getCategoryBySlug(slug: string): Promise<Category | undefined> {
    try {
      const result = await db.select().from(categories).where(eq(categories.slug, slug));
      return result[0];
    } catch (error) {
      console.error("Error getting category by slug:", error);
      return undefined;
    }
  }

  async createCategory(categoryData: InsertCategory): Promise<Category> {
    try {
      const result = await db.insert(categories).values(categoryData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating category:", error);
      throw error;
    }
  }

  async getAllCategories(): Promise<Category[]> {
    try {
      return await db.select().from(categories).orderBy(categories.name);
    } catch (error) {
      console.error("Error getting all categories:", error);
      return [];
    }
  }

  async updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined> {
    try {
      const result = await db.update(categories).set(data).where(eq(categories.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating category:", error);
      return undefined;
    }
  }

  async deleteCategory(id: number): Promise<boolean> {
    try {
      await db.delete(categories).where(eq(categories.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting category:", error);
      return false;
    }
  }

  // PDF methods
  async getPdf(id: number): Promise<Pdf | undefined> {
    try {
      const result = await db.select().from(pdfs).where(eq(pdfs.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting PDF:", error);
      return undefined;
    }
  }

  async getPdfBySlug(slug: string): Promise<Pdf | undefined> {
    try {
      const result = await db.select().from(pdfs).where(eq(pdfs.slug, slug));
      return result[0];
    } catch (error) {
      console.error("Error getting PDF by slug:", error);
      return undefined;
    }
  }

  async checkPdfDuplicate(fileHashOrPath: string): Promise<Pdf | null> {
    try {
      // Check if it looks like a hash (32 chars for MD5)
      if (fileHashOrPath.length === 32 && /^[a-f0-9]+$/i.test(fileHashOrPath)) {
        // Search by file hash
        const result = await db.select().from(pdfs).where(eq(pdfs.fileHash, fileHashOrPath));
        return result.length > 0 ? result[0] : null;
      } else {
        // Search by file path (backwards compatibility)
        const result = await db.select().from(pdfs).where(eq(pdfs.filePath, fileHashOrPath));
        return result.length > 0 ? result[0] : null;
      }
    } catch (error) {
      console.error("Error checking PDF duplicate:", error);
      return null;
    }
  }

  async createPdf(pdfData: InsertPdf): Promise<Pdf> {
    try {
      const result = await db.insert(pdfs).values(pdfData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating PDF:", error);
      throw error;
    }
  }

  async getAllPdfs(): Promise<Pdf[]> {
    try {
      return await db.select().from(pdfs)
        .where(eq(pdfs.isPublic, true))
        .orderBy(desc(pdfs.createdAt));
    } catch (error) {
      console.error("Error getting all PDFs:", error);
      return [];
    }
  }

  async getPdfsByCategory(categoryId: number): Promise<Pdf[]> {
    try {
      return await db.select().from(pdfs)
        .where(and(
          eq(pdfs.categoryId, categoryId),
          eq(pdfs.isPublic, true)
        ))
        .orderBy(desc(pdfs.createdAt));
    } catch (error) {
      console.error("Error getting PDFs by category:", error);
      return [];
    }
  }

  async getPdfsByUser(userId: number): Promise<Pdf[]> {
    try {
      return await db.select().from(pdfs)
        .where(eq(pdfs.userId, userId))
        .orderBy(desc(pdfs.createdAt));
    } catch (error) {
      console.error("Error getting PDFs by user:", error);
      return [];
    }
  }

  async getRecentPdfs(limit: number): Promise<Pdf[]> {
    try {
      return await db.select().from(pdfs)
        .where(eq(pdfs.isPublic, true))
        .orderBy(desc(pdfs.createdAt))
        .limit(limit);
    } catch (error) {
      console.error("Error getting recent PDFs:", error);
      return [];
    }
  }

  async getPopularPdfs(limit: number): Promise<Pdf[]> {
    try {
      return await db.select().from(pdfs)
        .where(eq(pdfs.isPublic, true))
        .orderBy(desc(pdfs.views))
        .limit(limit);
    } catch (error) {
      console.error("Error getting popular PDFs:", error);
      return [];
    }
  }

  async updatePdf(id: number, data: Partial<InsertPdf>): Promise<Pdf | undefined> {
    try {
      const result = await db.update(pdfs).set(data).where(eq(pdfs.id, id)).returning();
      return result[0];
    } catch (error) {
      console.error("Error updating PDF:", error);
      return undefined;
    }
  }

  async deletePdf(id: number): Promise<boolean> {
    try {
      await db.delete(pdfs).where(eq(pdfs.id, id));
      return true;
    } catch (error) {
      console.error("Error deleting PDF:", error);
      return false;
    }
  }

  async incrementPdfViews(id: number): Promise<Pdf | undefined> {
    try {
      const result = await db.update(pdfs)
        .set({ views: sql`${pdfs.views} + 1` })
        .where(eq(pdfs.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error incrementing PDF views:", error);
      return undefined;
    }
  }

  async incrementPdfDownloads(id: number): Promise<Pdf | undefined> {
    try {
      const result = await db.update(pdfs)
        .set({ downloads: sql`${pdfs.downloads} + 1` })
        .where(eq(pdfs.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error incrementing PDF downloads:", error);
      return undefined;
    }
  }

  // DMCA methods
  async getDmcaRequest(id: number): Promise<DmcaRequest | undefined> {
    try {
      const result = await db.select().from(dmcaRequests).where(eq(dmcaRequests.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting DMCA request:", error);
      return undefined;
    }
  }

  async createDmcaRequest(requestData: InsertDmcaRequest): Promise<DmcaRequest> {
    try {
      const result = await db.insert(dmcaRequests).values(requestData).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating DMCA request:", error);
      throw error;
    }
  }

  async getAllDmcaRequests(): Promise<DmcaRequest[]> {
    try {
      return await db.select().from(dmcaRequests).orderBy(desc(dmcaRequests.createdAt));
    } catch (error) {
      console.error("Error getting all DMCA requests:", error);
      return [];
    }
  }

  async updateDmcaRequest(id: number, status: string): Promise<DmcaRequest | undefined> {
    try {
      const result = await db.update(dmcaRequests)
        .set({ status })
        .where(eq(dmcaRequests.id, id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating DMCA request:", error);
      return undefined;
    }
  }



  // SEO Settings methods
  async getSeoSettings(): Promise<SeoSettings> {
    try {
      const result = await db.select().from(seoSettings).limit(1);
      
      if (result.length === 0) {
        const defaultSettings: InsertSeoSettings = {
          siteTitle: "PDFxandria - Biblioteca Digital de PDFs Gratuita",
          siteDescription: "Descubra, baixe e compartilhe documentos PDF gratuitamente. Biblioteca digital com milhares de livros, artigos, manuais e documentos em português e outros idiomas.",
          siteKeywords: "pdf grátis, documentos digitais, biblioteca pdf, download pdf, compartilhar documentos, livros pdf, artigos pdf, manuais pdf, documentos acadêmicos, biblioteca online",
          siteUrl: "",
          ogImage: "/generated-icon.png",
          twitterHandle: "@pdfxandria",
          googleVerification: "",
          bingVerification: "",
          robotsTxt: "User-agent: *\nAllow: /\nDisallow: /admin/\nDisallow: /api/\nDisallow: /uploads/pdfs/\nAllow: /uploads/thumbnails/\nAllow: /uploads/avatars/\n\n# Sitemap\nSitemap: /sitemap.xml\nSitemap: /sitemap-index.xml\n\n# Crawl-delay\nCrawl-delay: 1",
          gaTrackingId: "",
          pdfTitleFormat: "${title} | Download PDF Grátis - PDFxandria",
        };
        
        const created = await db.insert(seoSettings).values(defaultSettings).returning();
        return created[0];
      }
      
      return result[0];
    } catch (error) {
      console.error("Error getting SEO settings:", error);
      throw error;
    }
  }

  async updateSeoSettings(settings: Partial<InsertSeoSettings>): Promise<SeoSettings> {
    try {
      const current = await this.getSeoSettings();
      const result = await db.update(seoSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(seoSettings.id, current.id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating SEO settings:", error);
      throw error;
    }
  }

  async getFormattedPdfTitle(title: string): Promise<string> {
    try {
      const settings = await this.getSeoSettings();
      return settings.pdfTitleFormat.replace('${title}', title);
    } catch (error) {
      console.error("Error formatting PDF title:", error);
      return title;
    }
  }



  // Rating methods
  async getRating(id: number): Promise<Rating | undefined> {
    try {
      const result = await db.select().from(ratings).where(eq(ratings.id, id));
      return result[0];
    } catch (error) {
      console.error("Error getting rating:", error);
      return undefined;
    }
  }

  async getUserRating(userId: number, pdfId: number): Promise<Rating | undefined> {
    try {
      const result = await db.select().from(ratings).where(
        and(
          eq(ratings.userId, userId),
          eq(ratings.pdfId, pdfId)
        )
      );
      return result[0];
    } catch (error) {
      console.error("Error getting user rating:", error);
      return undefined;
    }
  }

  async getUserRatingByIP(userIp: string, pdfId: number): Promise<Rating | undefined> {
    try {
      const result = await db.select().from(ratings).where(
        and(
          eq(ratings.userIp, userIp),
          eq(ratings.pdfId, pdfId)
        )
      );
      return result[0];
    } catch (error) {
      console.error("Error getting user rating by IP:", error);
      return undefined;
    }
  }

  async createRating(ratingData: InsertRating): Promise<Rating> {
    try {
      const result = await db.insert(ratings).values(ratingData).returning();
      await this.updatePdfRating(ratingData.pdfId);
      return result[0];
    } catch (error) {
      console.error("Error creating rating:", error);
      throw error;
    }
  }

  async updateRating(id: number, data: Partial<Rating>): Promise<Rating | undefined> {
    try {
      const rating = await this.getRating(id);
      if (!rating) return undefined;
      
      const result = await db.update(ratings).set(data).where(eq(ratings.id, id)).returning();
      await this.updatePdfRating(rating.pdfId);
      return result[0];
    } catch (error) {
      console.error("Error updating rating:", error);
      return undefined;
    }
  }

  async deleteRating(id: number): Promise<boolean> {
    try {
      const rating = await this.getRating(id);
      if (!rating) return false;
      
      await db.delete(ratings).where(eq(ratings.id, id));
      await this.updatePdfRating(rating.pdfId);
      return true;
    } catch (error) {
      console.error("Error deleting rating:", error);
      return false;
    }
  }

  async getPdfRatings(pdfId: number): Promise<Rating[]> {
    try {
      return await db.select().from(ratings)
        .where(eq(ratings.pdfId, pdfId))
        .orderBy(desc(ratings.createdAt));
    } catch (error) {
      console.error("Error getting PDF ratings:", error);
      return [];
    }
  }

  async calculatePdfRating(pdfId: number): Promise<{ 
    totalRatings: number, 
    likesCount: number, 
    dislikesCount: number,
    positivePercentage: number,
    negativePercentage: number
  }> {
    try {
      const ratingsData = await this.getPdfRatings(pdfId);
      const totalRatings = ratingsData.length;
      const likesCount = ratingsData.filter(r => r.isPositive).length;
      const dislikesCount = ratingsData.filter(r => !r.isPositive).length;
      
      const positivePercentage = totalRatings > 0 ? (likesCount / totalRatings) * 100 : 0;
      const negativePercentage = totalRatings > 0 ? (dislikesCount / totalRatings) * 100 : 0;
      
      return {
        totalRatings,
        likesCount,
        dislikesCount,
        positivePercentage,
        negativePercentage
      };
    } catch (error) {
      console.error("Error calculating PDF rating:", error);
      return { totalRatings: 0, likesCount: 0, dislikesCount: 0, positivePercentage: 0, negativePercentage: 0 };
    }
  }

  private async updatePdfRating(pdfId: number): Promise<void> {
    try {
      const ratingData = await this.calculatePdfRating(pdfId);
      await db.update(pdfs)
        .set({
          totalRatings: ratingData.totalRatings,
          likesCount: ratingData.likesCount,
          dislikesCount: ratingData.dislikesCount,
        })
        .where(eq(pdfs.id, pdfId));
    } catch (error) {
      console.error("Error updating PDF rating:", error);
    }
  }

  // Site Settings methods
  async getSiteSettings(): Promise<SiteSettings> {
    try {
      const result = await db.select().from(siteSettings).limit(1);
      
      if (result.length === 0) {
        return await this.createDefaultSiteSettings();
      }
      
      return result[0];
    } catch (error) {
      console.error("Error getting site settings:", error);
      throw error;
    }
  }

  private async createDefaultSiteSettings(): Promise<SiteSettings> {
    try {
      const defaultSettings: InsertSiteSettings = {
        maintenanceMode: false,
        allowPublicDownloads: true,
        requireEmailForDownload: false,
      };
      
      const result = await db.insert(siteSettings).values(defaultSettings).returning();
      return result[0];
    } catch (error) {
      console.error("Error creating default site settings:", error);
      throw error;
    }
  }

  async updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings> {
    try {
      const current = await this.getSiteSettings();
      const result = await db.update(siteSettings)
        .set({ ...settings, updatedAt: new Date() })
        .where(eq(siteSettings.id, current.id))
        .returning();
      return result[0];
    } catch (error) {
      console.error("Error updating site settings:", error);
      throw error;
    }
  }
}