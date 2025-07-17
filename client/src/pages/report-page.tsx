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
  FormDescription,
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
  reportType: z.string().min(1, {
    message: "Por favor selecione um tipo de denúncia",
  }),
  pdfUrl: z.string().url({
    message: "Por favor insira uma URL válida do PDF",
  }),
  description: z.string().min(10, {
    message: "A descrição deve ter pelo menos 10 caracteres",
  }),
});

export default function ReportPage() {
  const { toast } = useToast();
  const [isSubmitting, setIsSubmitting] = useState(false);

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      email: "",
      reportType: "",
      pdfUrl: "",
      description: "",
    },
  });

  function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true);
    
    // Simulando envio de formulário
    setTimeout(() => {
      console.log(values);
      setIsSubmitting(false);
      
      toast({
        title: "Denúncia enviada",
        description: "Sua denúncia foi enviada com sucesso. Nossa equipe irá analisar e tomar as medidas necessárias.",
      });
      
      form.reset();
    }, 1000);
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold mb-6">Reportar Problema</h1>
        
        <div className="bg-dark-surface border border-dark-border rounded-lg p-6 mb-8">
          <h2 className="text-xl font-semibold mb-4">Formulário de Denúncia</h2>
          <p className="text-gray-400 mb-6">
            Use este formulário para reportar conteúdo inadequado, violação de direitos autorais ou outros problemas 
            encontrados no site. Nossa equipe irá analisar sua denúncia e tomar as medidas necessárias.
          </p>
          
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
                name="reportType"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Tipo de Denúncia</FormLabel>
                    <Select onValueChange={field.onChange} defaultValue={field.value}>
                      <FormControl>
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione o tipo de denúncia" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent>
                        <SelectItem value="copyright">Violação de Direitos Autorais</SelectItem>
                        <SelectItem value="inappropriate">Conteúdo Inadequado</SelectItem>
                        <SelectItem value="illegal">Conteúdo Ilegal</SelectItem>
                        <SelectItem value="spam">Spam ou Publicidade</SelectItem>
                        <SelectItem value="other">Outro</SelectItem>
                      </SelectContent>
                    </Select>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="pdfUrl"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>URL do PDF</FormLabel>
                    <FormControl>
                      <Input 
                        placeholder="https://pdfxandria.com/pdf/nome-do-documento" 
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      URL completa da página do PDF que você está denunciando
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
                    <FormLabel>Descrição do Problema</FormLabel>
                    <FormControl>
                      <Textarea 
                        placeholder="Descreva detalhadamente o problema encontrado..." 
                        className="min-h-[150px]"
                        {...field} 
                      />
                    </FormControl>
                    <FormDescription>
                      Forneça o máximo de detalhes possível para ajudar na análise da denúncia
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <div className="pt-2">
                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? "Enviando..." : "Enviar Denúncia"}
                </Button>
              </div>
            </form>
          </Form>
          
          <div className="mt-8 pt-6 border-t border-dark-border">
            <h3 className="text-lg font-medium mb-2">Política de Denúncias</h3>
            <p className="text-gray-400 mb-2">
              Todas as denúncias são tratadas com confidencialidade. Denúncias relacionadas a violação de direitos 
              autorais devem preferencialmente ser feitas através da nossa página específica de <a href="/dmca" className="text-primary hover:underline">DMCA</a>.
            </p>
            <p className="text-gray-400">
              A equipe do PDFXANDRIA reserva-se o direito de remover qualquer conteúdo que viole nossos 
              <a href="/terms" className="text-primary hover:underline"> Termos de Serviço</a>.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}