import { useState } from "react";
import { Link, useLocation } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { Button } from "@/components/ui/button";
import { 
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
  DropdownMenuGroup,
  DropdownMenuLabel,
} from "@/components/ui/dropdown-menu";
import { 
  Dialog,
  DialogContent,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Separator } from "@/components/ui/separator";
import PdfUploadForm from "@/components/pdf/pdf-upload-form";
import { 
  Search, 
  Upload, 
  ChevronDown, 
  Menu
} from "lucide-react";

export default function Header() {
  const [location, navigate] = useLocation();
  const { user, logoutMutation } = useAuth();
  const queryClient = useQueryClient();
  const [searchQuery, setSearchQuery] = useState("");
  const [isUploadModalOpen, setIsUploadModalOpen] = useState(false);
  // Usar o contexto do menu móvel global
  const { isMobileMenuOpen, toggleMobileMenu } = useMobileMenu();
  
  // Buscar configurações de SEO para nome do site
  const { data: seoSettings } = useQuery<any>({
    queryKey: ["/api/seo-settings"],
  });
  
  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/explorar?q=${encodeURIComponent(searchQuery.trim())}`);
    }
  };
  
  const handleLogout = async () => {
    try {
      await logoutMutation.mutateAsync();
      // Aguarda um pouco para garantir que a sessão foi limpa
      setTimeout(() => {
        // Força uma atualização da consulta do usuário
        queryClient.invalidateQueries({ queryKey: ["/api/user"] });
        queryClient.setQueryData(["/api/user"], null);
        // Limpa todo o cache para garantir logout completo
        queryClient.clear();
        // Redireciona para a página inicial
        navigate("/");
        // Força um reload da página para garantir logout completo
        window.location.reload();
      }, 100);
    } catch (error) {
      console.error("Erro no logout:", error);
      // Mesmo com erro, tenta limpar o estado local
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      navigate("/");
      window.location.reload();
    }
  };
  
  // PDF tools removed - now a simple public PDF repository
  
  return (
    <header className="bg-dark-surface border-b border-dark-border sticky top-0 z-10">
      <div className="container mx-auto px-4 flex items-center justify-between h-16">
        <div className="flex items-center space-x-4">
          <button 
            className="md:hidden p-2 rounded-md hover:bg-dark-surface-2 focus:outline-none"
            onClick={toggleMobileMenu}
          >
            <Menu className="w-5 h-5" />
          </button>
          
          <Link href="/" className="flex items-center space-x-2" onClick={() => {
            // Para garantir que as queries serão recarregadas ao voltar para a home
            // Necessita atualizar no mínimo "/api/pdfs/popular" e "/api/pdfs/recent"
            queryClient.invalidateQueries({ queryKey: ['/api/pdfs/popular'] });
            queryClient.invalidateQueries({ queryKey: ['/api/pdfs/recent'] });
          }}>
            <svg className="w-8 h-8 text-primary" viewBox="0 0 24 24" fill="currentColor">
              <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
              <path d="M9 13H15V15H9V13ZM9 16H15V18H9V16Z"/>
            </svg>
            <span className="text-xl font-bold">{seoSettings?.siteTitle?.split(' ')[0] || "PDFxandria"}</span>
          </Link>
          
          {/* Menu Principal Desktop */}
          <nav className="hidden md:flex items-center space-x-1">
            <Link href="/explorar">
              <Button variant="ghost" size="sm">Explorar</Button>
            </Link>
          </nav>
        </div>
        
        <div className="flex items-center">
          <form onSubmit={handleSearch} className="relative mr-4 hidden md:block">
            <Input
              type="text"
              placeholder="Pesquisar PDFs..."
              className="w-64 bg-dark-surface-2 border border-dark-border rounded-lg"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
            <Search className="absolute right-3 top-2.5 text-gray-400 w-4 h-4" />
          </form>
          
          {user ? (
            <div className="hidden md:flex items-center space-x-3">
              {user.isAdmin && (
                <Button 
                  className="flex items-center space-x-1 bg-primary hover:bg-primary-dark text-white"
                  onClick={() => setIsUploadModalOpen(true)}
                  size="sm"
                >
                  <Upload className="w-4 h-4" />
                  <span>Upload</span>
                </Button>
              )}
              
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <Button variant="ghost" className="flex items-center space-x-2 focus:outline-none">
                    {user.avatar ? (
                      <img 
                        src={user.avatar} 
                        alt={user.username} 
                        className="w-8 h-8 rounded-full object-cover"
                        onError={(e) => {
                          // Fallback para a inicial se a imagem não carregar
                          const target = e.target as HTMLImageElement;
                          target.onerror = null;
                          target.style.display = 'none';
                          target.nextElementSibling?.classList.remove('hidden');
                        }} 
                      />
                    ) : null}
                    <div className={`w-8 h-8 rounded-full bg-primary flex items-center justify-center text-white ${user.avatar ? 'hidden' : ''}`}>
                      {user.username ? user.username.charAt(0).toUpperCase() : 'U'}
                    </div>
                    <span className="hidden lg:inline-block">{user.username || 'User'}</span>
                    <ChevronDown className="w-4 h-4" />
                  </Button>
                </DropdownMenuTrigger>
                
                <DropdownMenuContent align="end" className="bg-dark-surface-2 border-dark-border">
                  <DropdownMenuGroup>
                    <DropdownMenuItem asChild>
                      <Link href="/painel" className="cursor-pointer">
                        Meus PDFs
                      </Link>
                    </DropdownMenuItem>
                    
                    <DropdownMenuItem asChild>
                      <Link 
                        href="/perfil" 
                        className="cursor-pointer"
                        onClick={() => {
                          // Invalidar queries relevantes antes de navegar
                          queryClient.invalidateQueries({ queryKey: ["/api/user"] });
                          queryClient.invalidateQueries({ queryKey: ["/api/users/me"] });
                          // Invalidar qualquer query relacionada com usuários
                          queryClient.invalidateQueries({
                            predicate: (query) => {
                              const key = String(query.queryKey[0] || "");
                              return key.includes("/api/users/");
                            }
                          });
                        }}
                      >
                        Meu Perfil
                      </Link>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  
                  {user.isAdmin && (
                    <>
                      <DropdownMenuSeparator className="bg-dark-border" />
                      <DropdownMenuItem asChild>
                        <Link href="/admin" className="cursor-pointer">
                          Admin
                        </Link>
                      </DropdownMenuItem>
                    </>
                  )}
                  
                  <DropdownMenuSeparator className="bg-dark-border" />
                  
                  <DropdownMenuItem onClick={handleLogout} className="text-destructive focus:text-destructive cursor-pointer">
                    Sair
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </div>
          ) : (
            <div className="hidden">
              {/* Botões de login/registro removidos - acesso direto via URL */}
            </div>
          )}
        </div>
      </div>
      
      {/* Upload Modal */}
      <Dialog open={isUploadModalOpen} onOpenChange={setIsUploadModalOpen}>
        <DialogContent className="bg-dark-surface border-dark-border">
          <DialogTitle>Upload de PDF</DialogTitle>
          <DialogDescription>
            Faça o upload de um arquivo PDF para compartilhar com a comunidade.
          </DialogDescription>
          <PdfUploadForm onSuccess={() => setIsUploadModalOpen(false)} />
        </DialogContent>
      </Dialog>
    </header>
  );
}
