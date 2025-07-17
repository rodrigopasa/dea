import { useQuery } from "@tanstack/react-query";
import { Link } from "wouter";
import { Category } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { 
  Book, 
  Briefcase, 
  Lightbulb, 
  PaintBucket, 
  Code,
  FolderTree 
} from "lucide-react";

export default function CategoriesPage() {
  // Fetch categories
  const { data: categories, isLoading: isCategoriesLoading } = useQuery<Category[]>({
    queryKey: ["/api/categories"],
  });
  
  // Icon mapping for categories
  const categoryIcons: Record<string, React.ReactNode> = {
    educacao: <Book className="w-8 h-8" />,
    negocios: <Briefcase className="w-8 h-8" />,
    ciencia: <Lightbulb className="w-8 h-8" />,
    arte: <PaintBucket className="w-8 h-8" />,
    tecnologia: <Code className="w-8 h-8" />,
  };
  
  // Colors for categories
  const categoryColors: Record<string, string> = {
    educacao: "bg-blue-900 bg-opacity-30 border-blue-600 text-blue-400",
    negocios: "bg-amber-900 bg-opacity-30 border-amber-600 text-amber-400",
    ciencia: "bg-green-900 bg-opacity-30 border-green-600 text-green-400",
    arte: "bg-purple-900 bg-opacity-30 border-purple-600 text-purple-400",
    tecnologia: "bg-cyan-900 bg-opacity-30 border-cyan-600 text-cyan-400",
  };
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Categorias</h1>
            <p className="text-gray-300">Explore documentos por área de interesse</p>
          </div>
          
          {isCategoriesLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : categories && categories.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {categories.map((category) => (
                <Link key={category.id} href={`/categoria/${category.slug}`}>
                  <Card className="bg-dark-surface border-dark-border hover:border-primary hover:shadow-lg transition-all cursor-pointer h-full">
                    <CardHeader className="pb-2">
                      <div className="w-12 h-12 rounded-full flex items-center justify-center mb-2 bg-opacity-20 bg-primary">
                        {categoryIcons[category.slug] || <FolderTree className="w-8 h-8" />}
                      </div>
                      <CardTitle>{category.name}</CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-gray-300">
                        Explore documentos na categoria {category.name}
                      </p>
                    </CardContent>
                    <CardFooter>
                      <Badge 
                        variant="outline" 
                        className={categoryColors[category.slug] || "bg-primary bg-opacity-20 text-primary border-primary"}
                      >
                        Ver documentos
                      </Badge>
                    </CardFooter>
                  </Card>
                </Link>
              ))}
            </div>
          ) : (
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <FolderTree className="text-gray-400 w-12 h-12 mb-2" />
                <h3 className="text-lg font-medium mb-2">Nenhuma categoria encontrada</h3>
                <p className="text-gray-400 text-center">
                  Não encontramos categorias disponíveis no momento.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}