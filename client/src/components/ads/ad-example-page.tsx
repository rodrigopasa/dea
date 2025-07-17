import React from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { AdSlot } from './ad-manager';
import { useLocation } from 'wouter';
import { Button } from '@/components/ui/button';
import { ChevronLeft } from 'lucide-react';

/**
 * Página de exemplo para visualizar as posições de anúncios disponíveis
 */
export default function AdExamplePage() {
  const [_, navigate] = useLocation();
  
  return (
    <div className="container mx-auto py-8 max-w-5xl">
      <div className="flex items-center mb-8 gap-4">
        <Button variant="outline" onClick={() => navigate('/admin')} className="flex items-center gap-2">
          <ChevronLeft className="h-4 w-4" />
          Voltar ao painel
        </Button>
        <div>
          <h1 className="text-2xl font-bold">Exemplos de Posições de Anúncios</h1>
          <p className="text-muted-foreground">Visualize como os anúncios aparecem em diferentes posições no site</p>
        </div>
      </div>
      
      {/* Home */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Página Inicial</CardTitle>
          <CardDescription>Posições de anúncios na página inicial</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Topo da página (home_top)</h3>
            <div className="border rounded-md p-4">
              <AdSlot position="home_top" className="min-h-[90px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Meio da página (home_middle)</h3>
            <div className="border rounded-md p-4">
              <AdSlot position="home_middle" className="min-h-[250px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Rodapé da página (home_bottom)</h3>
            <div className="border rounded-md p-4">
              <AdSlot position="home_bottom" className="min-h-[90px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Sidebar */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Barra Lateral</CardTitle>
          <CardDescription>Posições de anúncios na barra lateral</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Topo da barra lateral (sidebar_top)</h3>
            <div className="border rounded-md p-4 max-w-[300px]">
              <AdSlot position="sidebar_top" className="min-h-[250px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Rodapé da barra lateral (sidebar_bottom)</h3>
            <div className="border rounded-md p-4 max-w-[300px]">
              <AdSlot position="sidebar_bottom" className="min-h-[250px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* PDF Details */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Página de Detalhes do PDF</CardTitle>
          <CardDescription>Posições de anúncios na página de detalhes</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Antes do conteúdo (pdf_details_before_content)</h3>
            <div className="border rounded-md p-4">
              <AdSlot position="pdf_details_before_content" className="min-h-[90px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Após o conteúdo (pdf_details_after_content)</h3>
            <div className="border rounded-md p-4">
              <AdSlot position="pdf_details_after_content" className="min-h-[90px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      {/* Category & Search */}
      <Card className="mb-8">
        <CardHeader>
          <CardTitle>Categorias e Busca</CardTitle>
          <CardDescription>Posições de anúncios em listagens e resultados</CardDescription>
        </CardHeader>
        <CardContent className="space-y-8">
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Topo da página de categoria (category_top)</h3>
            <div className="border rounded-md p-4">
              <AdSlot position="category_top" className="min-h-[90px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
          
          <div className="space-y-2">
            <h3 className="text-lg font-medium">Entre resultados de busca (search_results_inline)</h3>
            <div className="border rounded-md p-4">
              <AdSlot position="search_results_inline" className="min-h-[90px] bg-slate-100 flex items-center justify-center" />
            </div>
          </div>
        </CardContent>
      </Card>
      
      <Card>
        <CardHeader>
          <CardTitle>Como usar</CardTitle>
          <CardDescription>Instruções para implementar anúncios no site</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            <p>Para exibir anúncios em qualquer lugar do site, use o componente <code>AdSlot</code> com a posição desejada:</p>
            
            <pre className="bg-slate-100 p-4 rounded-md overflow-x-auto">
              <code>{`import { AdSlot } from '@/components/ads/ad-manager';
              
// Em seu componente:
<AdSlot position="home_top" />`}</code>
            </pre>
            
            <div className="mt-6">
              <h3 className="text-lg font-medium mb-2">Posições disponíveis:</h3>
              <ul className="list-disc pl-5 space-y-1">
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
          </div>
        </CardContent>
      </Card>
    </div>
  );
}