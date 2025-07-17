import { 
  users, type User, type InsertUser, 
  categories, type Category, type InsertCategory, 
  pdfs, type Pdf, type InsertPdf, 
  dmcaRequests, type DmcaRequest, type InsertDmcaRequest,
  seoSettings, type SeoSettings, type InsertSeoSettings,
  ratings, type Rating, type InsertRating,
  siteSettings, type SiteSettings, type InsertSiteSettings,
  slugHistory, type SlugHistory, type InsertSlugHistory
} from "@shared/schema";
import createMemoryStore from "memorystore";
import session from "express-session";

// Session store
const MemoryStore = createMemoryStore(session);

export interface IStorage {
  // Session store
  sessionStore: any;
  
  // User operations
  getUser(id: number): Promise<User | undefined>;
  getUserByUsername(username: string): Promise<User | undefined>;
  createUser(user: InsertUser): Promise<User>;
  updateUser(id: number, data: Partial<User>): Promise<User>;
  getAllUsers(): Promise<User[]>;
  deleteUser(id: number): Promise<boolean>;

  // Category operations
  getCategory(id: number): Promise<Category | undefined>;
  getCategoryBySlug(slug: string): Promise<Category | undefined>;
  createCategory(category: InsertCategory): Promise<Category>;
  getAllCategories(): Promise<Category[]>;
  updateCategory(id: number, data: Partial<InsertCategory>): Promise<Category | undefined>;
  deleteCategory(id: number): Promise<boolean>;
  
  // Slug history operations
  addSlugHistory(oldSlug: string, newSlug: string, pdfId: number): Promise<any>;
  getSlugRedirect(oldSlug: string): Promise<string | null>;

  // PDF operations
  getPdf(id: number): Promise<Pdf | undefined>;
  getPdfBySlug(slug: string): Promise<Pdf | undefined>;
  checkPdfDuplicate(filePath: string): Promise<Pdf | null>;
  createPdf(pdf: InsertPdf): Promise<Pdf>;
  getAllPdfs(): Promise<Pdf[]>;
  getPdfsByCategory(categoryId: number): Promise<Pdf[]>;
  getPdfsByUser(userId: number): Promise<Pdf[]>;
  getRecentPdfs(limit: number): Promise<Pdf[]>;
  getPopularPdfs(limit: number): Promise<Pdf[]>;
  updatePdf(id: number, data: Partial<InsertPdf>): Promise<Pdf | undefined>;
  deletePdf(id: number): Promise<boolean>;
  incrementPdfViews(id: number): Promise<Pdf | undefined>;
  incrementPdfDownloads(id: number): Promise<Pdf | undefined>;

  // Favorites removed - not needed in public repository

  // DMCA operations
  getDmcaRequest(id: number): Promise<DmcaRequest | undefined>;
  createDmcaRequest(request: InsertDmcaRequest): Promise<DmcaRequest>;
  getAllDmcaRequests(): Promise<DmcaRequest[]>;
  updateDmcaRequest(id: number, status: string): Promise<DmcaRequest | undefined>;

  // Comments removed - not needed in public repository

  // Rating operations - simplified for public use
  getRating(id: number): Promise<Rating | undefined>;
  getUserRatingByIP(userIp: string, pdfId: number): Promise<Rating | undefined>;
  createRating(rating: InsertRating): Promise<Rating>;
  updateRating(id: number, data: Partial<Rating>): Promise<Rating | undefined>;
  deleteRating(id: number): Promise<boolean>;
  getPdfRatings(pdfId: number): Promise<Rating[]>;
  calculatePdfRating(pdfId: number): Promise<{
    totalRatings: number;
    likesCount: number;
    dislikesCount: number;
    positivePercentage: number;
    negativePercentage: number;
  }>;

  // SEO settings
  getSeoSettings(): Promise<SeoSettings>;
  updateSeoSettings(settings: Partial<InsertSeoSettings>): Promise<SeoSettings>;
  getFormattedPdfTitle(title: string): Promise<string>;

  // Site settings
  getSiteSettings(): Promise<SiteSettings>;
  updateSiteSettings(settings: Partial<InsertSiteSettings>): Promise<SiteSettings>;
}