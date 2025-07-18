import express, { type Express, Request, Response } from "express";
import { createServer, type Server } from "http";
import { PostgresStorage } from "./db-storage";
import { setupAuth } from "./auth";
import * as pdfUtils from "./pdf-utils";
import PdfProcessor from "./pdf-utils";
import { exportDatabase, importDatabase } from "./database-export";
import { 
  generateSitemapIndex, 
  generateSitemap, 
  generatePagesSitemap, 
  generateCategoriesSitemap, 
  generatePdfsSitemap 
} from "./sitemap";
import { SEOOptimizer } from "./seo-optimization";
import { GoogleSEOHelpers } from "./google-seo-helpers";
import multer from "multer";
import path from "path";
import fs from "fs";
import os from "os"; // <--- ADICIONADO PARA ACESSAR A PASTA TEMP DO SISTEMA
import { z } from "zod";
import { db, pool } from "./db";
import { and, eq, gte, desc, sql } from "drizzle-orm";
import { 
  insertPdfSchema, 
  insertDmcaRequestSchema, 
  insertCategorySchema, 
  insertSeoSettingsSchema, 
  insertSiteSettingsSchema,
  insertRatingSchema,
  ratings,
  slugHistory,
  pdfs
} from "@shared/schema";
import { randomUUID, createHash } from "crypto";
import { promisify } from "util";
import { exec } from "child_process";
import { v4 as uuidv4 } from "uuid";

// Promisify exec for async/await usage
const execPromise = promisify(exec);

// Create upload folders if they don't exist
const UPLOAD_DIR = path.join(process.cwd(), "uploads");
const PDF_DIR = path.join(UPLOAD_DIR, "pdfs");
const THUMBNAILS_DIR = path.join(UPLOAD_DIR, "thumbnails");
const AVATARS_DIR = path.join(UPLOAD_DIR, "avatars");
// --- ALTERAÇÃO: Usando a pasta temporária do sistema ---
const TEMP_DIR = path.join(os.tmpdir(), "pdf-temp-uploads");

// Create all necessary directories
[UPLOAD_DIR, PDF_DIR, THUMBNAILS_DIR, AVATARS_DIR, TEMP_DIR].forEach(dir => {
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
    console.log(`Directory created: ${dir}`);
  }
});

// Configure multer for FINAL PDF uploads
const pdfStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, PDF_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + randomUUID();
    const originalName = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');
    cb(null, uniqueSuffix + '-' + originalName);
  }
});

// --- NOVO: Multer para uploads TEMPORÁRIOS ---
// Salva arquivos na pasta /tmp do sistema, que tem permissões garantidas.
const tempUpload = multer({ dest: TEMP_DIR });

// Configure avatar storage
const avatarStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, AVATARS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: pdfStorage,
  fileFilter: function (req, file, cb) {
    if (file.mimetype !== 'application/pdf') {
      return cb(new Error('Only PDF files are allowed!'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 50 * 1024 * 1024, // 50MB limit
  }
});

const uploadAvatar = multer({
  storage: avatarStorage,
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

// Configure multer for thumbnail/cover image uploads
const thumbnailStorage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, THUMBNAILS_DIR);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + randomUUID();
    cb(null, uniqueSuffix + path.extname(file.originalname));
  }
});

const thumbnailUpload = multer({
  storage: thumbnailStorage,
  fileFilter: function (req, file, cb) {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image files are allowed!'));
    }
    cb(null, true);
  },
  limits: {
    fileSize: 5 * 1024 * 1024, // 5MB limit
  }
});

