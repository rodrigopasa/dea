import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Pdf, Category } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import PdfCard from "@/components/pdf/pdf-card";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Filter, FolderOpen } from "lucide-react";
import UnifiedSeo from "@/components/seo/unified-seo";

export default function CategoryPage() {
  const [, params] = useRoute("/categoria/:slug");
  const categorySlug = params?.slug;
  
  // Fetch categories
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Find the current category
  const currentCategory = categories?.find(
    (category) => category.slug === categorySlug
  );
  
  // Fetch PDFs in this category
  const { data: categoryPdfs, isLoading: isPdfsLoading } = useQuery<Pdf[]>({
    queryKey: [`/api/categories/${currentCategory?.id}/pdfs`],
    enabled: !!currentCategory?.id,
  });
  
  // Fetch SEO settings
  const { data: seoSettings } = useQuery({
    queryKey: ["/api/seo"],
  });
  
  // Fallback to fetch all PDFs and filter client-side if category-specific endpoint fails
  const { data: allPdfs } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs"],
    enabled: !categoryPdfs && !!currentCategory?.id,
  });
  
  // Filter PDFs by category if needed
  const pdfs = categoryPdfs || 
    (currentCategory?.id ? 
      allPdfs?.filter(pdf => pdf.categoryId === currentCategory.id && pdf.isPublic) : 
      []);
  
  if (!categorySlug) {
    return <div>Categoria não encontrada</div>;
  }
  
  // SEO Title e Description para categorias
  const pageTitle = currentCategory ? `Baixar PDFs de ${currentCategory.name} - PDFxandria` : 'Categoria - PDFxandria';
  const pageDescription = currentCategory 
    ? `Explore e baixe PDFs de ${currentCategory.name}. Uma coleção completa de documentos de ${currentCategory.name} para download gratuito.`
    : 'Explore nossa coleção de PDFs por categoria.';
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* SEO Unificado */}
      <UnifiedSeo 
        pageTitle={currentCategory?.name}
        pageDescription={pageDescription}
        canonicalUrl={currentCategory ? `${window.location.origin}/categoria/${categorySlug}` : undefined}
        type="website"
        keywords={currentCategory ? [`${currentCategory.name}`, "PDFs", "download", "documentos"] : []}
      />
      
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/categorias" className="text-primary hover:underline">
                Categorias
              </Link>
              <span className="text-gray-400">/</span>
              <h1 className="text-2xl font-bold">{currentCategory?.name || "Carregando..."}</h1>
            </div>
            <p className="text-gray-300">Documentos relacionados a {currentCategory?.name || "esta categoria"}</p>
          </div>
          
          {isPdfsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : pdfs && pdfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {pdfs.map((pdf) => (
                <PdfCard key={pdf.id} pdf={pdf} />
              ))}
            </div>
          ) : (
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FolderOpen className="text-gray-400 w-12 h-12 mb-2" />
                <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
                <p className="text-gray-400 text-center">
                  Não encontramos documentos nesta categoria. Tente explorar outras categorias.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}