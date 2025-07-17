import { useEffect, useState } from "react";
import { useRoute, Link } from "wouter";
import { useQuery } from "@tanstack/react-query";
import { Pdf } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import PdfCard from "@/components/pdf/pdf-card";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { FolderOpen, Tag } from "lucide-react";
import UnifiedSeo from "@/components/seo/unified-seo";

export default function TagPage() {
  const [, params] = useRoute("/tag/:tagSlug");
  const tagSlug = params?.tagSlug;
  const [tag, setTag] = useState<string>("");
  
  // Decodifica o slug da tag
  useEffect(() => {
    if (tagSlug) {
      // Converte slug para um formato mais legível
      const decodedTag = decodeURIComponent(tagSlug).replace(/-/g, ' ');
      setTag(decodedTag);
    }
  }, [tagSlug]);
  
  // Fetch PDFs com essa tag (simularemos buscando todos os PDFs)
  // Em um sistema real, isso seria uma busca filtrada por tag
  const { data: allPdfs, isLoading: isPdfsLoading } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs"],
  });
  
  // Simulação de filtro por tag - em um sistema real, isso viria do backend
  const pdfs = allPdfs?.filter(pdf => 
    pdf.title.toLowerCase().includes(tag.toLowerCase()) || 
    (pdf.description && pdf.description.toLowerCase().includes(tag.toLowerCase()))
  ) || [];
  
  if (!tagSlug) {
    return <div>Tag não encontrada</div>;
  }
  
  // SEO Title e Description para tags - com noIndex ativado
  const pageTitle = `PDFs com a tag "${tag}" - PDFxandria`;
  const pageDescription = `Lista de documentos PDF relacionados à tag "${tag}". Encontre e baixe PDFs sobre este tema.`;
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* SEO Unificado - Notar o noIndex=true */}
      <UnifiedSeo 
        pageTitle={tag}
        pageDescription={pageDescription}
        canonicalUrl={`${window.location.origin}/tag/${tagSlug}`}
        type="website"
        keywords={[tag, "PDFs", "download", "documentos"]}
        noIndex={true} // Impede indexação de páginas de tags
      />
      
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <div className="flex items-center gap-2 mb-2">
              <Link href="/tags" className="text-primary hover:underline">
                Tags
              </Link>
              <span className="text-gray-400">/</span>
              <div className="flex items-center">
                <Tag className="h-5 w-5 mr-1 text-primary" />
                <h1 className="text-2xl font-bold">{tag || "Carregando..."}</h1>
              </div>
            </div>
            <p className="text-gray-300">Documentos relacionados à tag "{tag || "tag"}"</p>
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
                <Tag className="text-gray-400 w-12 h-12 mb-2" />
                <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
                <p className="text-gray-400 text-center">
                  Não encontramos documentos com esta tag. Tente explorar outros termos ou categorias.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}