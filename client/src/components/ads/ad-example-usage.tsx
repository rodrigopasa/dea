import React from 'react';
import { AdSlot } from './ad-manager';
import { AdPosition } from './types';

/**
 * Componente de exemplo que mostra como utilizar o AdSlot em diferentes partes da aplicação.
 * Este é um componente puramente educacional e não é necessário usá-lo diretamente.
 */
export const AdExampleUsage: React.FC = () => {
  return (
    <div className="space-y-8">
      <div className="border p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-2">Como usar anúncios no seu site</h2>
        <p className="mb-4">
          Este componente mostra exemplos de como utilizar o componente AdSlot em diferentes partes da aplicação.
        </p>
        
        <h3 className="text-md font-medium mb-2">1. Anúncio na página inicial (topo)</h3>
        <div className="border border-dashed p-2 mb-4">
          <AdSlot position="home_top" className="min-h-[90px] bg-slate-100" />
        </div>
        <code className="block bg-slate-100 p-2 text-sm">
          {'<AdSlot position="home_top" />'}
        </code>
        
        <h3 className="text-md font-medium mb-2 mt-6">2. Anúncio na barra lateral</h3>
        <div className="border border-dashed p-2 mb-4">
          <AdSlot position="sidebar_top" className="min-h-[250px] bg-slate-100" />
        </div>
        <code className="block bg-slate-100 p-2 text-sm">
          {'<AdSlot position="sidebar_top" />'}
        </code>
        
        <h3 className="text-md font-medium mb-2 mt-6">3. Anúncio entre resultados de pesquisa</h3>
        <div className="border border-dashed p-2 mb-4">
          <AdSlot position="search_results_inline" className="min-h-[60px] bg-slate-100" />
        </div>
        <code className="block bg-slate-100 p-2 text-sm">
          {'<AdSlot position="search_results_inline" />'}
        </code>
      </div>
      
      <div className="border p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-4">Lista de posições disponíveis</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li><code>home_top</code> - Topo da página inicial</li>
          <li><code>home_middle</code> - Meio da página inicial</li>
          <li><code>home_bottom</code> - Rodapé da página inicial</li>
          <li><code>sidebar_top</code> - Topo da barra lateral</li>
          <li><code>sidebar_bottom</code> - Rodapé da barra lateral</li>
          <li><code>pdf_details_before_content</code> - Antes do conteúdo PDF</li>
          <li><code>pdf_details_after_content</code> - Após o conteúdo PDF</li>
          <li><code>category_top</code> - Topo da página de categoria</li>
          <li><code>search_results_inline</code> - Entre resultados de pesquisa</li>
        </ul>
      </div>
      
      <div className="border p-4 rounded-md">
        <h2 className="text-lg font-semibold mb-4">Como configurar</h2>
        <p>
          Os anúncios podem ser configurados no painel de administração, onde você pode:
        </p>
        <ul className="list-disc pl-5 space-y-2 mt-2">
          <li>Ativar ou desativar anúncios globalmente</li>
          <li>Escolher entre Google AdSense ou scripts personalizados</li>
          <li>Configurar cada posição individualmente</li>
          <li>Especificar IDs de slot para AdSense ou scripts personalizados</li>
        </ul>
      </div>
    </div>
  );
};