import { Link, useLocation } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Category, Pdf } from "@shared/schema";
import { cn } from "@/lib/utils";
import { useEffect } from "react";
import { useMobileMenu } from "@/hooks/use-mobile-menu";
import { 
  Home, 
  Compass, 
  Clock, 
  Book, 
  Briefcase, 
  Lightbulb, 
  PaintBucket, 
  Code, 
  Info, 
  Shield, 
  Plus,
  File
} from "lucide-react";
import { Sheet, SheetContent } from "@/components/ui/sheet";

interface SidebarProps {
  className?: string;
}

export default function Sidebar({ className }: SidebarProps) {
  const [location] = useLocation();
  const { isMobileMenuOpen, setMobileMenuOpen } = useMobileMenu();
  
  // Efeito para fechar o menu ao navegar para uma nova página
  useEffect(() => {
    setMobileMenuOpen(false);
  }, [location, setMobileMenuOpen]);
  
  // Buscar categorias
  const { data: categories, isLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Buscar PDFs recentes (limitado a 6)
  const { data: recentPdfs, isLoading: isLoadingPdfs } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs/recent", { limit: 6 }],
  });
  
  // Icon mapping for categories
  const categoryIcons: Record<string, React.ReactNode> = {
    educacao: <Book className="w-4 h-4" />,
    negocios: <Briefcase className="w-4 h-4" />,
    ciencia: <Lightbulb className="w-4 h-4" />,
    arte: <PaintBucket className="w-4 h-4" />,
    tecnologia: <Code className="w-4 h-4" />,
  };
  
  // Helper for active link styling
  const isActiveLink = (path: string) => {
    return location === path;
  };
  
  // Removed PDF tools - now a simple public PDF repository

  // Sidebar content component to reuse in both desktop and mobile views
  const SidebarContent = () => (
    <nav className="p-4">
      {/* Removed PDF Tools Section - Now a simple public PDF repository */}

      <div className="mb-6">
        <h4 className="text-sm font-semibold uppercase text-gray-400 mb-2">Navegação</h4>
        <ul className="space-y-1">
          <li>
            <Link 
              href="/"
              className={cn(
                "flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-surface-2",
                isActiveLink("/") && "text-primary hover:bg-opacity-30"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Home className="w-4 h-4" />
              <span>Início</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/explorar"
              className={cn(
                "flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-surface-2",
                isActiveLink("/explorar") && "text-primary hover:bg-opacity-30"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Compass className="w-4 h-4" />
              <span>Explorar</span>
            </Link>
          </li>
          <li>
            <Link 
              href="/recentes"
              className={cn(
                "flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-surface-2",
                isActiveLink("/recentes") && "text-primary hover:bg-opacity-30"
              )}
              onClick={() => setMobileMenuOpen(false)}
            >
              <Clock className="w-4 h-4" />
              <span>Recentes</span>
            </Link>
          </li>
          {/* Removed Favorites - Now a simple public PDF repository */}
        </ul>
      </div>
      
      {/* PDFs Recentes */}
      <div className="mb-6">
        <div className="flex items-center justify-between mb-2">
          <h4 className="text-sm font-semibold uppercase text-gray-400">PDFs Recentes</h4>
          <Link 
            href="/recentes" 
            className="text-xs text-primary hover:underline"
            onClick={() => setMobileMenuOpen(false)}
          >
            Ver todos
          </Link>
        </div>
        <ul className="space-y-1">
          {isLoadingPdfs ? (
            <li className="text-sm text-gray-400">Carregando PDFs...</li>
          ) : recentPdfs && recentPdfs.length > 0 ? (
            recentPdfs.slice(0, 6).map((pdf) => (
              <li key={pdf.id}>
                <Link 
                  href={`/pdf/${pdf.slug}`}
                  className="flex items-center p-2 rounded-lg hover:bg-dark-surface-2 group"
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <File className="w-4 h-4 mr-2 text-gray-400 group-hover:text-primary" />
                  <span className="text-sm truncate">{pdf.title}</span>
                </Link>
              </li>
            ))
          ) : (
            <li className="text-sm text-gray-400 p-2">Nenhum PDF recente encontrado</li>
          )}
        </ul>
      </div>
      
      {/* PDF Tools Section Removed - Now a simple public PDF repository */}

      
      <div className="mb-6">
        <h4 className="text-sm font-semibold uppercase text-gray-400 mb-2">Categorias</h4>
        <ul className="space-y-1">
          {isLoading ? (
            <li className="text-sm text-gray-400">Carregando categorias...</li>
          ) : (
            <>
              {categories?.slice(0, 5).map((category) => (
                <li key={category.id}>
                  <Link 
                    href={`/categoria/${category.slug}`}
                    className={cn(
                      "flex items-center space-x-2 p-2 rounded-lg hover:bg-dark-surface-2",
                      isActiveLink(`/categoria/${category.slug}`) && "text-primary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {categoryIcons[category.slug] || <Book className="w-4 h-4" />}
                    <span>{category.name}</span>
                  </Link>
                </li>
              ))}
              <li>
                <Link 
                  href="/categorias"
                  className={cn(
                    "flex items-center space-x-2 p-2 rounded-lg text-primary hover:bg-dark-surface-2",
                    isActiveLink("/categorias") && "hover:bg-opacity-30"
                  )}
                  onClick={() => setMobileMenuOpen(false)}
                >
                  <Plus className="w-4 h-4" />
                  <span>Ver todas</span>
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
      
      <div className="pt-4 border-t border-dark-border">
        <Link 
          href="/ajuda"
          className={cn(
            "flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:bg-dark-surface-2",
            isActiveLink("/ajuda") && "text-primary"
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Info className="w-4 h-4" />
          <span>Ajuda</span>
        </Link>
        <Link 
          href="/privacidade"
          className={cn(
            "flex items-center space-x-2 p-2 rounded-lg text-gray-400 hover:bg-dark-surface-2",
            isActiveLink("/privacidade") && "text-primary"
          )}
          onClick={() => setMobileMenuOpen(false)}
        >
          <Shield className="w-4 h-4" />
          <span>Política de Privacidade</span>
        </Link>
      </div>
    </nav>
  );

  return (
    <>
      {/* Desktop Sidebar */}
      <aside className={cn("w-64 bg-dark-surface border-r border-dark-border overflow-y-auto hidden md:block", className)}>
        <SidebarContent />
      </aside>

      {/* Mobile Sidebar Sheet - Controlado pelo botão hamburger no Header */}
      <div className="md:hidden">
        <Sheet open={isMobileMenuOpen} onOpenChange={setMobileMenuOpen}>
          <SheetContent 
            side="left" 
            className="w-64 p-0 overflow-y-auto touch-pan-y bg-dark-surface border-r border-dark-border"
          >
            <SidebarContent />
          </SheetContent>
        </Sheet>
      </div>
    </>
  );
}
