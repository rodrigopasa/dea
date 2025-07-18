import { Request, Response } from 'express';
import { PostgresStorage } from './db-storage';

/**
 * Sistema de otimização SEO para garantir excelente indexação no Google
 */

export class SEOOptimizer {
  private storage: PostgresStorage;

  constructor(storage: PostgresStorage) {
    this.storage = storage;
  }

  /**
   * Gera structured data (JSON-LD) para um PDF
   */
  async generatePdfStructuredData(pdf: any, baseUrl: string): Promise<string> {
    const seoSettings = await this.storage.getSeoSettings();
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "DigitalDocument",
      "name": pdf.title,
      "description": pdf.description,
      "url": `${baseUrl}/pdf/${pdf.slug}`,
      "thumbnailUrl": pdf.coverImage ? `${baseUrl}/${pdf.coverImage}` : null,
      "datePublished": pdf.createdAt,
      "dateModified": pdf.createdAt,
      "publisher": {
        "@type": "Organization",
        "name": seoSettings.siteTitle,
        "url": baseUrl
      },
      "genre": "Document",
      "encodingFormat": "application/pdf",
      "numberOfPages": pdf.pageCount,
      "contentSize": pdf.fileSize || null,
      "isAccessibleForFree": true,
      "license": "https://creativecommons.org/licenses/by/4.0/",
      "aggregateRating": pdf.totalRatings > 0 ? {
        "@type": "AggregateRating",
        "ratingValue": pdf.likesCount / pdf.totalRatings * 5,
        "bestRating": 5,
        "worstRating": 1,
        "ratingCount": pdf.totalRatings
      } : null,
      "interactionStatistic": [
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/DownloadAction",
          "userInteractionCount": pdf.downloads
        },
        {
          "@type": "InteractionCounter",
          "interactionType": "https://schema.org/ViewAction",
          "userInteractionCount": pdf.views
        }
      ]
    };

    return JSON.stringify(structuredData, null, 2);
  }

  /**
   * Gera structured data para uma categoria
   */
  async generateCategoryStructuredData(category: any, baseUrl: string): Promise<string> {
    const pdfs = await this.storage.getPdfsByCategory(category.id);
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "CollectionPage",
      "name": `${category.name} - PDFs Gratuitos`,
      "description": `Biblioteca de PDFs gratuitos da categoria ${category.name}`,
      "url": `${baseUrl}/categoria/${category.slug}`,
      "mainEntity": {
        "@type": "ItemList",
        "numberOfItems": pdfs.length,
        "itemListElement": pdfs.slice(0, 10).map((pdf, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "DigitalDocument",
            "name": pdf.title,
            "url": `${baseUrl}/pdf/${pdf.slug}`,
            "thumbnailUrl": pdf.coverImage ? `${baseUrl}/${pdf.coverImage}` : null,
            "datePublished": pdf.createdAt
          }
        }))
      }
    };

    return JSON.stringify(structuredData, null, 2);
  }

  /**
   * Gera structured data para a página inicial
   */
  async generateHomeStructuredData(baseUrl: string): Promise<string> {
    const recentPdfs = await this.storage.getRecentPdfs(5);
    const categories = await this.storage.getAllCategories();
    const seoSettings = await this.storage.getSeoSettings();
    
    const structuredData = {
      "@context": "https://schema.org",
      "@type": "WebSite",
      "name": seoSettings.siteTitle,
      "description": seoSettings.siteDescription,
      "url": baseUrl,
      "potentialAction": {
        "@type": "SearchAction",
        "target": `${baseUrl}/buscar?q={search_term_string}`,
        "query-input": "required name=search_term_string"
      },
      "publisher": {
        "@type": "Organization",
        "name": seoSettings.siteTitle,
        "url": baseUrl
      },
      "mainEntity": {
        "@type": "ItemList",
        "name": "PDFs Recentes",
        "itemListElement": recentPdfs.map((pdf, index) => ({
          "@type": "ListItem",
          "position": index + 1,
          "item": {
            "@type": "DigitalDocument",
            "name": pdf.title,
            "url": `${baseUrl}/pdf/${pdf.slug}`,
            "thumbnailUrl": pdf.coverImage ? `${baseUrl}/${pdf.coverImage}` : null
          }
        }))
      }
    };

    return JSON.stringify(structuredData, null, 2);
  }

  /**
   * Gera meta tags otimizadas para um PDF
   */
  async generatePdfMetaTags(pdf: any, baseUrl: string): Promise<string> {
    const seoSettings = await this.storage.getSeoSettings();
    
    // Usar o formato de título das configurações
    const title = seoSettings.pdfTitleFormat 
      ? seoSettings.pdfTitleFormat.replace('${title}', pdf.title)
      : `${pdf.title} | Download PDF Grátis - ${seoSettings.siteTitle}`;
    
    const description = pdf.description.length > 160 
      ? pdf.description.substring(0, 157) + '...' 
      : pdf.description;
    const canonicalUrl = `${baseUrl}/pdf/${pdf.slug}`;
    const imageUrl = pdf.coverImage ? `${baseUrl}/${pdf.coverImage}` : `${baseUrl}${seoSettings.ogImage}`;

    return `
    <title>${title}</title>
    <meta name="description" content="${description}">
    <meta name="keywords" content="pdf grátis, download pdf, ${pdf.title}, ${seoSettings.siteKeywords}">
    <meta name="robots" content="index, follow">
    <link rel="canonical" href="${canonicalUrl}">
    
    <!-- Open Graph -->
    <meta property="og:title" content="${title}">
    <meta property="og:description" content="${description}">
    <meta property="og:type" content="article">
    <meta property="og:url" content="${canonicalUrl}">
    <meta property="og:image" content="${imageUrl}">
    <meta property="og:image:width" content="1200">
    <meta property="og:image:height" content="630">
    <meta property="og:site_name" content="${seoSettings.siteTitle}">
    <meta property="article:published_time" content="${pdf.createdAt}">
    
    <!-- Twitter Card -->
    <meta name="twitter:card" content="summary_large_image">
    <meta name="twitter:title" content="${title}">
    <meta name="twitter:description" content="${description}">
    <meta name="twitter:image" content="${imageUrl}">
    `.trim();
  }

  /**
   * Valida se o site está otimizado para SEO
   */
  async validateSEOOptimization(): Promise<{
    isOptimized: boolean;
    issues: string[];
    recommendations: string[];
  }> {
    const issues: string[] = [];
    const recommendations: string[] = [];

    try {
      // Verificar configurações SEO
      const seoSettings = await this.storage.getSeoSettings();
      
      if (!seoSettings.siteTitle || seoSettings.siteTitle.length < 30) {
        issues.push('Título do site muito curto (recomendado: 30-60 caracteres)');
      }
      
      if (!seoSettings.siteDescription || seoSettings.siteDescription.length < 120) {
        issues.push('Descrição do site muito curta (recomendado: 120-160 caracteres)');
      }
      
      if (!seoSettings.siteKeywords) {
        issues.push('Palavras-chave não configuradas');
      }
      
      if (!seoSettings.googleVerification) {
        recommendations.push('Adicionar Google Search Console verification');
      }
      
      if (!seoSettings.gaTrackingId) {
        recommendations.push('Adicionar Google Analytics tracking');
      }

      // Verificar PDFs
      const pdfs = await this.storage.getAllPdfs();
      const publicPdfs = pdfs.filter(pdf => pdf.isPublic);
      
      if (publicPdfs.length === 0) {
        issues.push('Nenhum PDF público encontrado');
      }

      const pdfsWithoutDescription = publicPdfs.filter(pdf => !pdf.description || pdf.description.length < 50);
      if (pdfsWithoutDescription.length > 0) {
        issues.push(`${pdfsWithoutDescription.length} PDFs sem descrição adequada`);
      }

      const pdfsWithoutThumbnail = publicPdfs.filter(pdf => !pdf.coverImage);
      if (pdfsWithoutThumbnail.length > 0) {
        recommendations.push(`${pdfsWithoutThumbnail.length} PDFs sem thumbnail`);
      }

      return {
        isOptimized: issues.length === 0,
        issues,
        recommendations
      };
    } catch (error) {
      console.error('Error validating SEO optimization:', error);
      return {
        isOptimized: false,
        issues: ['Erro ao validar configurações SEO'],
        recommendations: []
      };
    }
  }
}

export default SEOOptimizer;
