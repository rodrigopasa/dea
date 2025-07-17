import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Loader2, KeyRound } from "lucide-react";

// Schema de validação para alteração de senha
const passwordChangeSchema = z.object({
  currentPassword: z.string().min(1, "A senha atual é obrigatória"),
  newPassword: z.string().min(6, "A nova senha deve ter pelo menos 6 caracteres"),
  confirmPassword: z.string().min(1, "Confirme sua nova senha"),
}).refine(data => {
  return data.newPassword === data.confirmPassword;
}, {
  message: "As senhas não correspondem",
  path: ["confirmPassword"],
});

type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export default function SecuritySettings() {
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Configurar formulário para alteração de senha
  const form = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Mutation para atualizar senha
  const updatePasswordMutation = useMutation({
    mutationFn: async (data: PasswordChangeValues) => {
      return await apiRequest("PATCH", "/api/users/me/password", {
        currentPassword: data.currentPassword,
        newPassword: data.newPassword,
      });
    },
    onSuccess: () => {
      // Mostrar mensagem de sucesso
      toast({
        title: "Senha atualizada",
        description: "Sua senha foi alterada com sucesso.",
      });
      
      // Limpar campos de senha
      form.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setIsSubmitting(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar senha:", error);
      
      toast({
        title: "Erro ao atualizar senha",
        description: "Não foi possível alterar sua senha. Verifique se a senha atual está correta.",
        variant: "destructive",
      });
      
      setIsSubmitting(false);
    },
  });

  // Processar o envio do formulário de senha
  const onSubmit = (data: PasswordChangeValues) => {
    setIsSubmitting(true);
    updatePasswordMutation.mutate(data);
  };

  return (
    <div className="space-y-6">
      <div>
        <h3 className="text-lg font-medium mb-4 flex items-center">
          <KeyRound className="mr-2 h-5 w-5" />
          Alterar Senha
        </h3>
        <p className="text-gray-400 mb-6">
          Para alterar sua senha, digite sua senha atual e depois a nova senha.
        </p>
        
        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="currentPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Senha atual</FormLabel>
                  <FormControl>
                    <Input
                      type="password"
                      placeholder="Digite sua senha atual"
                      {...field}
                      className="bg-dark-surface-2 border-dark-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <FormField
                control={form.control}
                name="newPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Nova senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Digite sua nova senha"
                        {...field}
                        className="bg-dark-surface-2 border-dark-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="confirmPassword"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Confirmar nova senha</FormLabel>
                    <FormControl>
                      <Input
                        type="password"
                        placeholder="Confirme sua nova senha"
                        {...field}
                        className="bg-dark-surface-2 border-dark-border"
                      />
                    </FormControl>
                    <FormMessage />
                  </FormItem>
                )}
              />
            </div>
            
            <div className="flex justify-end mt-4">
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white"
                disabled={isSubmitting}
              >
                {isSubmitting ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Alterando senha...
                  </>
                ) : (
                  "Alterar senha"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
      
      <div className="border-t border-dark-border pt-6 mt-6">
        <h3 className="text-lg font-medium mb-4">Verificação em duas etapas</h3>
        <div className="rounded-lg border border-dark-border p-6">
          <p className="text-gray-400 mb-4">
            Adicione uma camada extra de segurança à sua conta com a verificação em duas etapas.
          </p>
          <p className="text-gray-300 italic">
            Esta funcionalidade será implementada em breve.
          </p>
        </div>
      </div>
    </div>
  );
}