import { useState, useEffect } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";
import { queryClient, apiRequest } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Label } from "@/components/ui/label";
import { Save, Globe, Search, Share2, Settings, Eye, Code } from "lucide-react";

interface SeoSettings {
  id: number;
  siteTitle: string;
  siteDescription: string;
  siteKeywords: string;
  siteUrl?: string;
  ogImage: string;
  twitterHandle: string;
  googleVerification: string;
  bingVerification: string;
  robotsTxt: string;
  gaTrackingId: string;
  pdfTitleFormat: string;
  updatedAt: string;
}

export default function SeoSettingsPage() {
  const { toast } = useToast();
  const [formData, setFormData] = useState<Partial<SeoSettings>>({});

  // Buscar configurações atuais de SEO
  const { data: seoSettings, isLoading } = useQuery<SeoSettings>({
    queryKey: ['/api/seo-settings'],
  });

  // Atualizar estado quando os dados forem carregados
  useEffect(() => {
    if (seoSettings) {
      setFormData(seoSettings);
    }
  }, [seoSettings]);

  // Mutation para salvar configurações
  const updateSeoMutation = useMutation({
    mutationFn: async (data: Partial<SeoSettings>) => {
      const response = await apiRequest('PUT', '/api/seo-settings', data);
      return await response.json();
    },
    onSuccess: () => {
      toast({
        title: "Configurações salvas",
        description: "As configurações de SEO foram atualizadas com sucesso.",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/seo-settings'] });
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao salvar",
        description: error.message || "Não foi possível salvar as configurações.",
        variant: "destructive",
      });
    },
  });

  const handleInputChange = (field: keyof SeoSettings, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleSave = () => {
    updateSeoMutation.mutate(formData);
  };

  // Preview das meta tags
  const getPreviewTitle = () => {
    const templateFormat = formData.pdfTitleFormat || '${title} - PDFxandria';
    return templateFormat.replace('${title}', 'Exemplo de PDF');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">Carregando configurações de SEO...</div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8 max-w-6xl">
      <div className="mb-8">
        <h1 className="text-3xl font-bold mb-2 flex items-center">
          <Settings className="mr-3 h-8 w-8 text-primary" />
          Configurações de SEO
        </h1>
        <p className="text-gray-400">
          Configure todos os aspectos de SEO do site de forma centralizada
        </p>
      </div>

      <Tabs defaultValue="basic" className="space-y-6">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="basic" className="flex items-center gap-2">
            <Globe className="w-4 h-4" />
            Básico
          </TabsTrigger>
          <TabsTrigger value="social" className="flex items-center gap-2">
            <Share2 className="w-4 h-4" />
            Redes Sociais
          </TabsTrigger>
          <TabsTrigger value="search" className="flex items-center gap-2">
            <Search className="w-4 h-4" />
            Motores de Busca
          </TabsTrigger>
          <TabsTrigger value="advanced" className="flex items-center gap-2">
            <Code className="w-4 h-4" />
            Avançado
          </TabsTrigger>
          <TabsTrigger value="preview" className="flex items-center gap-2">
            <Eye className="w-4 h-4" />
            Preview
          </TabsTrigger>
        </TabsList>

        {/* Configurações Básicas */}
        <TabsContent value="basic" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Globe className="w-5 h-5" />
                Informações Básicas do Site
              </CardTitle>
              <CardDescription>
                Configure as informações principais que aparecem nos resultados de busca
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="siteTitle">Título do Site</Label>
                  <Input
                    id="siteTitle"
                    value={formData.siteTitle || ''}
                    onChange={(e) => handleInputChange('siteTitle', e.target.value)}
                    placeholder="PDFxandria"
                  />
                  <p className="text-xs text-gray-500">Aparece na aba do navegador e resultados do Google</p>
                </div>
                
                <div className="space-y-2">
                  <Label htmlFor="siteUrl">URL do Site</Label>
                  <Input
                    id="siteUrl"
                    value={formData.siteUrl || ''}
                    onChange={(e) => handleInputChange('siteUrl', e.target.value)}
                    placeholder="https://pdfxandria.com"
                  />
                  <p className="text-xs text-gray-500">URL principal para links canônicos</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteDescription">Descrição do Site</Label>
                <Textarea
                  id="siteDescription"
                  value={formData.siteDescription || ''}
                  onChange={(e) => handleInputChange('siteDescription', e.target.value)}
                  placeholder="Explore e baixe documentos PDF gratuitamente"
                  rows={3}
                />
                <p className="text-xs text-gray-500">Descrição que aparece nos resultados de busca (150-160 caracteres)</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="siteKeywords">Palavras-chave</Label>
                <Input
                  id="siteKeywords"
                  value={formData.siteKeywords || ''}
                  onChange={(e) => handleInputChange('siteKeywords', e.target.value)}
                  placeholder="pdf, documentos, download, grátis, biblioteca"
                />
                <p className="text-xs text-gray-500">Palavras-chave separadas por vírgula</p>
              </div>

              <div className="space-y-2">
                <Label htmlFor="pdfTitleFormat">Formato do Título de PDFs</Label>
                <Input
                  id="pdfTitleFormat"
                  value={formData.pdfTitleFormat || ''}
                  onChange={(e) => handleInputChange('pdfTitleFormat', e.target.value)}
                  placeholder="${title} - PDFxandria"
                />
                <p className="text-xs text-gray-500">Use $&#123;title&#125; para inserir o nome do PDF</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Redes Sociais */}
        <TabsContent value="social" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Share2 className="w-5 h-5" />
                Open Graph & Twitter Cards
              </CardTitle>
              <CardDescription>
                Configure como seu site aparece quando compartilhado nas redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="ogImage">Imagem Open Graph</Label>
                  <Input
                    id="ogImage"
                    value={formData.ogImage || ''}
                    onChange={(e) => handleInputChange('ogImage', e.target.value)}
                    placeholder="/generated-icon.png"
                  />
                  <p className="text-xs text-gray-500">Imagem padrão para compartilhamento (1200x630px recomendado)</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="twitterHandle">Handle do Twitter</Label>
                  <Input
                    id="twitterHandle"
                    value={formData.twitterHandle || ''}
                    onChange={(e) => handleInputChange('twitterHandle', e.target.value)}
                    placeholder="@pdfxandria"
                  />
                  <p className="text-xs text-gray-500">Conta do Twitter para atribuição</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações de Motores de Busca */}
        <TabsContent value="search" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Search className="w-5 h-5" />
                Verificação de Motores de Busca
              </CardTitle>
              <CardDescription>
                Configure a verificação de propriedade e análise de sites
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="googleVerification">Google Search Console</Label>
                  <Input
                    id="googleVerification"
                    value={formData.googleVerification || ''}
                    onChange={(e) => handleInputChange('googleVerification', e.target.value)}
                    placeholder="google-site-verification=..."
                  />
                  <p className="text-xs text-gray-500">Código de verificação do Google</p>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="bingVerification">Bing Webmaster Tools</Label>
                  <Input
                    id="bingVerification"
                    value={formData.bingVerification || ''}
                    onChange={(e) => handleInputChange('bingVerification', e.target.value)}
                    placeholder="msvalidate.01=..."
                  />
                  <p className="text-xs text-gray-500">Código de verificação do Bing</p>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="gaTrackingId">Google Analytics ID</Label>
                <Input
                  id="gaTrackingId"
                  value={formData.gaTrackingId || ''}
                  onChange={(e) => handleInputChange('gaTrackingId', e.target.value)}
                  placeholder="G-XXXXXXXXXX ou UA-XXXXXXXX-X"
                />
                <p className="text-xs text-gray-500">ID de acompanhamento do Google Analytics</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Configurações Avançadas */}
        <TabsContent value="advanced" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Code className="w-5 h-5" />
                Configurações Técnicas
              </CardTitle>
              <CardDescription>
                Robots.txt e outras configurações técnicas de SEO
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="robotsTxt">Robots.txt</Label>
                <Textarea
                  id="robotsTxt"
                  value={formData.robotsTxt || ''}
                  onChange={(e) => handleInputChange('robotsTxt', e.target.value)}
                  placeholder="User-agent: *&#10;Disallow: /admin&#10;Sitemap: /sitemap.xml"
                  rows={8}
                  className="font-mono text-sm"
                />
                <p className="text-xs text-gray-500">
                  Configure quais páginas os bots podem acessar. Disponível em /robots.txt
                </p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Preview */}
        <TabsContent value="preview" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye className="w-5 h-5" />
                Preview de SEO
              </CardTitle>
              <CardDescription>
                Veja como seu site aparecerá nos resultados de busca e redes sociais
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              {/* Preview Google */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Resultado no Google</h3>
                <div className="border border-gray-300 rounded-lg p-4 bg-white text-black">
                  <div className="text-blue-600 text-lg font-medium hover:underline cursor-pointer">
                    {getPreviewTitle()}
                  </div>
                  <div className="text-green-600 text-sm">
                    {formData.siteUrl || 'https://pdfxandria.com'}/pdf/exemplo-de-pdf
                  </div>
                  <div className="text-gray-600 text-sm mt-1">
                    {formData.siteDescription || 'Explore e baixe documentos PDF gratuitamente'}
                  </div>
                </div>
              </div>

              {/* Preview Facebook */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Compartilhamento no Facebook</h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white text-black max-w-md">
                  <div className="bg-gray-200 h-32 flex items-center justify-center">
                    <img 
                      src={formData.ogImage || '/generated-icon.png'} 
                      alt="Preview"
                      className="max-h-full max-w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="text-gray-500 text-xs uppercase">
                      {formData.siteUrl?.replace(/https?:\/\//, '') || 'pdfxandria.com'}
                    </div>
                    <div className="font-semibold text-sm mt-1">
                      {getPreviewTitle()}
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      {formData.siteDescription || 'Explore e baixe documentos PDF gratuitamente'}
                    </div>
                  </div>
                </div>
              </div>

              {/* Preview Twitter */}
              <div className="space-y-2">
                <h3 className="font-semibold text-lg">Twitter Card</h3>
                <div className="border border-gray-300 rounded-lg overflow-hidden bg-white text-black max-w-md">
                  <div className="bg-gray-200 h-32 flex items-center justify-center">
                    <img 
                      src={formData.ogImage || '/generated-icon.png'} 
                      alt="Preview"
                      className="max-h-full max-w-full object-cover"
                    />
                  </div>
                  <div className="p-3">
                    <div className="font-semibold text-sm">
                      {getPreviewTitle()}
                    </div>
                    <div className="text-gray-600 text-xs mt-1">
                      {formData.siteDescription || 'Explore e baixe documentos PDF gratuitamente'}
                    </div>
                    <div className="text-gray-500 text-xs mt-2">
                      {formData.siteUrl?.replace(/https?:\/\//, '') || 'pdfxandria.com'}
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Botão de Salvar */}
      <div className="flex justify-between items-center bg-dark-surface border border-dark-border rounded-lg p-4">
        <div className="text-sm text-gray-400">
          Última atualização: {seoSettings?.updatedAt ? new Date(seoSettings.updatedAt).toLocaleString('pt-BR') : 'Nunca'}
        </div>
        <Button 
          onClick={handleSave}
          disabled={updateSeoMutation.isPending}
          className="bg-primary hover:bg-primary-dark"
        >
          <Save className="w-4 h-4 mr-2" />
          {updateSeoMutation.isPending ? 'Salvando...' : 'Salvar Configurações'}
        </Button>
      </div>
    </div>
  );
}