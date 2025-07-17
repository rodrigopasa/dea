import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
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
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Textarea } from "@/components/ui/textarea";
import { Loader2, Upload, Download, ArrowRight } from "lucide-react";
import { Link } from "wouter";

// Interface para as props do UserProfileForm
interface UserProfileFormProps {
  downloadLimitInfo?: {
    downloadLimit: {
      dailyLimit: number;
      usedToday: number;
      reachedLimit: boolean;
    };
    hasPaidPlan: boolean;
    plan: any | null;
  } | null;
}

// Schema de validação para edição de informações pessoais
const profileInfoSchema = z.object({
  username: z.string().min(3, "Nome de usuário deve ter pelo menos 3 caracteres").optional(),
  email: z.string().email("Email inválido").optional().or(z.literal("")),
  bio: z.string().max(500, "A biografia deve ter no máximo 500 caracteres").optional(),
  name: z.string().optional().or(z.literal("")),
});

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

type ProfileInfoValues = z.infer<typeof profileInfoSchema>;
type PasswordChangeValues = z.infer<typeof passwordChangeSchema>;

export default function UserProfileForm({ downloadLimitInfo }: UserProfileFormProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const queryClient = useQueryClient();
  const [isSubmittingInfo, setIsSubmittingInfo] = useState(false);
  const [isSubmittingPassword, setIsSubmittingPassword] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);

  // Configurar formulário para informações pessoais
  const infoForm = useForm<ProfileInfoValues>({
    resolver: zodResolver(profileInfoSchema),
    defaultValues: {
      username: user?.username || "",
      email: user?.email || "",
      bio: "",
      name: user?.name || "",
    },
  });

  // Configurar formulário para alteração de senha
  const passwordForm = useForm<PasswordChangeValues>({
    resolver: zodResolver(passwordChangeSchema),
    defaultValues: {
      currentPassword: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  // Atualiza o formulário quando o usuário mudar
  useEffect(() => {
    if (user) {
      infoForm.reset({
        username: user.username || "",
        email: user.email || "",
        bio: "",
        name: user.name || "",
      });
    }
  }, [user, infoForm]);

  // Mutation para atualizar informações do perfil
  const updateProfileInfoMutation = useMutation({
    mutationFn: async (data: ProfileInfoValues) => {
      // Remove campos vazios ou undefined antes de enviar
      const formData = Object.fromEntries(
        Object.entries(data).filter(([_, v]) => v !== "" && v !== undefined)
      );
      
      return await apiRequest("PATCH", "/api/users/me", formData);
    },
    onSuccess: () => {
      // Invalidar queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      // Mostrar mensagem de sucesso
      toast({
        title: "Perfil atualizado",
        description: "Suas informações de perfil foram atualizadas com sucesso.",
      });
      
      setIsSubmittingInfo(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar perfil:", error);
      
      toast({
        title: "Erro ao atualizar",
        description: "Não foi possível atualizar suas informações de perfil.",
        variant: "destructive",
      });
      
      setIsSubmittingInfo(false);
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
      passwordForm.reset({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
      });
      
      setIsSubmittingPassword(false);
    },
    onError: (error) => {
      console.error("Erro ao atualizar senha:", error);
      
      toast({
        title: "Erro ao atualizar senha",
        description: "Não foi possível alterar sua senha. Verifique se a senha atual está correta.",
        variant: "destructive",
      });
      
      setIsSubmittingPassword(false);
    },
  });

  // Upload de avatar usando a API
  const [isUploadingAvatar, setIsUploadingAvatar] = useState(false);
  
  const uploadAvatarMutation = useMutation({
    mutationFn: async (file: File) => {
      const formData = new FormData();
      formData.append('avatar', file);
      
      return await fetch('/api/users/me/avatar', {
        method: 'POST',
        body: formData,
        credentials: 'include',
      }).then(res => {
        if (!res.ok) throw new Error('Erro ao fazer upload de avatar');
        return res.json();
      });
    },
    onSuccess: (data) => {
      // Invalidar queries relacionadas para atualizar a UI
      queryClient.invalidateQueries({ queryKey: ["/api/user"] });
      
      toast({
        title: "Avatar atualizado",
        description: "Seu avatar foi atualizado com sucesso.",
      });
      
      setIsUploadingAvatar(false);
    },
    onError: (error) => {
      console.error("Erro ao fazer upload de avatar:", error);
      
      toast({
        title: "Erro no upload",
        description: "Não foi possível atualizar seu avatar.",
        variant: "destructive",
      });
      
      setIsUploadingAvatar(false);
    },
  });
  
  const handleAvatarChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      // Criar preview
      const reader = new FileReader();
      reader.onload = (e) => {
        setAvatarPreview(e.target?.result as string);
      };
      reader.readAsDataURL(file);
      
      // Fazer upload
      setIsUploadingAvatar(true);
      uploadAvatarMutation.mutate(file);
    }
  };

  // Processar o envio do formulário de informações
  const onSubmitInfo = (data: ProfileInfoValues) => {
    setIsSubmittingInfo(true);
    updateProfileInfoMutation.mutate(data);
  };

  // Processar o envio do formulário de senha
  const onSubmitPassword = (data: PasswordChangeValues) => {
    setIsSubmittingPassword(true);
    updatePasswordMutation.mutate(data);
  };

  // Gerar iniciais para o avatar
  const getInitials = (name: string) => {
    return name ? name.charAt(0).toUpperCase() : "U";
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col items-center sm:flex-row sm:items-start gap-4">
        <div className="relative">
          <Avatar className="w-24 h-24 border-2 border-primary">
            <AvatarImage src={avatarPreview || (user?.avatar ? user.avatar : "")} alt={user?.username || "User"} />
            <AvatarFallback className="text-xl bg-primary text-white">
              {getInitials(user?.username || "")}
            </AvatarFallback>
          </Avatar>
          <label htmlFor="avatar-upload" className="absolute -bottom-2 -right-2 bg-primary text-white p-1.5 rounded-full cursor-pointer hover:bg-primary-dark">
            {isUploadingAvatar ? (
              <Loader2 size={14} className="animate-spin" />
            ) : (
              <Upload size={14} />
            )}
            <input 
              id="avatar-upload" 
              type="file" 
              accept="image/*" 
              className="hidden" 
              onChange={handleAvatarChange}
              disabled={isUploadingAvatar}
            />
          </label>
        </div>
        
        <div>
          <h2 className="text-xl font-bold">{user?.username}</h2>
          <p className="text-gray-400 text-sm">
            {user?.isAdmin ? "Administrador" : "Usuário"}
          </p>
          <p className="text-gray-400 text-sm mt-1">
            Membro desde {new Date().toLocaleDateString()}
          </p>
        </div>
      </div>
      
      {/* Formulário de informações pessoais */}
      <div>
        <h3 className="text-lg font-medium mb-4">Informações Pessoais</h3>
        <Form {...infoForm}>
          <form onSubmit={infoForm.handleSubmit(onSubmitInfo)} className="space-y-4">
            <FormField
              control={infoForm.control}
              name="username"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome de usuário</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome de usuário"
                      {...field}
                      className="bg-dark-surface-2 border-dark-border"
                      disabled={true}
                      title="O nome de usuário não pode ser alterado"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={infoForm.control}
              name="name"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Nome completo</FormLabel>
                  <FormControl>
                    <Input
                      placeholder="Seu nome completo"
                      {...field}
                      className="bg-dark-surface-2 border-dark-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={infoForm.control}
              name="email"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input
                      type="email"
                      placeholder="seu@email.com"
                      {...field}
                      className="bg-dark-surface-2 border-dark-border"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <FormField
              control={infoForm.control}
              name="bio"
              render={({ field }) => (
                <FormItem>
                  <FormLabel>Biografia</FormLabel>
                  <FormControl>
                    <Textarea
                      placeholder="Conte um pouco sobre você..."
                      {...field}
                      className="bg-dark-surface-2 border-dark-border resize-none h-24"
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              )}
            />
            
            <div className="flex justify-end">
              <Button 
                type="submit" 
                className="bg-primary hover:bg-primary-dark text-white"
                disabled={isSubmittingInfo}
              >
                {isSubmittingInfo ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Salvando...
                  </>
                ) : (
                  "Salvar informações"
                )}
              </Button>
            </div>
          </form>
        </Form>
      </div>
    </div>
  );
}