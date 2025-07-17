import React, { useEffect } from "react";
import { zodResolver } from "@hookform/resolvers/zod";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { User } from "@shared/schema";
import { useToast } from "@/hooks/use-toast";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Form,
  FormControl,
  FormDescription,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";

const passwordSchema = z
  .string()
  .min(6, { message: "A senha deve ter pelo menos 6 caracteres" })
  .optional()
  .or(z.literal(''));

const formSchema = z.object({
  username: z.string().min(3, {
    message: "Nome de usuário deve ter pelo menos 3 caracteres",
  }),
  name: z.string().optional(),
  email: z.string().email({ message: "Email inválido" }).optional(),
  password: passwordSchema,
  confirmPassword: passwordSchema,
}).refine((data) => {
  if (data.password && data.confirmPassword && data.password !== data.confirmPassword) {
    return false;
  }
  return true;
}, {
  message: "As senhas não coincidem",
  path: ["confirmPassword"],
});

interface EditProfileDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  user: User;
  isAdmin?: boolean;
}

export function EditProfileDialog({
  open,
  onOpenChange,
  user,
  isAdmin = false,
}: EditProfileDialogProps) {
  const { toast } = useToast();
  const queryClient = useQueryClient();

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      username: user.username,
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
    },
  });

  // Atualiza o formulário quando o usuário muda
  useEffect(() => {
    form.reset({
      username: user.username,
      name: user.name || "",
      email: user.email || "",
      password: "",
      confirmPassword: "",
    });
  }, [user, form.reset]);

  const updateUserMutation = useMutation({
    mutationFn: async (data: z.infer<typeof formSchema>) => {
      // Remove a confirmação de senha para a API
      const { confirmPassword, ...updateData } = data;
      
      // Se a senha estiver vazia, não a envia
      if (!updateData.password) {
        delete updateData.password;
      }

      // Enviar os dados para a API
      return apiRequest("PATCH", `/api/users/${user.id}`, updateData);
    },
    onSuccess: (data) => {
      toast({
        title: "Perfil atualizado",
        description: "Seu perfil foi atualizado com sucesso.",
      });
      
      // Abordagem mais segura para atualização de cache
      
      // 1. Primeiro, invalidar todas as queries relacionadas ao usuário
      queryClient.invalidateQueries();
      
      // 2. Aguardar um pouco para garantir que o cache seja limpo e atualizado
      setTimeout(() => {
        // 3. Refetch explícito para garantir dados mais atuais
        queryClient.refetchQueries({ queryKey: ["/api/user"] });
        queryClient.refetchQueries({ queryKey: [`/api/users/${user.id}`] });
        queryClient.refetchQueries({ queryKey: ["/api/users/me"] });
        
        // 4. Forçar a atualização de dados de PDFs e categorias também
        queryClient.refetchQueries({ queryKey: ["/api/pdfs/popular"] });
        queryClient.refetchQueries({ queryKey: ["/api/pdfs/recent"] });
        queryClient.refetchQueries({ queryKey: ["/api/categories"] });
        
        // Fechar o diálogo
        onOpenChange(false);
      }, 300);  // Um pequeno delay para garantir que as operações anteriores tenham tempo
    },
    onError: (error: any) => {
      toast({
        title: "Erro ao atualizar perfil",
        description: error.message || "Não foi possível atualizar o perfil",
        variant: "destructive",
      });
    },
  });

  function onSubmit(data: z.infer<typeof formSchema>) {
    updateUserMutation.mutate(data);
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[500px] bg-dark-surface border-dark-border">
        <DialogHeader>
          <DialogTitle>Editar Perfil</DialogTitle>
          <DialogDescription>
            Atualize seus dados de perfil. Deixe a senha em branco para não alterá-la.
          </DialogDescription>
        </DialogHeader>

        <Form {...form}>
          <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-4">
            <FormField
              control={form.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de Usuário</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-dark-surface-2 border-dark-border"
                      disabled={true} // Ninguém pode alterar username
                      title="O nome de usuário não pode ser alterado"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome Completo</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-dark-surface-2 border-dark-border"
                      placeholder="Seu nome completo"
                    />
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
                    <Input 
                      {...field} 
                      className="bg-dark-surface-2 border-dark-border"
                      placeholder="seu.email@exemplo.com"
                      type="email"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="password"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nova Senha</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-dark-surface-2 border-dark-border"
                      placeholder="Deixe em branco para não alterar"
                      type="password"
                    />
                  </FormControl>
                  <FormDescription>
                    Mínimo de 6 caracteres
                  </FormDescription>
                  <FormMessage />
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="confirmPassword"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Confirmar Nova Senha</FormLabel>
                  <FormControl>
                    <Input 
                      {...field} 
                      className="bg-dark-surface-2 border-dark-border"
                      placeholder="Confirme sua nova senha"
                      type="password"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />

            <DialogFooter className="pt-4">
              <Button 
                variant="outline" 
                onClick={() => onOpenChange(false)}
                className="border-dark-border"
                type="button"
              >
                Cancelar
              </Button>
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark"
                disabled={updateUserMutation.isPending}
              >
                {updateUserMutation.isPending ? "Salvando..." : "Salvar Alterações"}
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}