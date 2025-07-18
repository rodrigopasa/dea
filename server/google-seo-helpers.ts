import { Request, Response } from 'express';
import { PostgresStorage } from './db-storage';

/**
 * Helpers específicos para otimização no Google
 */

export class GoogleSEOHelpers {
  private storage: PostgresStorage;

  constructor(storage: PostgresStorage) {
    this.storage = storage;
  }

  /**
   * Gera feed RSS para melhor indexação
   */
  async generateRSSFeed(baseUrl: string): Promise<string> {
    const recentPdfs = await this.storage.getRecentPdfs(50);
    const seoSettings = await this.storage.getSeoSettings();
    
    let rss = '<?xml version="1.0" encoding="UTF-8"?>\n';
    rss += '<rss version="2.0" xmlns:atom="http://www.w3.org/2005/Atom">\n';
    rss += '<channel>\n';
    rss += `<title>${seoSettings.siteTitle}</title>\n`;
    rss += `<link>${baseUrl}</link>\n`;
    rss += `<description>${seoSettings.siteDescription}</description>\n`;
    rss += `<language>pt-BR</language>\n`;
    rss += `<lastBuildDate>${new Date().toUTCString()}</lastBuildDate>\n`;
    rss += `<atom:link href="${baseUrl}/rss.xml" rel="self" type="application/rss+xml" />\n`;
    
    for (const pdf of recentPdfs) {
      rss += '<item>\n';
      rss += `<title>${pdf.title}</title>\n`;
      rss += `<link>${baseUrl}/pdf/${pdf.slug}</link>\n`;
      rss += `<description><![CDATA[${pdf.description}]]></description>\n`;
      rss += `<pubDate>${new Date(pdf.createdAt).toUTCString()}</pubDate>\n`;
      rss += `<guid>${baseUrl}/pdf/${pdf.slug}</guid>\n`;
      if (pdf.coverImage) {
        rss += `<enclosure url="${baseUrl}/${pdf.coverImage}" type="image/jpeg" />\n`;
      }
      rss += '</item>\n';
    }
    
    rss += '</channel>\n';
    rss += '</rss>';
    
    return rss;
  }

  /**
   * Gera breadcrumbs estruturados
   */
  generateBreadcrumbStructuredData(breadcrumbs: Array<{name: string, url: string}>): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "BreadcrumbList",
      "itemListElement": breadcrumbs.map((crumb, index) => ({
        "@type": "ListItem",
        "position": index + 1,
        "name": crumb.name,
        "item": crumb.url
      }))
    };
    
    return JSON.stringify(structuredData);
  }

  /**
   * Gera meta tags otimizadas para Google
   */
  generateGoogleOptimizedMetaTags(data: {
    title: string;
    description: string;
    url: string;
    image?: string;
    type?: 'website' | 'article';
    publishedTime?: string;
    modifiedTime?: string;
    keywords?: string[];
  }): string {
    const { title, description, url, image, type = 'website', publishedTime, modifiedTime, keywords = [] } = data;
    
    let metaTags = `
    <!-- Google-optimized Meta Tags -->
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large, max-video-preview:-1">
    <link rel="canonical" href="${url}">
    
    <!-- Keywords -->
    <meta name="keywords" content="${keywords.join(', ')}">
    
    <!-- Open Graph -->
    <meta property="og:locale" content="pt_BR">
    <meta property="og:type" content="${type}">
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:url" content="${url}">
    <meta property="og:site_name" content="${data.siteName || 'Sistema de PDFs'}">
    `;
    
    if (image) {
      metaTags += `
    <meta property="og:image" content="${image}">
    <meta property="og:image:secure_url" content="${image}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:image:alt" content="${title}">
    <meta property="og:image:type" content="image/jpeg">
      `;
    }
    
    if (publishedTime) {
      metaTags += `<meta property="article:published_time" content="${publishedTime}">\n`;
    }
    
    if (modifiedTime) {
      metaTags += `<meta property="article:modified_time" content="${modifiedTime}">\n`;
    }
    
    // Twitter Cards
    metaTags += `
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    `;
    
    if (image) {
      metaTags += `<meta name="twitter:image" content="${image}">\n`;
    }
    
    return metaTags.trim();
  }

  /**
   * Gera preload links para melhor performance
   */
  generatePreloadLinks(urls: string[]): string {
    return urls.map(url => `<link rel="preload" href="${url}" as="image">`).join('\n');
  }

  /**
   * Gera meta tags para Core Web Vitals
   */
  generateCoreWebVitalsOptimization(): string {
    return `
    <!-- Core Web Vitals optimization -->
    <meta name="viewport" content="width=device-width, initial-scale=1">
    <meta name="theme-color" content="#1a1a1a">
    <link rel="preconnect" href="https://fonts.googleapis.com">
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
    <link rel="dns-prefetch" href="//fonts.googleapis.com">
    <link rel="dns-prefetch" href="//fonts.gstatic.com">
    `.trim();
  }

  /**
   * Gera FAQ schema para páginas de PDFs
   */
  generateFAQSchema(faqs: Array<{question: string, answer: string}>): string {
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "FAQPage",
      "mainEntity": faqs.map(faq => ({
        "@type": "Question",
        "name": faq.question,
        "acceptedAnswer": {
          "@type": "Answer",
          "text": faq.answer
        }
      }))
    };
    
    return JSON.stringify(structuredData);
  }

  /**
   * Gera meta tags para rich snippets
   */
  generateRichSnippetMeta(data: {
    rating?: number;
    reviews?: number;
    price?: string;
    availability?: string;
  }): string {
    let metaTags = '';
    
    if (data.rating && data.reviews) {
      metaTags += `
    <meta name="rating" content="${data.rating}">
    <meta name="review_count" content="${data.reviews}">
      `;
    }
    
    if (data.price) {
      metaTags += `<meta name="price" content="${data.price}">\n`;
    }
    
    if (data.availability) {
      metaTags += `<meta name="availability" content="${data.availability}">\n`;
    }
    
    return metaTags.trim();
  }
}

export default GoogleSEOHelpers;
