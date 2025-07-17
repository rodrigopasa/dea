import { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';

interface UnifiedSeoProps {
  pageTitle?: string;
  pageDescription?: string;
  canonicalUrl?: string;
  imageUrl?: string;
  type?: 'website' | 'article';
  noIndex?: boolean;
  keywords?: string[];
  published?: string;
  modified?: string;
}

interface SeoSettings {
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl: string;
  ogImage: string;
  twitterHandle: string;
  googleVerification: string;
  bingVerification: string;
  pdfTitleFormat: string;
  gaTrackingId: string;
}

export function UnifiedSeo({
  pageTitle,
  pageDescription,
  canonicalUrl,
  imageUrl,
  type = 'website',
  noIndex = false,
  keywords = [],
  published,
  modified
}: UnifiedSeoProps) {
  // Buscar configurações de SEO do painel admin
  const { data: seoSettings } = useQuery<SeoSettings>({
    queryKey: ['/api/seo-settings'],
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  useEffect(() => {
    if (!seoSettings) return;

    // Função para criar/atualizar meta tags
    const setMetaTag = (name: string, content: string, attribute: 'name' | 'property' = 'name') => {
      if (!content) return;
      
      const existingTag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (existingTag) {
        existingTag.setAttribute('content', content);
      } else {
        const metaTag = document.createElement('meta');
        metaTag.setAttribute(attribute, name);
        metaTag.setAttribute('content', content);
        document.head.appendChild(metaTag);
      }
    };

    // Função para remover meta tags
    const removeMetaTag = (name: string, attribute: 'name' | 'property' = 'name') => {
      const tag = document.querySelector(`meta[${attribute}="${name}"]`);
      if (tag) tag.remove();
    };

    // Título da página
    const finalTitle = pageTitle 
      ? (seoSettings.pdfTitleFormat ? seoSettings.pdfTitleFormat.replace('${title}', pageTitle) : pageTitle)
      : seoSettings.siteTitle;
    
    document.title = finalTitle;

    // Descrição da página
    const finalDescription = pageDescription || seoSettings.siteDescription;
    setMetaTag('description', finalDescription);

    // Keywords
    const finalKeywords = keywords.length > 0 
      ? keywords.join(', ')
      : seoSettings.siteKeywords;
    setMetaTag('keywords', finalKeywords);

    // Robots
    setMetaTag('robots', noIndex ? 'noindex, nofollow' : 'index, follow');

    // URL Canônica
    let canonicalElement = document.querySelector('link[rel="canonical"]');
    if (canonicalUrl) {
      if (canonicalElement) {
        canonicalElement.setAttribute('href', canonicalUrl);
      } else {
        canonicalElement = document.createElement('link');
        canonicalElement.setAttribute('rel', 'canonical');
        canonicalElement.setAttribute('href', canonicalUrl);
        document.head.appendChild(canonicalElement);
      }
    }

    // Open Graph
    setMetaTag('og:title', finalTitle, 'property');
    setMetaTag('og:description', finalDescription, 'property');
    setMetaTag('og:type', type, 'property');
    setMetaTag('og:site_name', seoSettings.siteTitle, 'property');
    
    if (canonicalUrl) {
      setMetaTag('og:url', canonicalUrl, 'property');
    }
    
    const finalImageUrl = imageUrl || seoSettings.ogImage;
    if (finalImageUrl) {
      setMetaTag('og:image', finalImageUrl, 'property');
      setMetaTag('og:image:width', '1200', 'property');
      setMetaTag('og:image:height', '630', 'property');
      setMetaTag('og:image:alt', finalTitle, 'property');
    }

    if (published) {
      setMetaTag('article:published_time', published, 'property');
    }
    
    if (modified) {
      setMetaTag('article:modified_time', modified, 'property');
    }

    // Twitter Card
    setMetaTag('twitter:card', 'summary_large_image');
    setMetaTag('twitter:title', finalTitle);
    setMetaTag('twitter:description', finalDescription);
    
    if (seoSettings.twitterHandle) {
      setMetaTag('twitter:site', seoSettings.twitterHandle);
    }
    
    if (finalImageUrl) {
      setMetaTag('twitter:image', finalImageUrl);
      setMetaTag('twitter:image:alt', finalTitle);
    }

    // Verificação do Google
    if (seoSettings.googleVerification) {
      setMetaTag('google-site-verification', seoSettings.googleVerification);
    }

    // Verificação do Bing
    if (seoSettings.bingVerification) {
      setMetaTag('msvalidate.01', seoSettings.bingVerification);
    }

    // Google Analytics
    if (seoSettings.gaTrackingId) {
      // Remover script anterior se existir
      const existingScript = document.querySelector('script[src*="googletagmanager.com"]');
      if (existingScript) {
        existingScript.remove();
      }

      // Adicionar novo script do Google Analytics
      const script = document.createElement('script');
      script.async = true;
      script.src = `https://www.googletagmanager.com/gtag/js?id=${seoSettings.gaTrackingId}`;
      document.head.appendChild(script);

      const inlineScript = document.createElement('script');
      inlineScript.innerHTML = `
        window.dataLayer = window.dataLayer || [];
        function gtag(){dataLayer.push(arguments);}
        gtag('js', new Date());
        gtag('config', '${seoSettings.gaTrackingId}');
      `;
      document.head.appendChild(inlineScript);
    }

    // Cleanup function
    return () => {
      // Limpar meta tags ao desmontar
      const metaTagsToClean = [
        'description', 'keywords', 'robots', 'google-site-verification', 'msvalidate.01'
      ];
      
      const propertyTagsToClean = [
        'og:title', 'og:description', 'og:type', 'og:url', 'og:image', 
        'og:image:width', 'og:image:height', 'og:image:alt', 'og:site_name',
        'article:published_time', 'article:modified_time'
      ];
      
      const twitterTagsToClean = [
        'twitter:card', 'twitter:title', 'twitter:description', 'twitter:site',
        'twitter:image', 'twitter:image:alt'
      ];
      
      metaTagsToClean.forEach(tag => removeMetaTag(tag, 'name'));
      propertyTagsToClean.forEach(tag => removeMetaTag(tag, 'property'));
      twitterTagsToClean.forEach(tag => removeMetaTag(tag, 'name'));
    };
  }, [
    seoSettings, pageTitle, pageDescription, canonicalUrl, imageUrl, 
    type, noIndex, keywords, published, modified
  ]);

  return null;
}

export default UnifiedSeo;