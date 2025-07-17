import { useQuery } from "@tanstack/react-query";
import { Pdf } from "@shared/schema";
import Sidebar from "@/components/layout/sidebar";
import PdfCard from "@/components/pdf/pdf-card";
import {
  Card,
  CardContent,
} from "@/components/ui/card";
import { Clock } from "lucide-react";

export default function RecentPage() {
  // Fetch recent PDFs
  const { data: recentPdfs, isLoading: isPdfsLoading } = useQuery<Pdf[]>({
    queryKey: ["/api/pdfs/recent"],
  });
  
  return (
    <div className="flex flex-1 overflow-hidden">
      {/* Sidebar - hidden on mobile */}
      <Sidebar className="hidden md:block" />
      
      {/* Main Content */}
      <main className="flex-1 overflow-y-auto p-4">
        <div className="container mx-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold mb-2">Adicionados Recentemente</h1>
            <p className="text-gray-300">Os documentos mais recentes em nossa plataforma</p>
          </div>
          
          {isPdfsLoading ? (
            <div className="flex justify-center items-center h-64">
              <div className="animate-spin rounded-full h-8 w-8 border-t-2 border-b-2 border-primary"></div>
            </div>
          ) : recentPdfs && recentPdfs.length > 0 ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {recentPdfs.map((pdf) => (
                <PdfCard key={pdf.id} pdf={pdf} />
              ))}
            </div>
          ) : (
            <Card className="bg-dark-surface border-dark-border">
              <CardContent className="flex flex-col items-center justify-center p-6">
                <Clock className="text-gray-400 w-12 h-12 mb-2" />
                <h3 className="text-lg font-medium mb-2">Nenhum documento encontrado</h3>
                <p className="text-gray-400 text-center">
                  Parece que ainda não temos documentos recentes para mostrar.
                </p>
              </CardContent>
            </Card>
          )}
        </div>
      </main>
    </div>
  );
}