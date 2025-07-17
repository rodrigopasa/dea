import { useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Pdf, Category } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import PdfCard from "@/components/pdf/pdf-card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { Search, Filter } from "lucide-react";

export default function ExplorePage() {
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState<number | null>(null);
  
  // Fetch all PDFs
  const { data: pdfs, isLoading: isPdfsLoading } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs"],
  });
  
  // Fetch categories for filtering
  const { data: categories } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Filter PDFs based on search term and selected category
  const filteredPdfs = pdfs?.filter((pdf) => {
    const matchesSearch = searchTerm === "" || 
      pdf.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (pdf.description && pdf.description.toLowerCase().includes(searchTerm.toLowerCase()));
    
    const matchesCategory = selectedCategory === null || pdf.categoryId === selectedCategory;
    
    return matchesSearch && matchesCategory && pdf.isPublic;
  });
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Explorar</h1>
            <p className="text-gray-300">Descubra novos documentos e materiais de estudo</p>
          </div>
          
          {/* Search and filters */}
          <div className="mb-6">
            <div className="flex flex-col md:flex-row gap-4">
              <div className="relative flex-1">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
                <Input
                  className="pl-10 bg-dark-surface border-dark-border"
                  placeholder="Pesquisar documentos..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                />
              </div>
              <div className="flex gap-2 overflow-x-auto pb-2">
                <Button
                  variant={selectedCategory === null ? "default" : "outline"}
                  size="sm"
                  onClick={() => setSelectedCategory(null)}
                >
                  Todos
                </Button>
                {categories?.map((category) => (
                  <Button
                    key={category.id}
                    variant={selectedCategory === category.id ? "default" : "outline"}
                    size="sm"
                    onClick={() => setSelectedCategory(category.id)}
                  >
                    {category.name}
                  </Button>
                ))}
              </div>
            </div>
          </div>
          
          {/* Content Tabs */}
          <Tabs defaultValue="todos" className="w-full">
            <TabsList className="mb-4 bg-dark-surface">
              <TabsTrigger value="todos">Todos</TabsTrigger>
              <TabsTrigger value="populares">Populares</TabsTrigger>
              <TabsTrigger value="recentes">Recentes</TabsTrigger>
            </TabsList>
            
            <TabsContent value="todos">
              {isPdfsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredPdfs && filteredPdfs.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPdfs.map((pdf) => (
                    <PdfCard key={pdf.id} pdf={pdf} />
                  ))}
                </div>
              ) : (
                <Card className="bg-dark-surface border-dark-border">
                  <CardContent className="flex flex-col items-center justify-center p-6">
                    <Search className="text-gray-400 w-12 h-12 mb-2" />
                    <h3 className="text-lg font-medium mb-2">Nenhum resultado encontrado</h3>
                    <p className="text-gray-400 text-center">
                      Tente ajustar seus filtros ou termos de pesquisa para encontrar o que procura.
                    </p>
                  </CardContent>
                </Card>
              )}
            </TabsContent>
            
            <TabsContent value="populares">
              {isPdfsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredPdfs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPdfs
                    .sort((a, b) => (b.views || 0) - (a.views || 0))
                    .slice(0, 6)
                    .map((pdf) => (
                      <PdfCard key={pdf.id} pdf={pdf} />
                    ))}
                </div>
              ) : null}
            </TabsContent>
            
            <TabsContent value="recentes">
              {isPdfsLoading ? (
                <div className="flex justify-center items-center h-64">
                  <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
                </div>
              ) : filteredPdfs ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {filteredPdfs
                    .sort((a, b) => {
                      if (!a.createdAt || !b.createdAt) return 0;
                      return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
                    })
                    .slice(0, 6)
                    .map((pdf) => (
                      <PdfCard key={pdf.id} pdf={pdf} />
                    ))}
                </div>
              ) : null}
            </TabsContent>
          </Tabs>
        </div>
      </main>
    </div>
  );
}