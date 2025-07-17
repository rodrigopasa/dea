import { useAuth } from "@/hooks/use-auth";
import { useQuery } from "@tanstack/react-query";
import { Pdf } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import PdfCard from "@/components/pdf/pdf-card";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Bookmark, HeartOff } from "lucide-react";
import { Link } from "wouter";

export default function FavoritesPage() {
  const { user } = useAuth();
  
  // Consulta para obter os favoritos do usuário
  const { data: favoritePdfs, isLoading: isPdfsLoading } = useQuery<Pdf[]>({
    queryKey: ["/api/favorites"],
    enabled: !!user,
  });
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Meus Favoritos</h1>
            <p className="text-gray-300">Documentos que você salvou para acesso rápido</p>
          </div>
          
          {!user ? (
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Bookmark className="text-gray-400 w-12 h-12 mb-2" />
                <h3 className="text-lg font-medium mb-2">Faça login para ver seus favoritos</h3>
                <p className="text-gray-400 text-center mb-4">
                  Você precisa ter uma conta para salvar documentos como favoritos.
                </p>
                <Link href="/entrar">
                  <Button>Fazer Login</Button>
                </Link>
              </CardContent>
            </Card>
          ) : isPdfsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : favoritePdfs && favoritePdfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {favoritePdfs.map((pdf) => (
                <PdfCard key={pdf.id} pdf={pdf} />
              ))}
            </div>
          ) : (
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <HeartOff className="text-gray-400 w-12 h-12 mb-2" />
                <h3 className="text-lg font-medium mb-2">Nenhum favorito encontrado</h3>
                <p className="text-gray-400 text-center mb-4">
                  Você ainda não adicionou documentos aos seus favoritos.
                </p>
                <Link href="/explorar">
                  <Button>Explorar Documentos</Button>
                </Link>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}