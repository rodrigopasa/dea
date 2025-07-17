import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
  FormDescription,
} from "@/components/ui/form";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  fullName: z.string().min(2, {
    message: "Nome completo deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Por favor insira um email válido",
  }),
  address: z.string().min(5, {
    message: "Por favor insira um endereço válido",
  }),
  phoneNumber: z.string().min(8, {
    message: "Por favor insira um número de telefone válido",
  }),
  contentUrl: z.string().url({
    message: "Por favor insira uma URL válida do conteúdo infrator",
  }),
  originalContentUrl: z.string().url({
    message: "Por favor insira uma URL válida do conteúdo original",
  }).or(z.string().length(0)),
  description: z.string().min(20, {
    message: "A descrição deve ter pelo menos 20 caracteres",
  }),
  ownershipConfirmation: z.boolean().refine(val => val === true, {
    message: "Você deve confirmar que é o proprietário dos direitos autorais",
  }),
  goodFaithConfirmation: z.boolean().refine(val => val === true, {
    message: "Você deve confirmar que acredita de boa-fé que o uso não é autorizado",
  }),
  accuracyConfirmation: z.boolean().refine(val => val === true, {
    message: "Você deve confirmar a precisão das informações fornecidas",
  }),
});

export default function DmcaPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      fullName: "",
      email: "",
      address: "",
      phoneNumber: "",
      contentUrl: "",
      originalContentUrl: "",
      description: "",
      ownershipConfirmation: false,
      goodFaithConfirmation: false,
      accuracyConfirmation: false,
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Extraindo ID do PDF da URL
      const urlRegex = /\/pdf\/(\d+)(?:\/|$)|\/pdfs\/(\d+)(?:\/|$)/;
      const match = values.contentUrl.match(urlRegex);
      
      // Tentar extrair o ID do formato esperado, caso contrário utilizar última parte da URL
      let pdfId = 0;
      if (match) {
        // Se corresponder ao formato esperado, capturar o ID do grupo de captura
        pdfId = parseInt(match[1] || match[2]);
      } else {
        // Fallback para o comportamento anterior
        const urlParts = values.contentUrl.split('/');
        pdfId = parseInt(urlParts[urlParts.length - 1]) || 0;
      }
      
      console.log("URL do conteúdo:", values.contentUrl);
      console.log("ID do PDF extraído:", pdfId);
      
      // Validar se o ID do PDF é válido
      if (pdfId <= 0) {
        throw new Error("Não foi possível identificar o ID do PDF a partir da URL fornecida. Por favor, utilize o formato correto: https://pdfxandria.com/pdf/123");
      }
      
      // Enviando requisição para a API
      const response = await fetch('/api/dmca', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          pdfId: pdfId,
          requestorName: values.fullName,
          requestorEmail: values.email,
          reason: values.description
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.message || 'Ocorreu um erro ao enviar a notificação DMCA');
      }

      toast({
        title: "Notificação DMCA enviada",
        description: "Sua notificação DMCA foi enviada com sucesso. Nossa equipe irá analisar e responder dentro de 1-2 dias úteis.",
      });
      
      form.reset();
    } catch (error) {
      console.error('Erro ao enviar notificação DMCA:', error);
      
      toast({
        title: "Erro ao enviar notificação",
        description: error instanceof Error ? error.message : "Ocorreu um erro ao enviar sua notificação DMCA. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Notificação DMCA</h1>
        
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">O que é DMCA?</h2>
          <p className="text-gray-400 mb-6">
            A Digital Millennium Copyright Act (DMCA) é uma lei de direitos autorais dos Estados Unidos que 
            estabelece um processo para que os proprietários de conteúdo solicitem a remoção de material que 
            infringe seus direitos autorais. Embora seja uma lei americana, seguimos seus princípios para proteger 
            os direitos autorais e propriedade intelectual em nossa plataforma.
          </p>
          
          <h2 className="text-xl font-semibold mb-4">Formulário de Notificação DMCA</h2>
          <p className="text-gray-400 mb-6">
            Se você acredita que algum conteúdo em nossa plataforma viola seus direitos autorais, preencha este 
            formulário para enviar uma notificação DMCA. Informações falsas podem resultar em responsabilidade legal.
          </p>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
              <div className="space-y-4 rounded-md border border-gray-700 p-4 mb-2">
                <h3 className="font-medium text-lg">Informações do Proprietário</h3>
                
                <FormField
                  control={form.control}
                  name="fullName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome Completo</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo ou nome da empresa" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input placeholder="seu.email@exemplo.com" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="address"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Endereço</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu endereço completo" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="phoneNumber"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Telefone</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu número de telefone com DDD" {...field} />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 rounded-md border border-gray-700 p-4 mb-2">
                <h3 className="font-medium text-lg">Informações do Conteúdo</h3>
                
                <FormField
                  control={form.control}
                  name="contentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Conteúdo Infrator</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://pdfxandria.com/pdf/nome-do-documento" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        URL completa da página que contém o PDF que você alega estar infringindo seus direitos autorais. 
                        Deve estar no formato: https://pdfxandria.com/pdf/123 onde 123 é o ID do PDF.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="originalContentUrl"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>URL do Conteúdo Original (opcional)</FormLabel>
                      <FormControl>
                        <Input 
                          placeholder="https://seu-site.com/seu-conteudo" 
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Se disponível, forneça um link para o conteúdo original
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Descrição da Violação</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Descreva detalhadamente como o conteúdo viola seus direitos autorais..." 
                          className="min-h-[150px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormDescription>
                        Forneça detalhes específicos sobre o conteúdo protegido por direitos autorais e como ele está sendo infringido
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="space-y-4 rounded-md border border-gray-700 p-4 mb-2">
                <h3 className="font-medium text-lg">Declarações Legais</h3>
                
                <FormField
                  control={form.control}
                  name="ownershipConfirmation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Eu declaro que sou o proprietário ou um agente autorizado do proprietário dos direitos 
                          autorais do conteúdo em questão.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="goodFaithConfirmation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Eu acredito de boa-fé que o uso do material da maneira reclamada não é autorizado pelo 
                          proprietário dos direitos autorais, seu agente ou pela lei.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="accuracyConfirmation"
                  render={({ field }) => (
                    <FormItem className="flex flex-row items-start space-x-3 space-y-0">
                      <FormControl>
                        <Checkbox
                          checked={field.value}
                          onCheckedChange={field.onChange}
                        />
                      </FormControl>
                      <div className="space-y-1 leading-none">
                        <FormLabel>
                          Eu declaro, sob pena de perjúrio, que as informações nesta notificação são precisas e que 
                          sou o proprietário dos direitos autorais ou estou autorizado a agir em nome do proprietário.
                        </FormLabel>
                        <FormMessage />
                      </div>
                    </FormItem>
                  )}
                />
              </div>
              
              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Enviando..." : "Enviar Notificação DMCA"}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-8 pt-6 border-t border-dark-border">
            <h3 className="text-lg font-medium mb-2">O que acontece após o envio</h3>
            <p className="text-gray-400 mb-2">
              Após receber sua notificação DMCA, revisaremos as informações fornecidas e tomaremos as medidas apropriadas, 
              que podem incluir a remoção ou desativação do acesso ao conteúdo em questão. Nossa equipe entrará em contato 
              com você se precisarmos de informações adicionais.
            </p>
            <p className="text-gray-400">
              Para mais informações sobre nossos procedimentos de direitos autorais, consulte nossa 
              página de <a href="/copyright" className="text-primary hover:underline">Direitos Autorais</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
