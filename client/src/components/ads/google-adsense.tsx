import React, { useEffect, useRef } from 'react';

interface GoogleAdsenseProps {
  adClient: string; 
  adSlot: string;
  style?: React.CSSProperties;
  format?: 'auto' | 'fluid' | 'rectangle' | 'vertical' | 'horizontal';
  responsive?: boolean;
  className?: string;
}

/**
 * Componente para exibir anúncios do Google AdSense
 * 
 * @example
 * <GoogleAdsense 
 *   adClient="ca-pub-1234567890123456"
 *   adSlot="1234567890"
 * />
 */
export const GoogleAdsense: React.FC<GoogleAdsenseProps> = ({
  adClient,
  adSlot,
  style = {},
  format = 'auto',
  responsive = true,
  className = '',
}) => {
  const adRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    try {
      // Tentativa de executar o código somente quando não estamos em modo de desenvolvimento
      if (process.env.NODE_ENV !== 'development') {
        // Garantir que o script do AdSense esteja carregado
        if (!window.adsbygoogle) {
          const script = document.createElement('script');
          script.src = 'https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js';
          script.async = true;
          script.crossOrigin = 'anonymous';
          
          if (adClient) {
            script.dataset.adClient = adClient;
          }
          
          document.head.appendChild(script);
        }
        
        // Inicializar o anúncio
        (window.adsbygoogle = window.adsbygoogle || []).push({});
      }
    } catch (error) {
      console.error('Erro ao carregar anúncio AdSense:', error);
    }
  }, [adClient]);
  
  // Em desenvolvimento, mostramos apenas um placeholder
  if (process.env.NODE_ENV === 'development') {
    return (
      <div 
        className={`bg-gray-100 border border-gray-300 flex items-center justify-center ${className}`}
        style={{ 
          minHeight: '90px',
          ...style,
        }}
      >
        <div className="text-sm text-gray-500 p-2 text-center">
          Anúncio AdSense
          <br />
          <span className="text-xs">Cliente: {adClient}</span>
          <br />
          <span className="text-xs">Slot: {adSlot}</span>
        </div>
      </div>
    );
  }
  
  // Em produção, mostramos o anúncio real
  return (
    <div className={className}>
      <ins
        className="adsbygoogle"
        style={{
          display: 'block',
          ...style,
        }}
        data-ad-client={adClient}
        data-ad-slot={adSlot}
        data-ad-format={format}
        data-full-width-responsive={responsive ? 'true' : 'false'}
      />
    </div>
  );
};

// Adiciona tipos para o objeto window
declare global {
  interface Window {
    adsbygoogle: any[];
  }
}