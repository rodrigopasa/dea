import { Link } from "wouter";
import { Pdf, Category } from "@shared/schema";
import { Eye, Bookmark, BookmarkCheck, FileText, Download, Calendar, User } from "lucide-react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import { useAuth } from "@/hooks/use-auth";
import { useToast } from "@/hooks/use-toast";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { Button } from "@/components/ui/button";

// PdfCard Props Interface

interface PdfCardProps {
  pdf: Pdf;
}

export default function PdfCard({ pdf }: PdfCardProps) {
  const [imageError, setImageError] = useState(false);
  const [imageLoaded, setImageLoaded] = useState(false);
  const [imgSrc, setImgSrc] = useState("");
  const [isFavorited, setIsFavorited] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  
  // Fetch category details
  const { data: category } = useQuery<Category>({
    queryKey: [`/api/categories/${pdf.categoryId}`],
    enabled: !!pdf.categoryId,
  });
  
  // Fetch user details
  const { data: pdfUploader } = useQuery<{ username: string, isAdmin: boolean }>({
    queryKey: [`/api/users/${pdf.userId}`],
    enabled: !!pdf.userId,
  });
  
  // Verificar se o PDF já está nos favoritos do usuário
  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/check/${pdf.id}`],
    enabled: !!user && !!pdf.id,
  });
  
  // Mutation para adicionar aos favoritos
  const addToFavorites = useMutation({
    mutationFn: async () => {
      return await apiRequest<any>('/api/favorites', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ pdfId: pdf.id })
      } as RequestInit);
    },
    onSuccess: () => {
      setIsFavorited(true);
      toast({
        title: "Adicionado aos favoritos",
        description: "PDF adicionado aos seus favoritos com sucesso",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/check/${pdf.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao adicionar aos favoritos: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Mutation para remover dos favoritos
  const removeFromFavorites = useMutation({
    mutationFn: async () => {
      return await apiRequest<any>(`/api/favorites/${pdf.id}`, {
        method: 'DELETE',
        headers: { 'Content-Type': 'application/json' }
      } as RequestInit);
    },
    onSuccess: () => {
      setIsFavorited(false);
      toast({
        title: "Removido dos favoritos",
        description: "PDF removido dos seus favoritos",
      });
      queryClient.invalidateQueries({ queryKey: ['/api/favorites'] });
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/check/${pdf.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao remover dos favoritos: ${error.message}`,
        variant: "destructive",
      });
    }
  });
  
  // Atualizar estado quando os dados forem recebidos
  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorited(favoriteStatus.isFavorite);
    }
  }, [favoriteStatus]);
  
  // Format date from ISO string
  const formatDate = (date: Date | null | undefined) => {
    if (!date) return 'Sem data';
    const d = new Date(date);
    return d.toLocaleDateString();
  };
  
  // Set image source with cache-busting parameter
  useEffect(() => {
    if (pdf.coverImage) {
      // Add a timestamp to avoid browser caching
      // Usamos uma forma consistente igual à página de detalhes para garantir compatibilidade
      const timestamp = Date.now();
      const imgPath = `/uploads/thumbnails/${pdf.coverImage}?t=${timestamp}`;
      setImgSrc(imgPath);
      console.log("Configurando URL da imagem:", imgPath);
      
      // Pré-carregamento da imagem para garantir que ela não desapareça
      const preloadImage = new Image();
      preloadImage.src = imgPath;
      preloadImage.onload = () => {
        console.log("Imagem pré-carregada com sucesso:", pdf.coverImage);
      };
    }
  }, [pdf.coverImage]);
  
  // Create a custom PDF icon component for fallback
  const PdfIcon = () => (
    <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-700 to-gray-800">
      <FileText className="w-14 h-14 text-primary mb-2" />
      <div className="text-center px-4">
        <h4 className="font-medium text-sm text-gray-300 line-clamp-1">{pdf.title}</h4>
        <p className="text-xs text-gray-400 mt-1">
          Documento PDF
        </p>
      </div>
    </div>
  );

  return (
    <div className="bg-dark-surface border border-dark-border rounded-lg overflow-hidden hover:border-primary transition h-[420px] flex flex-col">
      <Link href={`/pdf/${pdf.slug}`}>
        <div className="relative h-[220px] bg-dark-surface-2">
          {/* Renderiza o ícone de fallback se houver erro ou se não tiver imagem de capa */}
          {(imageError || !pdf.coverImage) ? (
            <PdfIcon />
          ) : (
            <>
              {/* Imagem invisível que será mostrada quando carregar */}
              <img 
                src={imgSrc}
                alt={`Capa de ${pdf.title}`} 
                className="w-full h-full object-contain block"
                loading="lazy"
                onError={(e) => {
                  console.error("Erro ao carregar capa:", pdf.coverImage);
                  console.error("URL da imagem:", imgSrc);
                  
                  // Tentar com URL direta, como na página de detalhes
                  const directUrl = `/uploads/thumbnails/${pdf.coverImage}?t=${Date.now()}`;
                  console.log("Tentando URL alternativa:", directUrl);
                  
                  // Se a URL já foi trocada uma vez, definir como erro
                  if (imgSrc.includes("?retry=true")) {
                    setImageError(true);
                  } else {
                    // Tentar novamente com uma URL diferente
                    setImgSrc(`${directUrl}&retry=true`);
                  }
                }}
                onLoad={() => {
                  console.log("Imagem carregada com sucesso:", pdf.coverImage);
                  setImageLoaded(true);
                }}
                style={{
                  display: 'block',
                  maxWidth: '100%',
                  width: '100%',
                  height: '100%',
                  objectFit: 'contain',
                  backgroundColor: 'rgb(26, 27, 30)'
                }}
              />
              
              {/* Loader/placeholder como background, não substitui a imagem */}
              <div className="absolute inset-0 flex items-center justify-center bg-dark-surface-2" 
                   style={{zIndex: imageLoaded ? -1 : 1}}>
                <div className="w-8 h-8 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
              </div>
            </>
          )}
          
          <div className="absolute top-2 right-2 bg-dark-bg bg-opacity-80 rounded-md px-2 py-1 text-xs flex items-center">
            <Eye className="mr-1 w-3 h-3" /> {(pdf.views || 0).toLocaleString()}
          </div>
          
          {pdf.pageCount && (
            <div className="absolute top-2 left-2 bg-dark-bg bg-opacity-80 rounded-md px-2 py-1 text-xs flex items-center">
              <FileText className="mr-1 w-3 h-3" /> {pdf.pageCount} {pdf.pageCount === 1 ? 'pág' : 'págs'}
            </div>
          )}
          
          {category && (
            <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-dark-bg to-transparent p-3">
              <span className="inline-block bg-primary text-white text-xs px-2 py-1 rounded">
                {category.name}
              </span>
            </div>
          )}
        </div>
      </Link>
      
      <div className="p-4 flex-1 flex flex-col">
        <Link href={`/pdf/${pdf.slug}`}>
          <h3 className="font-medium mb-2 line-clamp-2 hover:text-primary">{pdf.title}</h3>
        </Link>
        <p className="text-gray-400 text-sm mb-3 line-clamp-2">{pdf.description || 'Sem descrição disponível.'}</p>
        
        {/* Estatísticas */}
        <div className="flex flex-wrap gap-2 mb-3">
          <Badge variant="outline" className="flex items-center gap-1 text-xs bg-dark-surface-2">
            <Eye className="w-3 h-3" /> {(pdf.views || 0)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs bg-dark-surface-2">
            <Download className="w-3 h-3" /> {(pdf.downloads || 0)}
          </Badge>
          <Badge variant="outline" className="flex items-center gap-1 text-xs bg-dark-surface-2">
            <Calendar className="w-3 h-3" /> {pdf.createdAt ? formatDate(pdf.createdAt) : 'Sem data'}
          </Badge>
        </div>
        
        {/* Os botões de download e salvar foram removidos dos cards */}
        
        {/* Espaçador flexível para empurrar informações do usuário para baixo */}
        <div className="flex-grow"></div>
        
        {/* Informações do usuário */}
        <div className="flex justify-between items-center mt-auto">
          {pdfUploader ? (
            <Link href={`/usuario/${pdfUploader.username}`} className="flex items-center space-x-2 hover:text-primary transition-colors">
              <div className="w-6 h-6 rounded-full bg-primary flex items-center justify-center text-white text-xs">
                <User className="w-3 h-3" />
              </div>
              <span className="text-sm text-gray-400">{pdfUploader.username}</span>
            </Link>
          ) : (
            <div className="flex items-center space-x-2">
              <div className="w-6 h-6 rounded-full bg-dark-surface-2 flex items-center justify-center text-white text-xs">
                <User className="w-3 h-3" />
              </div>
              <span className="text-sm text-gray-400">Usuário</span>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
