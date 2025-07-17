import React, { useEffect, useRef } from 'react';

interface ThirdPartyAdProps {
  customScript?: string;
  customScriptUrl?: string;
  className?: string;
  style?: React.CSSProperties;
}

/**
 * Componente para exibir anúncios de terceiros usando scripts personalizados
 * 
 * @example
 * <ThirdPartyAd 
 *   customScript={`document.write('<div>Anúncio personalizado</div>');`}
 *   customScriptUrl="https://exemplo.com/ads.js"
 * />
 */
export const ThirdPartyAd: React.FC<ThirdPartyAdProps> = ({
  customScript,
  customScriptUrl,
  className = '',
  style = {},
}) => {
  const adContainerRef = useRef<HTMLDivElement>(null);
  
  // Função para carregar scripts de URLs externos
  const loadExternalScript = (url: string) => {
    const script = document.createElement('script');
    script.src = url;
    script.async = true;
    
    return new Promise<void>((resolve, reject) => {
      script.onload = () => resolve();
      script.onerror = () => reject(new Error(`Falha ao carregar o script: ${url}`));
      document.body.appendChild(script);
    });
  };
  
  // Função para executar scripts inline com segurança
  const executeInlineScript = (code: string, container: HTMLElement) => {
    try {
      // Criamos um script element e adicionamos o código
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.text = code;
      
      // Limpamos o container e adicionamos o script
      container.innerHTML = '';
      container.appendChild(script);
    } catch (error) {
      console.error('Erro ao executar script personalizado:', error);
    }
  };
  
  useEffect(() => {
    if (!adContainerRef.current) return;
    
    const container = adContainerRef.current;
    
    const loadAd = async () => {
      try {
        // Se temos uma URL de script, carregamos primeiro
        if (customScriptUrl) {
          await loadExternalScript(customScriptUrl);
        }
        
        // Se temos um script inline, executamos
        if (customScript && container) {
          executeInlineScript(customScript, container);
        }
      } catch (error) {
        console.error('Erro ao carregar anúncio personalizado:', error);
      }
    };
    
    loadAd();
    
    // Cleanup na desmontagem
    return () => {
      container.innerHTML = '';
    };
  }, [customScript, customScriptUrl]);
  
  // Em desenvolvimento, mostramos um placeholder se não houver script
  if (process.env.NODE_ENV === 'development' && !customScript && !customScriptUrl) {
    return (
      <div 
        className={`bg-gray-100 border border-gray-300 flex items-center justify-center ${className}`}
        style={{ 
          minHeight: '90px',
          ...style,
        }}
      >
        <div className="text-sm text-gray-500 p-2 text-center">
          Anúncio Personalizado
          <br />
          <span className="text-xs">
            {customScriptUrl ? `Script: ${customScriptUrl}` : 'Sem URL de script'}
          </span>
        </div>
      </div>
    );
  }
  
  return (
    <div 
      ref={adContainerRef}
      className={className}
      style={style}
      data-ad-container="true"
    />
  );
};