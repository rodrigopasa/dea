/**
 * Tipos para o sistema de anúncios
 */

/**
 * Posições disponíveis para anúncios no site
 */
export type AdPosition = 
  | 'home_top' 
  | 'home_middle' 
  | 'home_bottom'
  | 'sidebar_top'
  | 'sidebar_bottom'
  | 'pdf_details_before_content'
  | 'pdf_details_after_content'
  | 'category_top'
  | 'search_results_inline';

/**
 * Configuração para uma posição específica de anúncio
 */
export type AdPositionConfig = {
  enabled: boolean;
  adSlot?: string;
  customScript?: string;
  customScriptUrl?: string;
};

/**
 * Configuração global de anúncios
 */
export type AdConfig = {
  id?: number;
  enabled: boolean;
  provider: 'adsense' | 'custom';
  adClient?: string;
  positions: Record<string, AdPositionConfig>;
  updatedAt?: Date;
};