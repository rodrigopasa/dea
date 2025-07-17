import React, { useState } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Switch } from '@/components/ui/switch';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { apiRequest } from '@/lib/queryClient';
import { AdConfig, AdPosition } from '../ads/types';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { useToast } from '@/hooks/use-toast';

const adPositionLabels: Record<AdPosition, string> = {
  home_top: 'Topo da página inicial',
  home_middle: 'Meio da página inicial',
  home_bottom: 'Rodapé da página inicial',
  sidebar_top: 'Topo da barra lateral',
  sidebar_bottom: 'Rodapé da barra lateral',
  pdf_details_before_content: 'Antes do conteúdo PDF',
  pdf_details_after_content: 'Após o conteúdo PDF',
  category_top: 'Topo da página de categoria',
  search_results_inline: 'Entre resultados de pesquisa'
};

export default function AdSettingsPanel() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  
  const { data: settings, isLoading, error } = useQuery<AdConfig>({
    queryKey: ['/api/ads/settings'],
    refetchOnWindowFocus: false,
  });
  
  const [formData, setFormData] = useState<AdConfig | null>(null);
  const [activeTab, setActiveTab] = useState('general');
  const [currentPosition, setCurrentPosition] = useState<AdPosition>('home_top');
  
  // Configurar o estado do formulário quando os dados são carregados
  React.useEffect(() => {
    if (settings && !formData) {
      setFormData({ ...settings });
    }
  }, [settings, formData]);
  
  const updateSettingsMutation = useMutation({
    mutationFn: async (data: Partial<AdConfig>) => {
      return apiRequest('/api/ads/settings', {
        method: 'PATCH',
        body: JSON.stringify(data),
      });
    },
    onSuccess: () => {
      toast({
        title: 'Configurações salvas',
        description: 'As configurações de anúncios foram atualizadas com sucesso.',
        variant: 'default',
      });
      queryClient.invalidateQueries({ queryKey: ['/api/ads/settings'] });
    },
    onError: (error) => {
      toast({
        title: 'Erro ao salvar',
        description: 'Ocorreu um erro ao salvar as configurações de anúncios.',
        variant: 'destructive',
      });
      console.error('Erro ao salvar configurações de anúncios:', error);
    },
  });
  
  const handleSave = () => {
    if (!formData) return;
    updateSettingsMutation.mutate(formData);
  };
  
  const handlePositionChange = (position: AdPosition, key: string, value: any) => {
    if (!formData) return;
    
    setFormData({
      ...formData,
      positions: {
        ...formData.positions,
        [position]: {
          ...formData.positions[position],
          [key]: value
        }
      }
    });
  };
  
  if (isLoading) return <div>Carregando configurações de anúncios...</div>;
  if (error) return <div>Erro ao carregar configurações de anúncios</div>;
  if (!formData) return null;
  
  return (
    <Card>
      <CardHeader>
        <CardTitle>Configurações de Anúncios</CardTitle>
        <CardDescription>
          Configure como os anúncios são exibidos no site.
        </CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList className="mb-4">
            <TabsTrigger value="general">Geral</TabsTrigger>
            <TabsTrigger value="positions">Posições</TabsTrigger>
          </TabsList>
          
          <TabsContent value="general">
            <div className="space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Ativar anúncios</h3>
                  <p className="text-sm text-muted-foreground">
                    Controla a exibição de anúncios em todo o site
                  </p>
                </div>
                <Switch
                  checked={formData.enabled}
                  onCheckedChange={(checked) => 
                    setFormData({ ...formData, enabled: checked })}
                />
              </div>
              
              <div className="space-y-2">
                <label className="text-sm font-medium">Provedor de anúncios</label>
                <Select 
                  value={formData.provider} 
                  onValueChange={(value) => setFormData({ 
                    ...formData, 
                    provider: value as 'adsense' | 'custom' 
                  })}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar provedor" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="adsense">Google AdSense</SelectItem>
                    <SelectItem value="custom">Scripts personalizados</SelectItem>
                  </SelectContent>
                </Select>
                <p className="text-xs text-muted-foreground">
                  Escolha entre Google AdSense ou scripts de anúncios personalizados
                </p>
              </div>
              
              {formData.provider === 'adsense' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID de cliente do AdSense</label>
                  <Input
                    value={formData.adClient || ''}
                    onChange={(e) => setFormData({ 
                      ...formData, 
                      adClient: e.target.value 
                    })}
                    placeholder="Ex: ca-pub-1234567890123456"
                  />
                  <p className="text-xs text-muted-foreground">
                    Formato: ca-pub-XXXXXXXXXXXXXXXX
                  </p>
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="positions">
            <div className="space-y-4">
              <div className="space-y-2">
                <label className="text-sm font-medium">Selecionar posição</label>
                <Select 
                  value={currentPosition} 
                  onValueChange={(value) => setCurrentPosition(value as AdPosition)}
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar posição" />
                  </SelectTrigger>
                  <SelectContent>
                    {Object.entries(adPositionLabels).map(([pos, label]) => (
                      <SelectItem key={pos} value={pos}>{label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
              
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-lg font-medium">Ativar esta posição</h3>
                  <p className="text-sm text-muted-foreground">
                    {adPositionLabels[currentPosition]}
                  </p>
                </div>
                <Switch
                  checked={formData.positions[currentPosition]?.enabled || false}
                  onCheckedChange={(checked) => 
                    handlePositionChange(currentPosition, 'enabled', checked)}
                />
              </div>
              
              {formData.provider === 'adsense' && (
                <div className="space-y-2">
                  <label className="text-sm font-medium">ID de slot do anúncio</label>
                  <Input
                    value={formData.positions[currentPosition]?.adSlot || ''}
                    onChange={(e) => handlePositionChange(
                      currentPosition, 
                      'adSlot', 
                      e.target.value
                    )}
                    placeholder="Ex: 1234567890"
                  />
                  <p className="text-xs text-muted-foreground">
                    O ID do slot de anúncio fornecido pelo Google AdSense
                  </p>
                </div>
              )}
              
              {formData.provider === 'custom' && (
                <>
                  <div className="space-y-2">
                    <label className="text-sm font-medium">Script personalizado</label>
                    <Textarea
                      value={formData.positions[currentPosition]?.customScript || ''}
                      onChange={(e) => handlePositionChange(
                        currentPosition, 
                        'customScript', 
                        e.target.value
                      )}
                      placeholder="Cole seu código JavaScript aqui"
                      rows={5}
                    />
                    <p className="text-xs text-muted-foreground">
                      Cole diretamente o JavaScript para o anúncio personalizado
                    </p>
                  </div>
                  
                  <div className="space-y-2">
                    <label className="text-sm font-medium">URL do script</label>
                    <Input
                      value={formData.positions[currentPosition]?.customScriptUrl || ''}
                      onChange={(e) => handlePositionChange(
                        currentPosition, 
                        'customScriptUrl', 
                        e.target.value
                      )}
                      placeholder="https://exemplo.com/script.js"
                    />
                    <p className="text-xs text-muted-foreground">
                      Opcional: URL para um script externo
                    </p>
                  </div>
                </>
              )}
            </div>
          </TabsContent>
        </Tabs>
      </CardContent>
      <CardFooter className="flex justify-between">
        <Button variant="outline" onClick={() => setFormData(settings || null)}>
          Cancelar
        </Button>
        <Button 
          onClick={handleSave} 
          disabled={updateSettingsMutation.isPending}
        >
          {updateSettingsMutation.isPending ? 'Salvando...' : 'Salvar alterações'}
        </Button>
      </CardFooter>
    </Card>
  );
}