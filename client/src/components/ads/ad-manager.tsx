import React, { useEffect } from 'react';
import { useQuery } from '@tanstack/react-query';
import { GoogleAdsense } from './google-adsense';
import { ThirdPartyAd } from './third-party-ad';
import { AdPosition, AdConfig } from './types';

/**
 * Componente para carregar o script global do AdSense no head do documento
 */
export const AdSenseScript: React.FC<{ adClient?: string }> = ({ adClient }) => {
  useEffect(() => {
    if (!adClient) return;
    
    try {
      // Verificar se o script já existe
      const existingScript = document.querySelector('script[src*="pagead2.googlesyndication.com/pagead/js/adsbygoogle.js"]');
      
      if (!existingScript) {
        const script = document.createElement('script');
        script.src = `https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=${adClient}`;
        script.async = true;
        script.crossOrigin = 'anonymous';
        document.head.appendChild(script);
      }
    } catch (error) {
      console.error('Erro ao carregar script do AdSense:', error);
    }
  }, [adClient]);
  
  return null;
};

/**
 * Componente que renderiza anúncios em posições específicas com base nas configurações
 */
export const AdSlot: React.FC<{
  position: AdPosition;
  className?: string;
  style?: React.CSSProperties;
}> = ({ position, className = '', style = {} }) => {
  // Buscar configurações de anúncios
  const { data: adSettings, isLoading } = useQuery<AdConfig>({
    queryKey: ['/api/ads/settings'],
    // Definimos um staleTime maior para evitar muitas requisições
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  // Nenhuma configuração ou anúncios desativados
  if (!adSettings || !adSettings.enabled || isLoading) {
    return null;
  }
  
  // Verificar se esta posição específica está ativada
  const positionConfig = adSettings.positions[position];
  if (!positionConfig || !positionConfig.enabled) {
    return null;
  }
  
  // Renderizar o anúncio apropriado com base no provedor configurado
  if (adSettings.provider === 'adsense' && adSettings.adClient && positionConfig.adSlot) {
    return (
      <GoogleAdsense 
        adClient={adSettings.adClient}
        adSlot={positionConfig.adSlot}
        className={className}
        style={style}
      />
    );
  } else if (adSettings.provider === 'custom') {
    return (
      <ThirdPartyAd
        customScript={positionConfig.customScript}
        customScriptUrl={positionConfig.customScriptUrl}
        className={className}
        style={style}
      />
    );
  }
  
  return null;
};

/**
 * Componente para inicializar o sistema de anúncios globalmente
 * Deve ser usado uma vez no topo da aplicação
 */
export const AdProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { data: adSettings } = useQuery<AdConfig>({
    queryKey: ['/api/ads/settings'],
    staleTime: 1000 * 60 * 5, // 5 minutos
  });
  
  return (
    <>
      {adSettings?.enabled && adSettings.provider === 'adsense' && adSettings.adClient && (
        <AdSenseScript adClient={adSettings.adClient} />
      )}
      {children}
    </>
  );
};