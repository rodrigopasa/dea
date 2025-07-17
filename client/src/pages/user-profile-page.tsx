import { useEffect, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { useRoute, Link } from "wouter";
import { Pdf, User } from "@shared/schema";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Calendar, FileText, User as UserIcon, Upload } from "lucide-react";
import PdfCard from "@/components/pdf/pdf-card";
import Sidebar from "@/components/layout/sidebar";

export default function UserProfilePage() {
  const [match, params] = useRoute("/usuario/:username");
  const username = match ? params?.username : null;
  
  // Fetch user by username
  const { data: user, isLoading: isUserLoading } = useQuery<User>({
    queryKey: [`/api/users/name/${username}`],
    enabled: !!username,
  });
  
  // Fetch user's uploaded PDFs
  const { data: userPdfs, isLoading: isPdfsLoading } = useQuery<Pdf[]>({
    queryKey: [`/api/users/${user?.id}/pdfs`],
    enabled: !!user?.id,
  });
  
  // Format date
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };
  
  if (!match || isUserLoading) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-64">
          <div className="text-center py-12">
            <div className="animate-spin h-12 w-12 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
            <p className="text-gray-400">Carregando perfil do usuário...</p>
          </div>
        </div>
      </div>
    );
  }
  
  if (!user) {
    return (
      <div className="container mx-auto p-4 md:p-6 flex">
        <Sidebar />
        <div className="flex-1 ml-0 md:ml-64">
          <div className="text-center py-12">
            <FileText className="w-16 h-16 mx-auto mb-4 text-gray-400" />
            <h2 className="text-2xl font-bold mb-2">Usuário não encontrado</h2>
            <p className="text-gray-400 mb-6">O usuário {username} não existe ou foi removido.</p>
            <Link href="/">
              <Button variant="default">Voltar para a página inicial</Button>
            </Link>
          </div>
        </div>
      </div>
    );
  }
  
  return (
    <div className="container mx-auto p-4 md:p-6 flex">
      <Sidebar />
      
      <div className="flex-1 ml-0 md:ml-64">
        <div className="mb-6">
          <Link href="/" className="text-primary hover:underline flex items-center">
            <FileText className="w-4 h-4 mr-1" /> Início
          </Link>
        </div>
        
        <div className="bg-dark-surface rounded-xl p-4 md:p-6 mb-6">
          <div className="flex flex-col md:flex-row gap-6 items-start">
            <div className="text-center md:text-left">
              <Avatar className="h-24 w-24 mx-auto md:mx-0 mb-4 border-2 border-primary">
                {user.avatar ? (
                  <AvatarImage 
                    src={`/uploads/avatars/${user.avatar}?t=${Date.now()}`} 
                    alt={user.username} 
                  />
                ) : null}
                <AvatarFallback className="text-2xl bg-primary text-white">
                  {user.username?.substring(0, 2).toUpperCase()}
                </AvatarFallback>
              </Avatar>
            </div>
            
            <div className="flex-1">
              <div className="flex flex-col md:flex-row justify-between items-start md:items-center mb-4">
                <div>
                  <h1 className="text-3xl font-bold mb-1">{user.username}</h1>
                  <div className="flex items-center text-gray-400 mb-2">
                    <Calendar className="w-4 h-4 mr-1" /> 
                    Membro desde {formatDate(user.createdAt)}
                  </div>
                </div>
                
                {user.isAdmin && (
                  <div className="bg-primary/20 text-primary px-3 py-1 rounded-full text-sm font-medium">
                    Administrador
                  </div>
                )}
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <Card className="bg-dark-surface-2 border-dark-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Documentos</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">{userPdfs?.length || 0}</div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-surface-2 border-dark-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Visualizações</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userPdfs?.reduce((total, pdf) => total + (pdf.views || 0), 0) || 0}
                    </div>
                  </CardContent>
                </Card>
                
                <Card className="bg-dark-surface-2 border-dark-border">
                  <CardHeader className="pb-2">
                    <CardTitle className="text-sm text-gray-400">Downloads</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-2xl font-bold">
                      {userPdfs?.reduce((total, pdf) => total + (pdf.downloads || 0), 0) || 0}
                    </div>
                  </CardContent>
                </Card>
              </div>
            </div>
          </div>
        </div>
        
        <Tabs defaultValue="uploads">
          <TabsList className="bg-dark-surface mb-6">
            <TabsTrigger value="uploads" className="data-[state=active]:bg-primary/20">
              <Upload className="w-4 h-4 mr-2" /> Uploads
            </TabsTrigger>
            <TabsTrigger value="info" className="data-[state=active]:bg-primary/20">
              <UserIcon className="w-4 h-4 mr-2" /> Informações
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="uploads">
            <div className="mb-8">
              <h2 className="text-2xl font-bold mb-4">Documentos enviados por {user.username}</h2>
              
              {isPdfsLoading ? (
                <div className="text-center py-12">
                  <div className="animate-spin h-8 w-8 border-4 border-primary border-t-transparent rounded-full mx-auto mb-4"></div>
                  <p className="text-gray-400">Carregando documentos...</p>
                </div>
              ) : !userPdfs || userPdfs.length === 0 ? (
                <div className="text-center py-12 bg-dark-surface-2 rounded-lg">
                  <FileText className="w-12 h-12 mx-auto mb-4 text-gray-400" />
                  <h3 className="text-xl font-semibold mb-2">Nenhum documento encontrado</h3>
                  <p className="text-gray-400">Este usuário ainda não enviou nenhum documento.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {userPdfs.map((pdf) => (
                    <PdfCard key={pdf.id} pdf={pdf} />
                  ))}
                </div>
              )}
            </div>
          </TabsContent>
          
          <TabsContent value="info">
            <div className="bg-dark-surface rounded-xl p-6 mb-6">
              <h2 className="text-2xl font-bold mb-4">Informações do usuário</h2>
              
              <div className="grid grid-cols-1 gap-4">
                <div className="p-4 bg-dark-surface-2 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Nome de usuário</p>
                  <p className="font-medium">{user.username}</p>
                </div>
                
                <div className="p-4 bg-dark-surface-2 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Tipo de conta</p>
                  <p className="font-medium">{user.isAdmin ? 'Administrador' : 'Usuário padrão'}</p>
                </div>
                
                <div className="p-4 bg-dark-surface-2 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Data de registro</p>
                  <p className="font-medium">{formatDate(user.createdAt)}</p>
                </div>
                
                <div className="p-4 bg-dark-surface-2 rounded-lg">
                  <p className="text-sm text-gray-400 mb-1">Documentos enviados</p>
                  <p className="font-medium">{userPdfs?.length || 0}</p>
                </div>
                
                {user.bio && (
                  <div className="p-4 bg-dark-surface-2 rounded-lg">
                    <p className="text-sm text-gray-400 mb-1">Biografia</p>
                    <p className="font-medium">{user.bio}</p>
                  </div>
                )}
              </div>
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}