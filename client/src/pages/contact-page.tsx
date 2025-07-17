import { useState } from "react";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useToast } from "@/hooks/use-toast";

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Nome deve ter pelo menos 2 caracteres",
  }),
  email: z.string().email({
    message: "Por favor insira um email válido",
  }),
  subject: z.string().min(1, {
    message: "Por favor selecione um assunto",
  }),
  message: z.string().min(10, {
    message: "A mensagem deve ter pelo menos 10 caracteres",
  }),
});

export default function ContactPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      subject: "",
      message: "",
    },
  });

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    try {
      // Aqui poderíamos enviar os dados para uma API real
      // Por enquanto, simulamos o envio mas com tratamento de erro adequado
      const response = await new Promise<void>((resolve) => {
        setTimeout(() => {
          resolve();
        }, 1000);
      });
      
      console.log("Mensagem enviada:", values);
      
      toast({
        title: "Mensagem enviada",
        description: "Sua mensagem foi enviada com sucesso. Entraremos em contato em breve.",
      });
      
      // Redirecionando o usuário para DMCA se esse for o assunto selecionado
      if (values.subject === 'dmca') {
        // Redirecionando para a página DMCA após um breve delay
        setTimeout(() => {
          window.location.href = '/direitos-autorais';
        }, 1500);
        
        toast({
          title: "Redirecionando",
          description: "Você será redirecionado para o formulário específico de DMCA.",
        });
      } else {
        form.reset();
      }
    } catch (error) {
      console.error('Erro ao enviar mensagem:', error);
      
      toast({
        title: "Erro ao enviar mensagem",
        description: "Ocorreu um erro ao enviar sua mensagem. Por favor, tente novamente mais tarde.",
        variant: "destructive"
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-5xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Entre em Contato</h1>
        
        <div className="grid md:grid-cols-2 gap-8 mb-10">
          <div className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Informações de Contato</h2>
            
            <div className="space-y-4 mb-6">
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <div>
                  <p className="font-medium">Email</p>
                  <p className="text-gray-400">contato@pdfxandria.com.br</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" />
                </svg>
                <div>
                  <p className="font-medium">Telefone</p>
                  <p className="text-gray-400">(11) 9999-9999</p>
                </div>
              </div>
              
              <div className="flex items-start space-x-3">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 mt-0.5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                </svg>
                <div>
                  <p className="font-medium">Endereço</p>
                  <p className="text-gray-400">Av. Paulista, 1000</p>
                  <p className="text-gray-400">São Paulo, SP - Brasil</p>
                </div>
              </div>
            </div>
            
            <h3 className="text-lg font-medium mb-3">Horário de Atendimento</h3>
            <p className="text-gray-400 mb-6">Segunda a Sexta: 9h às 18h</p>
            
            <h3 className="text-lg font-medium mb-3">Redes Sociais</h3>
            <div className="flex space-x-4 mb-6">
              <a href="#" className="text-gray-400 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.252A10.002 10.002 0 0122 12c0 4.818-3.393 8.818-7.928 9.798v-6.93H17l.734-3.725h-3.662V9.052c0-1.093.537-2.159 2.256-2.159h1.747V3.767s-1.586-.27-3.102-.27c-3.164 0-5.231 1.917-5.231 5.385v2.264H6.75v3.725h2.992v6.93C5.393 20.818 2 16.818 2 12A10.002 10.002 0 0112 2.252z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M20.947 8.305a6.53 6.53 0 00-1.497-2.01A6.566 6.566 0 0016.5 4.5c-2.03 0-4.042.977-5.25 2.52A6.565 6.565 0 006 4.5a6.565 6.565 0 00-4.5 1.795 6.53 6.53 0 00-1.5 2.01C.157 9.887 0 11.47 0 12.5c0 .97.223 1.926.668 2.844.488.915 1.134 1.723 1.925 2.406.791.684 1.678 1.223 2.662 1.624.984.4 2.012.614 3.045.64.27.007.54.007.81.007.386 0 .773-.013 1.158-.038a10.57 10.57 0 01-1.164-4.985c0-2.746 1.057-5.318 2.98-7.256A10.573 10.573 0 0121 12.5c0 1.831-.451 3.556-1.249 5.063a10.378 10.378 0 003.305-2.63 10.41 10.41 0 001.892-3.922 10.562 10.562 0 00.387-2.785c0-.697-.07-1.382-.207-2.046a7.548 7.548 0 00-1.15-2.472 6.562 6.562 0 00-3.031-2.403z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M12 2.163c3.2 0 3.584.014 4.85.072 1.17.053 1.806.247 2.23.418.562.216.96.476 1.382.896.42.42.681.82.896 1.382.17.424.365 1.06.418 2.23.058 1.266.072 1.65.072 4.85s-.014 3.584-.072 4.85c-.053 1.17-.247 1.806-.418 2.23-.216.562-.476.96-.896 1.382-.42.42-.82.681-1.382.896-.424.17-1.06.365-2.23.418-1.266.058-1.65.072-4.85.072s-3.584-.014-4.85-.072c-1.17-.053-1.806-.247-2.23-.418-.562-.216-.96-.476-1.382-.896-.42-.42-.681-.82-.896-1.382-.17-.424-.365-1.06-.418-2.23-.058-1.266-.072-1.65-.072-4.85s.014-3.584.072-4.85c.053-1.17.247-1.806.418-2.23.216-.562.476-.96.896-1.382.42-.42.82-.681 1.382-.896.424-.17 1.06-.365 2.23-.418 1.266-.058 1.65-.072 4.85-.072zm0-2.163c-3.26 0-3.667.014-4.947.072-1.277.06-2.148.262-2.913.558-.788.306-1.459.716-2.126 1.384-.668.667-1.079 1.338-1.384 2.126-.296.765-.499 1.636-.558 2.913-.06 1.28-.073 1.687-.073 4.947s.014 3.667.072 4.947c.06 1.277.262 2.148.558 2.913.306.788.716 1.459 1.384 2.126.667.668 1.338 1.079 2.126 1.384.765.296 1.636.499 2.913.558 1.28.06 1.687.073 4.947.073s3.667-.014 4.947-.072c1.277-.06 2.148-.262 2.913-.558.788-.306 1.459-.716 2.126-1.384.668-.667 1.079-1.338 1.384-2.126.296-.765.499-1.636.558-2.913.06-1.28.073-1.687.073-4.947s-.014-3.667-.072-4.947c-.06-1.277-.262-2.148-.558-2.913-.306-.788-.716-1.459-1.384-2.126-.667-.668-1.338-1.079-2.126-1.384-.765-.296-1.636-.499-2.913-.558-1.28-.06-1.687-.073-4.947-.073z" />
                  <path d="M12 6.865a5.135 5.135 0 100 10.27 5.135 5.135 0 000-10.27zm0 8.468a3.333 3.333 0 110-6.666 3.333 3.333 0 010 6.666zm6.538-8.469a1.2 1.2 0 11-2.4 0 1.2 1.2 0 012.4 0z" />
                </svg>
              </a>
              <a href="#" className="text-gray-400 hover:text-primary">
                <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="currentColor" viewBox="0 0 24 24">
                  <path d="M22.675 0H1.325C.593 0 0 .593 0 1.325v21.351C0 23.407.593 24 1.325 24H12.82v-9.294H9.692v-3.622h3.128v-2.67c0-3.1 1.9-4.788 4.659-4.788 1.325 0 2.463.098 2.795.143v3.24l-1.918.001c-1.504 0-1.795.715-1.795 1.763v2.313h3.587l-.467 3.622h-3.12V24h6.116c.73 0 1.323-.593 1.323-1.325V1.325C24 .593 23.407 0 22.675 0z" />
                </svg>
              </a>
            </div>
            
            {/* Mapa Estilizado */}
            <div className="mt-4 border-t border-gray-700 pt-4">
              <h3 className="text-lg font-medium mb-3">Nossa Localização</h3>
              <div className="h-48 bg-gray-800 rounded-md border border-gray-700 flex items-center justify-center overflow-hidden relative">
                <div className="w-full h-full opacity-80 bg-gradient-to-r from-gray-800 to-gray-900 absolute">
                  {/* Representação estilizada de mapa */}
                  <div className="absolute inset-0 flex items-center justify-center">
                    <div className="w-3/4 h-3/4 relative">
                      {/* Linhas de grade do mapa */}
                      <div className="absolute inset-0 grid grid-cols-6 gap-4">
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={`v-${i}`} className="h-full w-px bg-gray-700/30" style={{ left: `${(i+1) * 16.66}%` }} />
                        ))}
                        {Array.from({ length: 6 }).map((_, i) => (
                          <div key={`h-${i}`} className="w-full h-px bg-gray-700/30" style={{ top: `${(i+1) * 16.66}%` }} />
                        ))}
                      </div>
                      
                      {/* Ruas simuladas */}
                      <div className="absolute left-1/2 top-0 bottom-0 w-3 -ml-1.5 bg-gray-600/40" />
                      <div className="absolute top-1/2 left-0 right-0 h-2 -mt-1 bg-gray-600/40" />
                      
                      {/* Marcador de localização */}
                      <div className="absolute left-1/2 top-1/2 transform -translate-x-1/2 -translate-y-1/2">
                        <div className="w-5 h-5 rounded-full bg-primary animate-pulse" />
                        <div className="w-12 h-12 rounded-full bg-primary/30 absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 animate-ping" style={{ animationDuration: '3s' }} />
                      </div>
                    </div>
                  </div>
                </div>
                <div className="absolute bottom-2 right-2 bg-dark-surface px-2 py-1 rounded text-xs text-gray-400 z-10">
                  Av. Paulista, São Paulo - SP
                </div>
              </div>
              <p className="text-xs text-gray-500 mt-2 text-center">Clique para abrir no Google Maps</p>
            </div>
          </div>
          
          <div id="formulario" className="bg-dark-surface border border-dark-border rounded-lg p-6">
            <h2 className="text-xl font-semibold mb-4">Envie uma Mensagem</h2>
            
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
                <FormField
                  control={form.control}
                  name="name"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Nome</FormLabel>
                      <FormControl>
                        <Input placeholder="Seu nome completo" {...field} />
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
                  name="subject"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Assunto</FormLabel>
                      <Select onValueChange={field.onChange} defaultValue={field.value}>
                        <FormControl>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione um assunto" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent>
                          <SelectItem value="suporte">Suporte Técnico</SelectItem>
                          <SelectItem value="feedback">Feedback</SelectItem>
                          <SelectItem value="parceria">Proposta de Parceria</SelectItem>
                          <SelectItem value="dmca">Reclamação DMCA</SelectItem>
                          <SelectItem value="outro">Outro</SelectItem>
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <FormField
                  control={form.control}
                  name="message"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Mensagem</FormLabel>
                      <FormControl>
                        <Textarea 
                          placeholder="Digite sua mensagem aqui..." 
                          className="min-h-[120px]"
                          {...field} 
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Enviando..." : "Enviar Mensagem"}
                </Button>
              </form>
            </Form>
          </div>
        </div>
        
        {/* Seção de FAQ */}
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mt-8">
          <h2 className="text-xl font-semibold mb-6">Perguntas Frequentes</h2>
          
          <div className="space-y-6">
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">Como posso fazer upload de um PDF?</h3>
              <p className="text-gray-400">
                Para fazer upload de um PDF, você precisa estar logado. Após fazer login, acesse seu painel e clique no botão "Enviar PDF". 
                Preencha as informações solicitadas, selecione a categoria apropriada e confirme o upload.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">Qual é o tamanho máximo de arquivo permitido?</h3>
              <p className="text-gray-400">
                Atualmente, aceitamos arquivos PDF com tamanho máximo de 50MB. Se você precisa compartilhar um arquivo maior, 
                considere dividi-lo em partes menores ou entre em contato conosco para verificar opções alternativas.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">Posso definir quem acessa meus PDFs?</h3>
              <p className="text-gray-400">
                Sim! Ao fazer o upload, você pode escolher entre tornar seu PDF público (visível para todos) ou privado (visível apenas para você). 
                Esta configuração pode ser alterada posteriormente no seu painel de usuário.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">Como denunciar um PDF que viola direitos autorais?</h3>
              <p className="text-gray-400">
                Se você encontrar um PDF que viole direitos autorais, utilize nosso formulário DMCA disponível na 
                página <a href="/direitos-autorais" className="text-primary hover:underline">Direitos Autorais</a>. 
                Todas as reclamações são analisadas e tratadas com prioridade por nossa equipe.
              </p>
            </div>
            
            <div>
              <h3 className="text-lg font-medium text-primary mb-2">É necessário criar uma conta para baixar PDFs?</h3>
              <p className="text-gray-400">
                Não, qualquer visitante pode visualizar e baixar documentos públicos. No entanto, criar uma conta permite 
                salvar favoritos, acompanhar seu histórico de visualizações e fazer upload de seus próprios documentos.
              </p>
            </div>
          </div>
          
          <div className="mt-6 pt-6 border-t border-gray-700">
            <p className="text-gray-400">
              Não encontrou a resposta que procurava? <a href="#formulario" className="text-primary hover:underline">Entre em contato</a> com nossa 
              equipe de suporte ou consulte nossa <a href="/ajuda" className="text-primary hover:underline">Central de Ajuda</a> para mais informações.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}