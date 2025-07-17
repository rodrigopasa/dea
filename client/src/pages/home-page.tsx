import { useState, useEffect } from "react";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { Link } from "wouter";
import { Pdf, Category } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import PdfCard from "@/components/pdf/pdf-card";
import UnifiedSeo from "@/components/seo/unified-seo";
import { Button } from "@/components/ui/button";
import {
  Upload,
  Compass,
  Eye,
  ArrowRight
} from "lucide-react";

export default function HomePage() {
  const [showMobileSidebar, setShowMobileSidebar] = useState(false);
  const queryClient = useQueryClient();
  
  // Efeito para garantir que os dados da página serão carregados quando a página for montada
  useEffect(() => {
    queryClient.invalidateQueries({ queryKey: ["/api/pdfs/popular"] });
    queryClient.invalidateQueries({ queryKey: ["/api/pdfs/recent"] });
    queryClient.invalidateQueries({ queryKey: ["/api/categories"] });
  }, [queryClient]);
  
  const { data: popularPdfs, isLoading: isPopularLoading } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs/popular"],
  });
  
  const { data: recentPdfs, isLoading: isRecentLoading } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs/recent"],
  });
  
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });

  // Removed PDF tools - now a simple public PDF repository
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* SEO Meta Tags */}
      <UnifiedSeo 
        canonicalUrl={window.location.href}
        type="website"
      />
      
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          {/* Hero Section - Agora Combinada */}
          <section className="mb-8">
            <div className="bg-gradient-to-r from-dark-surface via-dark-surface-2 to-dark-surface rounded-xl p-6 mb-8 shadow-lg">
              <div className="flex flex-col md:flex-row items-center">
                <div className="md:w-3/5 mb-6 md:mb-0 md:pr-8">
                  <div className="bg-gradient-to-r from-purple-500 via-primary to-blue-500 bg-clip-text text-transparent text-sm font-semibold mb-2">
                    REPOSITÓRIO PÚBLICO DE PDFS
                  </div>
                  <h1 className="text-4xl font-bold mb-4">Descubra e Baixe PDFs do Domínio Público</h1>
                  <p className="text-gray-300 mb-6 text-lg">
                    Explore nossa coleção de documentos PDF gratuitos e abertos para todos. Encontre livros, artigos e materiais educacionais disponíveis no domínio público.
                  </p>
                  <div className="flex flex-wrap gap-3">
                    <Link href="/explorar">
                      <Button className="flex items-center space-x-2 bg-primary hover:bg-primary-dark text-white">
                        <Compass className="w-4 h-4" />
                        <span>Explorar Biblioteca</span>
                      </Button>
                    </Link>
                    <Link href="/recentes">
                      <Button variant="outline" className="flex items-center space-x-2 border-dark-border hover:bg-dark-surface-2">
                        <Eye className="w-4 h-4" />
                        <span>Recentes</span>
                      </Button>
                    </Link>
                  </div>
                </div>
                <div className="md:w-2/5 flex justify-center">
                  <div className="relative">
                    {/* Elemento decorativo */}
                    <div className="absolute -z-10 w-64 h-64 bg-gradient-to-r from-primary/20 to-blue-500/20 rounded-full blur-3xl"></div>
                    
                    {/* Imagem principal */}
                    <div className="rounded-lg w-full max-w-md bg-dark-surface/70 backdrop-blur border border-dark-border/50 p-4 shadow-xl">
                      <div className="grid grid-cols-2 gap-3 mb-3">
                        <div className="h-16 bg-dark-surface-2 border border-dark-border rounded-md flex items-center justify-center">
                          <svg className="w-8 h-8 text-primary/70" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
                          </svg>
                        </div>
                        <div className="h-16 bg-dark-surface-2 border border-dark-border rounded-md flex items-center justify-center">
                          <svg className="w-8 h-8 text-blue-500/70" viewBox="0 0 24 24" fill="currentColor">
                            <path d="M13 9H18.5L13 3.5V9ZM6 2H14L20 8V20C20 21.1 19.1 22 18 22H6C4.9 22 4 21.1 4 20V4C4 2.9 4.9 2 6 2Z"/>
                          </svg>
                        </div>
                      </div>
                      <div className="h-32 bg-dark-surface-2 border border-dark-border rounded-md flex flex-col items-center justify-center p-4">
                        <svg className="w-16 h-16 text-primary" viewBox="0 0 24 24" fill="currentColor">
                          <path d="M14 2H6C4.9 2 4 2.9 4 4V20C4 21.1 4.9 22 6 22H18C19.1 22 20 21.1 20 20V8L14 2ZM18 20H6V4H13V9H18V20Z"/>
                          <path d="M9 13H15V15H9V13ZM9 16H15V18H9V16Z"/>
                        </svg>
                        <div className="text-xs mt-2 text-center text-gray-400">
                          Documentos PDF do domínio público
                        </div>
                      </div>
                      <div className="grid grid-cols-2 gap-3 mt-3">
                        <div className="h-16 bg-dark-surface-2 border border-dark-border rounded-md flex items-center justify-center">
                          <Eye className="h-8 w-8 text-emerald-500/70" />
                        </div>
                        <div className="h-16 bg-dark-surface-2 border border-dark-border rounded-md flex items-center justify-center">
                          <Compass className="h-8 w-8 text-red-500/70" />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </section>
          
          {/* Removed PDF Tools Section - Now a simple public PDF repository */}
          
          {/* PDFs Populares */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">PDFs Populares</h2>
              <Link href="/populares" className="text-primary hover:underline">Ver todos</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isPopularLoading ? (
                <div className="col-span-full h-64 flex items-center justify-center">
                  <p className="text-gray-400">Carregando documentos populares...</p>
                </div>
              ) : popularPdfs && popularPdfs.length > 0 ? (
                popularPdfs.map((pdf) => (
                  <PdfCard key={pdf.id} pdf={pdf} />
                ))
              ) : (
                <div className="col-span-full h-64 flex flex-col items-center justify-center">
                  <Eye className="text-gray-400 w-12 h-12 mb-2" />
                  <p className="text-gray-400">Nenhum documento popular encontrado</p>
                </div>
              )}
            </div>
          </section>
          
          {/* Adicionados Recentemente */}
          <section className="mb-8">
            <div className="flex justify-between items-center mb-4">
              <h2 className="text-2xl font-bold">Adicionados Recentemente</h2>
              <Link href="/recentes" className="text-primary hover:underline">Ver todos</Link>
            </div>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
              {isRecentLoading ? (
                <div className="col-span-full h-64 flex items-center justify-center">
                  <p className="text-gray-400">Carregando documentos recentes...</p>
                </div>
              ) : recentPdfs && recentPdfs.length > 0 ? (
                recentPdfs.map((pdf) => (
                  <PdfCard key={pdf.id} pdf={pdf} />
                ))
              ) : (
                <div className="col-span-full h-64 flex flex-col items-center justify-center">
                  <svg className="w-12 h-12 text-gray-400 mb-2" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
                    <path d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <p className="text-gray-400">Nenhum documento recente encontrado</p>
                </div>
              )}
            </div>
          </section>
          
          {/* Sobre o Repositório */}
          <section className="mb-8">
            <div className="bg-dark-surface rounded-xl p-8 shadow-xl">
              <div className="text-center mb-8">
                <h2 className="text-3xl font-bold mb-3 bg-gradient-to-r from-purple-400 via-pink-500 to-red-500 bg-clip-text text-transparent">
                  Repositório Público de PDFs
                </h2>
                <p className="text-gray-300 max-w-2xl mx-auto text-lg">
                  Acesse gratuitamente nossa coleção de documentos PDF do domínio público.
                </p>
              </div>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-8 mb-8">
                {/* Acesso Gratuito */}
                <div className="bg-dark-surface-2/50 p-6 rounded-xl border border-dark-border">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-primary/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <Eye className="w-6 h-6 text-primary" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Acesso Livre</h3>
                      <p className="text-gray-400">
                        Navegue e baixe documentos sem limites ou cadastro
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 pl-16">
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs text-white">✓</div>
                      <span className="text-gray-300">Downloads ilimitados</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs text-white">✓</div>
                      <span className="text-gray-300">Sem necessidade de cadastro</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-primary/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs text-white">✓</div>
                      <span className="text-gray-300">Avaliações públicas</span>
                    </li>
                  </ul>
                </div>
                
                {/* Conteúdo Curado */}
                <div className="bg-dark-surface-2/50 p-6 rounded-xl border border-dark-border">
                  <div className="flex items-start mb-4">
                    <div className="w-12 h-12 rounded-full bg-green-500/20 flex items-center justify-center mr-4 flex-shrink-0">
                      <Compass className="w-6 h-6 text-green-500" />
                    </div>
                    <div>
                      <h3 className="text-xl font-semibold mb-1">Conteúdo Curado</h3>
                      <p className="text-gray-400">
                        Documentos selecionados e organizados por categorias
                      </p>
                    </div>
                  </div>
                  
                  <ul className="space-y-3 pl-16">
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs text-white">✓</div>
                      <span className="text-gray-300">Domínio público verificado</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs text-white">✓</div>
                      <span className="text-gray-300">Organização por categorias</span>
                    </li>
                    <li className="flex items-start">
                      <div className="w-5 h-5 rounded-full bg-green-500/30 flex items-center justify-center mr-2 mt-0.5 flex-shrink-0 text-xs text-white">✓</div>
                      <span className="text-gray-300">Qualidade garantida</span>
                    </li>
                  </ul>
                </div>
              </div>
              
              <div className="flex flex-wrap justify-center gap-4">
                <Link href="/explorar">
                  <Button className="bg-primary hover:bg-primary-dark text-white">
                    Explorar Biblioteca
                  </Button>
                </Link>
                <Link href="/categorias">
                  <Button variant="outline" className="border-primary text-primary hover:bg-primary/10">
                    Ver Categorias
                  </Button>
                </Link>
              </div>
            </div>
          </section>
          
          {/* Removed Premium Plans Section - Now a free public PDF repository */}
        </div>
      </main>
    </div>
  );
}
