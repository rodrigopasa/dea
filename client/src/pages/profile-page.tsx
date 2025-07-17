import { useState, useEffect } from "react";
import { useAuth } from "@/hooks/use-auth";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { useRoute, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import UserProfileForm from "@/components/profile/user-profile-form";
import SecuritySettings from "@/components/profile/security-settings";
import Sidebar from "@/components/layout/sidebar";
import { UserCog, Key, Bell, Shield } from "lucide-react";
import type { User } from "@/../../shared/schema";

export default function ProfilePage() {
  const { user: currentUser } = useAuth();
  const [activeTab, setActiveTab] = useState("profile");
  const [match, params] = useRoute("/usuario/:username");
  const [, navigate] = useLocation();
  
  // Determinar se estamos vendo o perfil do usuário logado ou de outro usuário
  const isViewingSelf = !params?.username || (currentUser && params.username === currentUser.username);
  
  // Buscar dados do usuário pelo nome de usuário quando estamos vendo outro perfil
  const { data: profileUser, isLoading } = useQuery<User>({
    queryKey: [`/api/users/username/${params?.username}`],
    enabled: !!params?.username && !isViewingSelf,
  });
  
  // Interface para informações do limite de downloads
  interface DownloadLimitResponse {
    downloadLimit: {
      dailyLimit: number;
      usedToday: number;
      reachedLimit: boolean;
    };
    hasPaidPlan: boolean;
    plan: any | null;
  }
  
  // Buscar informações de limite de download do usuário (apenas para o próprio usuário)
  const { data: downloadLimitInfo } = useQuery<DownloadLimitResponse>({
    queryKey: ['/api/user/download-limit'],
    enabled: !!(isViewingSelf && currentUser), // Somente se o usuário estiver logado e vendo seu próprio perfil
  });
  
  // O usuário que será exibido será o atual ou o que foi buscado
  const user = isViewingSelf ? currentUser : profileUser;
  
  useEffect(() => {
    // Redirecionar para a página inicial se não houver usuário logado e estamos tentando ver nosso próprio perfil
    if (!currentUser && isViewingSelf) {
      navigate("/entrar");
    }
  }, [currentUser, isViewingSelf, navigate]);

  if (isLoading || (!user && !isViewingSelf)) {
    return <div className="p-8 text-center">Carregando perfil...</div>;
  }
  
  if (!user) {
    return <div className="p-8 text-center">Usuário não encontrado</div>;
  }

  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - hidden on mobile, only shown when viewing own profile */}
      {isViewingSelf && <Sidebar className="hidden md:block" />}
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto max-w-4xl">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">
              {isViewingSelf 
                ? "Seu Perfil" 
                : `Perfil de ${user.username}`}
            </h1>
            <p className="text-gray-300">
              {isViewingSelf 
                ? "Gerencia suas informações pessoais e preferências" 
                : `Informações públicas de ${user.username}`}
            </p>
          </div>
          
          <Card className="bg-dark-surface border-dark-border overflow-hidden">
            <CardHeader className="bg-dark-surface-2 border-b border-dark-border px-6">
              <div className="w-full">
                <div className="bg-transparent border-b border-dark-border w-full justify-start rounded-none p-0 h-auto flex">
                  <button 
                    onClick={() => setActiveTab("profile")}
                    className={`flex items-center border-b-2 ${
                      activeTab === "profile" 
                        ? "border-primary text-primary" 
                        : "border-transparent text-gray-400"
                    } rounded-none px-4 py-3`}
                  >
                    <UserCog className="mr-2 h-4 w-4" />
                    {isViewingSelf ? "Informações Pessoais" : "Perfil"}
                  </button>
                  
                  {isViewingSelf && (
                    <>
                      <button 
                        onClick={() => setActiveTab("security")}
                        className={`flex items-center border-b-2 ${
                          activeTab === "security" 
                            ? "border-primary text-primary" 
                            : "border-transparent text-gray-400"
                        } rounded-none px-4 py-3`}
                      >
                        <Key className="mr-2 h-4 w-4" />
                        Segurança
                      </button>
                      <button 
                        onClick={() => setActiveTab("notifications")}
                        className={`flex items-center border-b-2 ${
                          activeTab === "notifications" 
                            ? "border-primary text-primary" 
                            : "border-transparent text-gray-400"
                        } rounded-none px-4 py-3`}
                      >
                        <Bell className="mr-2 h-4 w-4" />
                        Notificações
                      </button>
                      {user.isAdmin && (
                        <button 
                          onClick={() => setActiveTab("admin")}
                          className={`flex items-center border-b-2 ${
                            activeTab === "admin" 
                              ? "border-primary text-primary" 
                              : "border-transparent text-gray-400"
                          } rounded-none px-4 py-3`}
                        >
                          <Shield className="mr-2 h-4 w-4" />
                          Admin
                        </button>
                      )}
                    </>
                  )}
                </div>
              </div>
            </CardHeader>
            
            <CardContent className="px-6 py-6">
              {activeTab === "profile" && (
                <div className="mt-0">
                  {isViewingSelf ? (
                    <UserProfileForm downloadLimitInfo={downloadLimitInfo} />
                  ) : (
                    <div className="space-y-6">
                      <div className="flex items-center space-x-4 mb-6">
                        <div className="w-16 h-16 bg-dark-surface-2 border border-dark-border rounded-full overflow-hidden flex items-center justify-center">
                          {user.avatar ? (
                            <img 
                              src={user.avatar} 
                              alt={user.username} 
                              className="w-full h-full object-cover"
                            />
                          ) : (
                            <UserCog className="w-8 h-8 text-gray-400" />
                          )}
                        </div>
                        <div>
                          <h3 className="text-xl font-medium">{user.username}</h3>
                          <p className="text-gray-400">
                            {user.isAdmin ? "Administrador" : "Usuário"}
                          </p>
                          {user.name && (
                            <p className="text-gray-300 text-sm">
                              {user.name}
                            </p>
                          )}
                        </div>
                      </div>
                      
                      <div>
                        <h3 className="text-lg font-medium mb-4">Documentos compartilhados</h3>
                        <p className="text-gray-400 mb-2">
                          PDFs enviados por este usuário aparecerão aqui.
                        </p>
                        <div className="text-center py-8 text-gray-300">
                          Esta funcionalidade será implementada em breve.
                        </div>
                      </div>
                    </div>
                  )}
                </div>
              )}
              
              {isViewingSelf && (
                <>
                  {activeTab === "security" && (
                    <SecuritySettings />
                  )}
                  
                  {activeTab === "notifications" && (
                    <div className="mt-0 space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Preferências de Notificação</h3>
                        <p className="text-gray-400">
                          Controle como e quando você recebe notificações sobre atividades em sua conta.
                        </p>
                      </div>
                      
                      <div className="rounded-lg border border-dark-border p-6">
                        <h4 className="font-medium mb-4">Configurações de notificação</h4>
                        <p className="text-gray-300 italic">
                          Esta funcionalidade será implementada em breve.
                        </p>
                      </div>
                    </div>
                  )}
                  
                  {user.isAdmin && activeTab === "admin" && (
                    <div className="mt-0 space-y-6">
                      <div>
                        <h3 className="text-lg font-medium mb-4">Painel de Administrador</h3>
                        <p className="text-gray-400">
                          Acesso rápido às funções administrativas.
                        </p>
                      </div>
                      
                      <div className="rounded-lg border border-dark-border p-6">
                        <h4 className="font-medium mb-4">Ações de administrador</h4>
                        <p className="text-gray-300 mb-4">
                          Como administrador, você pode gerenciar usuários, categorias e conteúdo do site.
                        </p>
                        <p className="text-gray-300 italic">
                          Funcionalidades administrativas adicionais serão implementadas em breve.
                        </p>
                      </div>
                    </div>
                  )}
                </>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  );
}