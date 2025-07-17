import { RequestHandler } from 'express';
import { PostgresStorage } from './db-storage';

// Helper function to generate sitemap URL tags
function generateUrlTag(
  loc: string,
  priority: string = '0.8',
  changefreq: string = 'daily',
  lastmod?: string,
  imageUrl?: string
): string {
  let urlTag = '  <url>\n';
  urlTag += `    <loc>${loc}</loc>\n`;

  if (lastmod) {
    urlTag += `    <lastmod>${lastmod}</lastmod>\n`;
  }

  if (imageUrl) {
    urlTag += '    <image:image>\n';
    urlTag += `      <image:loc>${imageUrl}</image:loc>\n`;
    urlTag += '    </image:image>\n';
  }

  urlTag += `    <changefreq>${changefreq}</changefreq>\n`;
  urlTag += `    <priority>${priority}</priority>\n`;
  urlTag += '  </url>\n';

  return urlTag;
}

// Helper function to generate sitemap index entries
function generateSitemapIndexEntry(
  loc: string,
  lastmod?: string
): string {
  let entry = '  <sitemap>\n';
  entry += `    <loc>${loc}</loc>\n`;
  if (lastmod) {
    entry += `    <lastmod>${lastmod}</lastmod>\n`;
  }
  entry += '  </sitemap>\n';
  return entry;
}

// Sitemap Index - Principal que lista todos os outros sitemaps
export const generateSitemapIndex: RequestHandler = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;
    const now = new Date().toISOString();

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<sitemapindex xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Sitemap de páginas estáticas
    xml += generateSitemapIndexEntry(
      `${baseUrl}/sitemap-pages.xml`,
      now
    );

    // Sitemap de categorias
    xml += generateSitemapIndexEntry(
      `${baseUrl}/sitemap-categories.xml`,
      now
    );

    // Sitemap de PDFs
    xml += generateSitemapIndexEntry(
      `${baseUrl}/sitemap-pdfs.xml`,
      now
    );

    xml += '</sitemapindex>';
    
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Erro ao gerar sitemap index:', error);
    res.status(500).send('Erro ao gerar sitemap index');
  }
};

// Sitemap de PDFs - apenas PDFs públicos
export const generatePdfsSitemap: RequestHandler = async (req, res) => {
  try {
    const storage = new PostgresStorage();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9"\n';
    xml += '        xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">\n';

    // PDFs públicos
    const pdfs = await storage.getAllPdfs();
    for (const pdf of pdfs) {
      if (pdf.isPublic) {
        xml += generateUrlTag(
          `${baseUrl}/pdf/${pdf.slug}`,
          '0.9',
          'weekly',
          pdf.createdAt ? new Date(pdf.createdAt).toISOString() : undefined,
          pdf.coverImage ? `${baseUrl}/uploads/thumbnails/${pdf.coverImage}` : undefined
        );
      }
    }

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Erro ao gerar sitemap de PDFs:', error);
    res.status(500).send('Erro ao gerar sitemap de PDFs');
  }
};

// Sitemap de Categorias - todas as categorias
export const generateCategoriesSitemap: RequestHandler = async (req, res) => {
  try {
    const storage = new PostgresStorage();
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Categorias
    const categories = await storage.getAllCategories();
    for (const category of categories) {
      xml += generateUrlTag(
        `${baseUrl}/categoria/${category.slug}`,
        '0.8',
        'weekly'
      );
    }

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Erro ao gerar sitemap de categorias:', error);
    res.status(500).send('Erro ao gerar sitemap de categorias');
  }
};

// Sitemap de Páginas - páginas estáticas do site
export const generatePagesSitemap: RequestHandler = async (req, res) => {
  try {
    const baseUrl = `${req.protocol}://${req.get('host')}`;

    let xml = '<?xml version="1.0" encoding="UTF-8"?>\n';
    xml += '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n';

    // Páginas estáticas principais
    const staticPages = [
      { url: '/', priority: '1.0', changefreq: 'daily' },
      { url: '/sobre', priority: '0.8', changefreq: 'monthly' },
      { url: '/contato', priority: '0.8', changefreq: 'monthly' },
      { url: '/termos', priority: '0.5', changefreq: 'yearly' },
      { url: '/privacidade', priority: '0.5', changefreq: 'yearly' },
      { url: '/dmca', priority: '0.5', changefreq: 'yearly' },
      { url: '/pesquisar', priority: '0.9', changefreq: 'daily' }
    ];

    for (const page of staticPages) {
      xml += generateUrlTag(
        `${baseUrl}${page.url}`,
        page.priority,
        page.changefreq,
        new Date().toISOString()
      );
    }

    xml += '</urlset>';
    res.header('Content-Type', 'application/xml');
    res.send(xml);
  } catch (error) {
    console.error('Erro ao gerar sitemap de páginas:', error);
    res.status(500).send('Erro ao gerar sitemap de páginas');
  }
};

// Mantém compatibilidade com rota antiga redirecionando para sitemap de páginas
export const generateMainSitemap: RequestHandler = async (req, res) => {
  // Redireciona para o sitemap de páginas para manter compatibilidade
  res.redirect(301, '/sitemap-pages.xml');
};

// Mantém compatibilidade com sitemap.xml antigo redirecionando para o index
export const generateSitemap: RequestHandler = async (req, res) => {
  // Redireciona para o sitemap index para manter compatibilidade
  res.redirect(301, '/sitemap-index.xml');
};