export function registerRoutes(app: Express) {
  const storage = new PostgresStorage();
  const seoOptimizer = new SEOOptimizer(storage);
  const googleSEOHelpers = new GoogleSEOHelpers(storage);
  
  setupAuth(app, storage);

  function requireAdmin(req: Request, res: Response, next: any) {
    if (!req.user || !req.user.isAdmin) {
      return res.status(403).json({ error: 'Admin access required' });
    }
    next();
  }

  // User API - get current user info
  app.get('/api/user', (req, res) => {
    if (req.isAuthenticated() && req.user) {
      res.json({
        id: req.user.id,
        username: req.user.username,
        isAdmin: req.user.isAdmin,
        isBlocked: req.user.isBlocked
      });
    } else {
      res.status(401).json({ error: 'Not authenticated' });
    }
  });

  // Categories API
  app.get('/api/categories', async (req, res) => {
    try {
      const categories = await storage.getAllCategories();
      res.json(categories);
    } catch (error) {
      console.error('Error fetching categories:', error);
      res.status(500).json({ error: 'Failed to fetch categories' });
    }
  });

  app.post('/api/categories', requireAdmin, async (req, res) => {
    try {
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.createCategory(categoryData);
      res.status(201).json(category);
    } catch (error) {
      console.error('Error creating category:', error);
      res.status(400).json({ error: 'Failed to create category' });
    }
  });

  app.put('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(400).json({ error: 'Failed to update category' });
    }
  });

  app.patch('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const categoryData = insertCategorySchema.parse(req.body);
      const category = await storage.updateCategory(id, categoryData);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error updating category:', error);
      res.status(400).json({ error: 'Failed to update category' });
    }
  });

  app.delete('/api/categories/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const success = await storage.deleteCategory(id);
      
      if (!success) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json({ message: 'Category deleted successfully' });
    } catch (error) {
      console.error('Error deleting category:', error);
      res.status(500).json({ error: 'Failed to delete category' });
    }
  });

  // PDFs API
  app.get('/api/pdfs', async (req, res) => {
    try {
      const pdfs = await storage.getAllPdfs();
      res.json(pdfs);
    } catch (error) {
      console.error('Error fetching PDFs:', error);
      res.status(500).json({ error: 'Failed to fetch PDFs' });
    }
  });

  app.get('/api/pdfs/category/:categoryId', async (req, res) => {
    try {
      const categoryId = parseInt(req.params.categoryId);
      const pdfs = await storage.getPdfsByCategory(categoryId);
      res.json(pdfs);
    } catch (error) {
      console.error('Error fetching PDFs by category:', error);
      res.status(500).json({ error: 'Failed to fetch PDFs' });
    }
  });

  app.get('/api/pdfs/recent', async (req, res) => {
    try {
      const pdfs = await storage.getRecentPdfs(16);
      res.json(pdfs);
    } catch (error) {
      console.error('Error fetching recent PDFs:', error);
      res.status(500).json({ error: 'Failed to fetch recent PDFs' });
    }
  });

  app.get('/api/pdfs/popular', async (req, res) => {
    try {
      const pdfs = await storage.getPopularPdfs(10);
      res.json(pdfs);
    } catch (error) {
      console.error('Error fetching popular PDFs:', error);
      res.status(500).json({ error: 'Failed to fetch popular PDFs' });
    }
  });

  app.get('/api/pdfs/recent/:limit', async (req, res) => {
    try {
      const limit = req.params.limit ? parseInt(req.params.limit) : 10;
      const validLimit = isNaN(limit) ? 10 : Math.max(1, Math.min(100, limit));
      const pdfs = await storage.getRecentPdfs(validLimit);
      res.json(pdfs);
    } catch (error) {
      console.error('Error fetching recent PDFs:', error);
      res.status(500).json({ error: 'Failed to fetch recent PDFs' });
    }
  });

  app.get('/api/pdfs/popular/:limit', async (req, res) => {
    try {
      const limit = req.params.limit ? parseInt(req.params.limit) : 10;
      const validLimit = isNaN(limit) ? 10 : Math.max(1, Math.min(100, limit));
      const pdfs = await storage.getPopularPdfs(validLimit);
      res.json(pdfs);
    } catch (error) {
      console.error('Error fetching popular PDFs:', error);
      res.status(500).json({ error: 'Failed to fetch popular PDFs' });
    }
  });

  app.get('/api/pdfs/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      
      if (isNaN(id)) {
        return res.status(400).json({ error: 'Invalid PDF ID' });
      }
      
      const pdf = await storage.getPdf(id);
      
      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }
      
      res.json(pdf);
    } catch (error) {
      console.error('Error fetching PDF:', error);
      res.status(500).json({ error: 'Failed to fetch PDF' });
    }
  });

  app.get('/api/pdfs/slug/:slug', async (req, res) => {
    try {
      const slug = req.params.slug;
      let pdf = await storage.getPdfBySlug(slug);
      
      if (!pdf) {
        const redirectSlug = await storage.getSlugRedirect(slug);
        if (redirectSlug) {
          pdf = await storage.getPdfBySlug(redirectSlug);
          if (pdf) {
            return res.redirect(301, `/api/pdfs/slug/${redirectSlug}`);
          }
        }
      }
      
      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }
      
      await storage.incrementPdfViews(pdf.id);
      
      res.json(pdf);
    } catch (error) {
      console.error('Error fetching PDF by slug:', error);
      res.status(500).json({ error: 'Failed to fetch PDF' });
    }
  });

  // --- ALTERAÇÃO: Usando o 'tempUpload' para verificação de duplicados ---
  app.post('/api/pdfs/check-duplicate', requireAdmin, tempUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const fileBuffer = fs.readFileSync(req.file.path);
      const fileHash = createHash('md5').update(fileBuffer).digest('hex');
      
      const duplicate = await storage.checkPdfDuplicate(fileHash);
      
      fs.unlinkSync(req.file.path);
      
      if (duplicate) {
        res.json({ 
          duplicate: true, 
          existingPdf: duplicate 
        });
      } else {
        res.json({ duplicate: false });
      }
    } catch (error) {
      console.error('Error checking PDF duplicate:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to check duplicate' });
    }
  });

  // --- ALTERAÇÃO: Usando o 'tempUpload' para extração de metadados ---
  app.post('/api/pdfs/extract-metadata', requireAdmin, tempUpload.single('file'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const metadata = await pdfUtils.extractPdfMetadata(req.file.path);
      
      fs.unlinkSync(req.file.path);
      
      res.json(metadata);
    } catch (error) {
      console.error('Error extracting PDF metadata:', error);
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to extract metadata' });
    }
  });

  app.post('/api/pdfs/extract-metadata-filename', requireAdmin, async (req, res) => {
    try {
      const { filename, fileSize } = req.body;
      
      if (!filename) {
        return res.status(400).json({ error: 'Filename is required' });
      }

      const title = pdfUtils.formatFileName(filename.replace('.pdf', ''));
      const description = `Documento PDF com aproximadamente ${Math.ceil((fileSize || 0) / 1024 / 1024)} MB`;
      
      res.json({
        title,
        description,
        pageCount: 0,
        fileSize: fileSize || 0
      });
    } catch (error) {
      console.error('Error extracting metadata from filename:', error);
      res.status(500).json({ error: 'Failed to extract metadata from filename' });
    }
  });

  // --- Nenhuma alteração aqui, 'upload' salva no destino final ---
  app.post('/api/pdfs/upload', requireAdmin, upload.single('pdf'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No file uploaded' });
      }

      const { title, description, categoryId } = req.body;
      
      if (!title || !description || !categoryId) {
        return res.status(400).json({ error: 'Title, description, and category are required' });
      }

      const slug = pdfUtils.generateSlug(title);
      const pdfInfo = await PdfProcessor.getPdfInfo(req.file.path);
      const thumbnailPath = await pdfUtils.createPdfThumbnail(req.file.path, THUMBNAILS_DIR);
      const fileBuffer = fs.readFileSync(req.file.path);
      const fileHash = createHash('md5').update(fileBuffer).digest('hex');

      const pdfData = {
        title,
        slug,
        description,
        filePath: req.file.path,
        fileHash,
        coverImage: path.basename(thumbnailPath),
        pageCount: pdfInfo.pages,
        categoryId: parseInt(categoryId),
        userId: req.user.id,
        isPublic: true
      };

      const pdf = await storage.createPdf(pdfData);
      res.status(201).json(pdf);
    } catch (error) {
      console.error('Error uploading PDF:', error);
      if (req.file && fs.existsSync(req.file.path)) {
          fs.unlinkSync(req.file.path);
      }
      res.status(500).json({ error: 'Failed to upload PDF' });
    }
  });

  // --- Nenhuma alteração aqui, 'upload' salva no destino final ---
  app.post('/api/admin/pdfs/upload-multiple', requireAdmin, upload.array('files'), async (req, res) => {
    try {
      if (!req.files || req.files.length === 0) {
        return res.status(400).json({ error: 'No files uploaded' });
      }

      const { categoryId, isPublic, metadata, skipDuplicates } = req.body;
      
      if (!categoryId) {
        return res.status(400).json({ error: 'Category is required' });
      }

      const files = req.files as Express.Multer.File[];
      const results = [];
      let duplicatesCount = 0;
      let processedCount = 0;

      let parsedMetadata = [];
      if (metadata) {
        try {
          parsedMetadata = JSON.parse(metadata);
        } catch (e) {
          console.warn('Failed to parse metadata:', e);
        }
      }

      for (let i = 0; i < files.length; i++) {
        const file = files[i];
        
        try {
          const fileBuffer = fs.readFileSync(file.path);
          const fileHash = createHash('md5').update(fileBuffer).digest('hex');
          
          const duplicate = await storage.checkPdfDuplicate(fileHash);
          
          if (duplicate) {
            duplicatesCount++;
            if (skipDuplicates === 'true') {
              fs.unlinkSync(file.path);
              continue;
            } else {
              fs.unlinkSync(file.path);
              results.push({ 
                filename: file.originalname, 
                status: 'duplicate', 
                existingPdf: duplicate 
              });
              continue;
            }
          }

          let title, description;
          if (parsedMetadata[i]) {
            title = parsedMetadata[i].title;
            description = parsedMetadata[i].description;
          } else {
            const extractedMetadata = await pdfUtils.extractPdfMetadata(file.path);
            title = extractedMetadata.title;
            description = extractedMetadata.description;
          }

          const slug = pdfUtils.generateSlug(title);
          const pdfInfo = await PdfProcessor.getPdfInfo(file.path);
          const thumbnailPath = await pdfUtils.createPdfThumbnail(file.path, THUMBNAILS_DIR);

          const pdfData = {
            title,
            slug,
            description,
            filePath: file.path,
            fileHash,
            coverImage: path.basename(thumbnailPath),
            pageCount: pdfInfo.pages,
            categoryId: parseInt(categoryId),
            userId: req.user.id,
            isPublic: isPublic === 'true'
          };

          const pdf = await storage.createPdf(pdfData);
          results.push({ 
            filename: file.originalname, 
            status: 'success', 
            pdf 
          });
          processedCount++;

        } catch (error) {
          console.error('Error processing file:', file.originalname, error);
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
          results.push({ 
            filename: file.originalname, 
            status: 'error', 
            error: error.message 
          });
        }
      }

      res.json({
        totalCount: files.length,
        processedCount,
        duplicatesCount,
        skipDuplicates: skipDuplicates === 'true',
        results
      });

    } catch (error) {
      console.error('Error uploading multiple PDFs:', error);
      if (req.files) {
        (req.files as Express.Multer.File[]).forEach(file => {
          if (fs.existsSync(file.path)) {
            fs.unlinkSync(file.path);
          }
        });
      }
      res.status(500).json({ error: 'Failed to upload PDFs' });
    }
  });

  app.get('/api/pdfs/:id/file', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pdf = await storage.getPdf(id);
      
      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }

      if (!pdf.isPublic) {
        return res.status(403).json({ error: 'PDF is not public' });
      }

      if (!fs.existsSync(pdf.filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      if (req.query.countView === 'true') {
        await storage.incrementPdfViews(id);
      }

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader('Content-Disposition', 'inline');

      const fileStream = fs.createReadStream(pdf.filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error serving PDF file:', error);
      res.status(500).json({ error: 'Failed to serve PDF file' });
    }
  });

  app.get('/api/pdfs/:id/download', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pdf = await storage.getPdf(id);
      
      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }

      if (!pdf.isPublic) {
        return res.status(403).json({ error: 'PDF is not public' });
      }

      if (!fs.existsSync(pdf.filePath)) {
        return res.status(404).json({ error: 'File not found' });
      }

      await storage.incrementPdfDownloads(id);

      res.setHeader('Content-Disposition', `attachment; filename="${pdf.title}.pdf"`);
      res.setHeader('Content-Type', 'application/pdf');

      const fileStream = fs.createReadStream(pdf.filePath);
      fileStream.pipe(res);
    } catch (error) {
      console.error('Error downloading PDF:', error);
      res.status(500).json({ error: 'Failed to download PDF' });
    }
  });

  app.put('/api/pdfs/:id', requireAdmin, thumbnailUpload.single('coverImage'), async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { title, description, categoryId, isPublic, slug } = req.body;
      
      const existingPdf = await storage.getPdf(id);
      if (!existingPdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }
      
      let finalSlug = slug || existingPdf.slug;
      if (slug && slug !== existingPdf.slug) {
        if (!slug || !/^[a-z0-9-]+$/.test(slug)) {
          finalSlug = pdfUtils.generateSlug(title || existingPdf.title);
        } else {
          finalSlug = slug;
        }
        
        const existingWithSlug = await storage.getPdfBySlug(finalSlug);
        if (existingWithSlug && existingWithSlug.id !== id) {
          return res.status(400).json({ error: 'URL já está em uso' });
        }
        
        const redirectUntil = new Date();
        redirectUntil.setFullYear(redirectUntil.getFullYear() + 1);
        
        await storage.addSlugHistory(existingPdf.slug, finalSlug, id);
      }
      
      let coverImage = existingPdf.coverImage;
      if (req.file) {
        if (existingPdf.coverImage) {
          const oldImagePath = path.join(THUMBNAILS_DIR, existingPdf.coverImage);
          if (fs.existsSync(oldImagePath)) {
            fs.unlinkSync(oldImagePath);
          }
        }
        
        coverImage = path.basename(req.file.path);
      }
      
      const updateData = {
        title: title || existingPdf.title,
        description: description || existingPdf.description,
        categoryId: categoryId ? parseInt(categoryId) : existingPdf.categoryId,
        isPublic: isPublic !== undefined ? JSON.parse(isPublic) : existingPdf.isPublic,
        slug: finalSlug,
        coverImage
      };
      
      const pdf = await storage.updatePdf(id, updateData);
      
      res.json(pdf);
    } catch (error) {
      console.error('Error updating PDF:', error);
      res.status(400).json({ error: 'Failed to update PDF' });
    }
  });

  app.delete('/api/pdfs/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pdf = await storage.getPdf(id);
      
      if (!pdf) {
        return res.status(404).json({ error: 'PDF not found' });
      }

      if (fs.existsSync(pdf.filePath)) {
        fs.unlinkSync(pdf.filePath);
      }

      if (pdf.coverImage) {
          const thumbPath = path.join(THUMBNAILS_DIR, pdf.coverImage);
          if (fs.existsSync(thumbPath)) {
            fs.unlinkSync(thumbPath);
          }
      }

      const success = await storage.deletePdf(id);
      
      if (!success) {
        return res.status(404).json({ error: 'PDF not found' });
      }
      
      res.json({ message: 'PDF deleted successfully' });
    } catch (error) {
      console.error('Error deleting PDF:', error);
      res.status(500).json({ error: 'Failed to delete PDF' });
    }
  });

  app.post('/api/ratings', async (req, res) => {
    try {
      const { pdfId, userId, isPositive } = req.body;
      
      const existingRating = await storage.getUserRating(userId, pdfId);
      
      if (existingRating) {
        const rating = await storage.updateRating(existingRating.id, { isPositive });
        res.json(rating);
      } else {
        const ratingData = { pdfId, userId, isPositive };
        const rating = await storage.createRating(ratingData);
        res.status(201).json(rating);
      }
    } catch (error) {
      console.error('Error handling rating:', error);
      res.status(400).json({ error: 'Failed to handle rating' });
    }
  });

  app.get('/api/dmca', requireAdmin, async (req, res) => {
    try {
      const requests = await storage.getAllDmcaRequests();
      res.json(requests);
    } catch (error) {
      console.error('Error fetching DMCA requests:', error);
      res.status(500).json({ error: 'Failed to fetch DMCA requests' });
    }
  });

  app.post('/api/dmca', async (req, res) => {
    try {
      const requestData = insertDmcaRequestSchema.parse(req.body);
      const request = await storage.createDmcaRequest(requestData);
      res.status(201).json(request);
    } catch (error) {
      console.error('Error creating DMCA request:', error);
      res.status(400).json({ error: 'Failed to create DMCA request' });
    }
  });

  app.patch('/api/dmca/:id', requireAdmin, async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const { status } = req.body;
      
      if (!status) {
        return res.status(400).json({ error: 'Status is required' });
      }
      
      const dmcaRequest = await storage.updateDmcaRequest(id, status);
      
      if (!dmcaRequest) {
        return res.status(404).json({ error: 'DMCA request not found' });
      }
      
      res.json(dmcaRequest);
    } catch (error) {
      console.error('Error updating DMCA request:', error);
      res.status(400).json({ error: 'Failed to update DMCA request' });
    }
  });

  app.get("/api/admin/redirects", requireAdmin, async (req, res) => {
    try {
      const redirects = await db.select({
        id: slugHistory.id,
        oldSlug: slugHistory.oldSlug,
        newSlug: slugHistory.newSlug,
        pdfId: slugHistory.pdfId,
        pdfTitle: pdfs.title,
        createdAt: slugHistory.createdAt,
        redirectUntil: slugHistory.redirectUntil
      })
      .from(slugHistory)
      .leftJoin(pdfs, eq(slugHistory.pdfId, pdfs.id))
      .orderBy(desc(slugHistory.createdAt));

      res.json(redirects);
    } catch (error) {
      console.error('Error fetching redirects:', error);
      res.status(500).json({ error: 'Failed to fetch redirects' });
    }
  });

  app.get('/api/seo-settings', requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSeoSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching SEO settings:', error);
      res.status(500).json({ error: 'Failed to fetch SEO settings' });
    }
  });

  app.put('/api/seo-settings', requireAdmin, async (req, res) => {
    try {
      const settingsData = insertSeoSettingsSchema.parse(req.body);
      const settings = await storage.updateSeoSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error('Error updating SEO settings:', error);
      res.status(400).json({ error: 'Failed to update SEO settings' });
    }
  });

  app.get('/robots.txt', async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      res.setHeader('Content-Type', 'text/plain');
      res.send(seoSettings.robotsTxt || 'User-agent: *\nAllow: /');
    } catch (error) {
      console.error('Error fetching robots.txt:', error);
      res.setHeader('Content-Type', 'text/plain');
      res.send('User-agent: *\nAllow: /');
    }
  });

  app.get('/api/site-settings', requireAdmin, async (req, res) => {
    try {
      const settings = await storage.getSiteSettings();
      res.json(settings);
    } catch (error) {
      console.error('Error fetching site settings:', error);
      res.status(500).json({ error: 'Failed to fetch site settings' });
    }
  });

  app.put('/api/site-settings', requireAdmin, async (req, res) => {
    try {
      const settingsData = insertSiteSettingsSchema.parse(req.body);
      const settings = await storage.updateSiteSettings(settingsData);
      res.json(settings);
    } catch (error) {
      console.error('Error updating site settings:', error);
      res.status(400).json({ error: 'Failed to update site settings' });
    }
  });

  app.get('/api/admin/stats', requireAdmin, async (req, res) => {
    try {
      const pdfs = await storage.getAllPdfs();
      const categories = await storage.getAllCategories();
      const dmcaRequests = await storage.getAllDmcaRequests();
      
      const categoryStats = categories.map(category => {
        const categoryPdfs = pdfs.filter(pdf => pdf.categoryId === category.id);
        return {
          id: category.id,
          name: category.name,
          slug: category.slug,
          count: categoryPdfs.length,
          percentage: pdfs.length > 0 ? Math.round((categoryPdfs.length / pdfs.length) * 100) : 0
        };
      });

      const stats = {
        userCount: 1, // Only admin user
        pdfCount: pdfs.length,
        totalViews: pdfs.reduce((sum, pdf) => sum + (pdf.views || 0), 0),
        totalDownloads: pdfs.reduce((sum, pdf) => sum + (pdf.downloads || 0), 0),
        pendingDmcaCount: dmcaRequests.filter(req => req.status === 'pending').length,
        categoryStats
      };

      res.json(stats);
    } catch (error) {
      console.error('Error getting admin stats:', error);
      res.status(500).json({ error: 'Failed to get admin stats' });
    }
  });

  app.get('/api/admin/pdfs', requireAdmin, async (req, res) => {
    try {
      const pdfs = await storage.getAllPdfs();
      res.json(pdfs);
    } catch (error) {
      console.error('Error getting admin PDFs:', error);
      res.status(500).json({ error: 'Failed to get PDFs' });
    }
  });

  app.get('/api/users/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const user = await storage.getUser(id);
      
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      
      res.json({
        id: user.id,
        username: user.username,
        isAdmin: user.isAdmin
      });
    } catch (error) {
      console.error('Error getting user:', error);
      res.status(500).json({ error: 'Failed to get user' });
    }
  });

  app.get('/api/categories/:id', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const category = await storage.getCategory(id);
      
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      
      res.json(category);
    } catch (error) {
      console.error('Error getting category:', error);
      res.status(500).json({ error: 'Failed to get category' });
    }
  });

  app.get('/api/categories/:id/pdfs', async (req, res) => {
    try {
      const id = parseInt(req.params.id);
      const pdfs = await storage.getPdfsByCategory(id);
      res.json(pdfs);
    } catch (error) {
      console.error('Error getting PDFs by category:', error);
      res.status(500).json({ error: 'Failed to get PDFs' });
    }
  });

  app.get('/api/seo', async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      res.json(seoSettings);
    } catch (error) {
      console.error('Error getting SEO settings:', error);
      res.status(500).json({ error: 'Failed to get SEO settings' });
    }
  });

  app.get('/api/pdfs/formatted-title', async (req, res) => {
    try {
      const { title } = req.query;
      if (!title) {
        return res.status(400).json({ error: 'Title parameter is required' });
      }
      
      const formattedTitle = await storage.getFormattedPdfTitle(title as string);
      res.json({ formattedTitle });
    } catch (error) {
      console.error('Error formatting PDF title:', error);
      res.status(500).json({ error: 'Failed to format title' });
    }
  });

  app.get('/api/user/download-limit', async (req, res) => {
    try {
      res.json({ 
        hasLimit: false,
        dailyLimit: null,
        remainingDownloads: null
      });
    } catch (error) {
      console.error('Error getting download limit:', error);
      res.status(500).json({ error: 'Failed to get download limit' });
    }
  });

  app.get('/api/pdfs/:id/user-rating', async (req, res) => {
    try {
      const pdfId = parseInt(req.params.id);
      const userIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      
      const existingRating = await storage.getUserRatingByIP(userIP, pdfId);
      
      if (existingRating) {
        res.json({ rating: { isPositive: existingRating.isPositive } });
      } else {
        res.json({ rating: null });
      }
    } catch (error) {
      console.error('Error getting user rating:', error);
      res.status(500).json({ error: 'Failed to get user rating' });
    }
  });

  app.post('/api/pdfs/:id/rate', async (req, res) => {
    try {
      const pdfId = parseInt(req.params.id);
      const { isPositive } = req.body;
      
      if (typeof isPositive !== 'boolean') {
        return res.status(400).json({ error: 'isPositive must be boolean' });
      }

      const userIP = req.ip || req.connection.remoteAddress || '127.0.0.1';
      
      const existingRating = await storage.getUserRatingByIP(userIP, pdfId);
      
      if (existingRating) {
        await storage.updateRating(existingRating.id, { 
          isPositive: isPositive 
        });
      } else {
        await storage.createRating({
          pdfId,
          userIp: userIP,
          isPositive: isPositive
        });
      }

      const ratingStats = await storage.calculatePdfRating(pdfId);
      
      res.json({ 
        success: true,
        ...ratingStats
      });
    } catch (error) {
      console.error('Error rating PDF:', error);
      res.status(500).json({ error: 'Failed to rate PDF' });
    }
  });

  app.get('/health', async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      
      res.status(200).json({
        status: 'healthy',
        timestamp: new Date().toISOString(),
        uptime: process.uptime(),
        memory: process.memoryUsage(),
        database: 'connected',
        version: process.env.npm_package_version || '1.0.0'
      });
    } catch (error) {
      res.status(503).json({
        status: 'unhealthy',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error',
        database: 'disconnected'
      });
    }
  });

  app.get('/api/status', async (req, res) => {
    try {
      await db.execute(sql`SELECT 1`);
      res.json({
        status: 'Sistema PDF funcionando',
        timestamp: new Date().toISOString(),
        database: 'connected'
      });
    } catch (error) {
      res.status(500).json({
        status: 'error',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Unknown error'
      });
    }
  });

  app.get('/ready', async (req, res) => {
    try {
      await db.execute(sql`SELECT 1 FROM users LIMIT 1`);
      await db.execute(sql`SELECT 1 FROM categories LIMIT 1`);
      
      res.status(200).json({
        status: 'ready',
        timestamp: new Date().toISOString(),
        database: 'initialized'
      });
    } catch (error) {
      res.status(503).json({
        status: 'not_ready',
        timestamp: new Date().toISOString(),
        error: error instanceof Error ? error.message : 'Tables not initialized'
      });
    }
  });

  app.use('/uploads', express.static(path.join(process.cwd(), 'uploads')));

  app.get('/sitemap-index.xml', generateSitemapIndex);
  app.get('/sitemap.xml', generateSitemap);
  
  app.get('/sitemap-pages.xml', generatePagesSitemap);
  app.get('/sitemap-categories.xml', generateCategoriesSitemap);
  app.get('/sitemap-pdfs.xml', generatePdfsSitemap);

  app.get('/api/seo-validation', requireAdmin, async (req, res) => {
    try {
      const validation = await seoOptimizer.validateSEOOptimization();
      res.json(validation);
    } catch (error) {
      console.error('Error validating SEO:', error);
      res.status(500).json({ error: 'Failed to validate SEO' });
    }
  });

  app.get('/api/pdfs/:slug/structured-data', async (req, res) => {
    try {
      const pdf = await storage.getPdfBySlug(req.params.slug);
      if (!pdf || !pdf.isPublic) {
        return res.status(404).json({ error: 'PDF not found' });
      }

      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const structuredData = await seoOptimizer.generatePdfStructuredData(pdf, baseUrl);
      
      res.setHeader('Content-Type', 'application/ld+json');
      res.send(structuredData);
    } catch (error) {
      console.error('Error generating structured data:', error);
      res.status(500).json({ error: 'Failed to generate structured data' });
    }
  });

  app.get('/robots.txt', async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      res.setHeader('Content-Type', 'text/plain');
      const robotsTxt = seoSettings.robotsTxt || 'User-agent: *\nAllow: /';
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const robotsWithSitemap = `${robotsTxt}\n\nSitemap: ${baseUrl}/sitemap-index.xml`;
      res.send(robotsWithSitemap);
    } catch (error) {
      console.error('Error fetching robots.txt:', error);
      res.setHeader('Content-Type', 'text/plain');
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      res.send(`User-agent: *\nAllow: /\n\nSitemap: ${baseUrl}/sitemap-index.xml`);
    }
  });

  app.get('/rss.xml', async (req, res) => {
    try {
      const baseUrl = `${req.protocol}://${req.get('host')}`;
      const rss = await googleSEOHelpers.generateRSSFeed(baseUrl);
      
      res.set('Content-Type', 'application/rss+xml');
      res.send(rss);
    } catch (error) {
      console.error('Error generating RSS feed:', error);
      res.status(500).send('Error generating RSS feed');
    }
  });

  app.get('/google*.html', async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      const fileName = req.path.substring(1);
      
      if (seoSettings.googleVerification && fileName.includes(seoSettings.googleVerification)) {
        res.send(`google-site-verification: ${fileName}`);
      } else {
        res.status(404).send('Not found');
      }
    } catch (error) {
      console.error('Error serving Google verification:', error);
      res.status(404).send('Not found');
    }
  });

  app.get('/BingSiteAuth.xml', async (req, res) => {
    try {
      const seoSettings = await storage.getSeoSettings();
      
      if (seoSettings.bingVerification) {
        const xml = `<?xml version="1.0"?>
<users>
  <user>${seoSettings.bingVerification}</user>
</users>`;
        res.set('Content-Type', 'application/xml');
        res.send(xml);
      } else {
        res.status(404).send('Not found');
      }
    } catch (error) {
      console.error('Error serving Bing verification:', error);
      res.status(404).send('Not found');
    }
  });

  app.get('/api/export-database', requireAdmin, async (req, res) => {
    try {
      await exportDatabase(res);
    } catch (error) {
      console.error('Error exporting database:', error);
      res.status(500).json({ error: 'Failed to export database' });
    }
  });

  app.post('/api/import-database', requireAdmin, upload.single('backup'), async (req, res) => {
    try {
      if (!req.file) {
        return res.status(400).json({ error: 'No backup file provided' });
      }

      await importDatabase(req.file.path);
      res.json({ message: 'Database imported successfully' });
    } catch (error) {
      console.error('Error importing database:', error);
      res.status(500).json({ error: 'Failed to import database' });
    }
  });
}
