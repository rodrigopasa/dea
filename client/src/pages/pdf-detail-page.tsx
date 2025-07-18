import { useEffect, useState } from "react";
import { useQuery, useMutation } from "@tanstack/react-query";
import { Link, useRoute, useLocation } from "wouter";
import { Pdf, Category, User } from "@shared/schema";
import { apiRequest, queryClient } from "@/lib/queryClient";
import { useToast } from "@/hooks/use-toast";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { 
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import PdfCard from "@/components/pdf/pdf-card";
import PdfViewer from "@/components/pdf/pdf-viewer-redesigned";
import UnifiedSeo from "@/components/seo/unified-seo";
import {
  Bookmark,
  BookmarkCheck,
  Calendar,
  Download,
  Eye,
  FileText,
  Flag,
  Home,
  Share2,
  ThumbsUp,
  ThumbsDown,
  User as UserIcon,
  UserPlus
} from "lucide-react";

export default function PdfDetailPage() {
  const [, navigate] = useLocation();
  const [match, params] = useRoute("/pdf/:slug");
  const { toast } = useToast();
  const { user } = useAuth();

  // Estado para controlar o modal de DMCA
  const [dmcaOpen, setDmcaOpen] = useState(false);
  // Estado para a avaliação (true = positivo, false = negativo, null = sem avaliação)
  const [userRating, setUserRating] = useState<boolean | null>(null);
  const [ratingChanged, setRatingChanged] = useState(false);

  // Evitando o uso de condições antes dos hooks
  const slug = match ? params?.slug : null;

  // Fetch PDF details usando custom queryFn para lidar com redirecionamentos
  const { data: pdf, isLoading: isPdfLoading, error } = useQuery<Pdf>({
    queryKey: [`/api/pdfs/slug/${slug}`],
    enabled: !!slug,
    queryFn: async ({ queryKey }) => {
      const response = await fetch(queryKey[0] as string);

      // Se o status for 301, é um redirecionamento
      if (response.status === 301) {
        const data = await response.json();
        if (data.redirectTo) {
          toast({
            title: "URL Atualizada",
            description: "Esta página foi movida para um novo endereço. Redirecionando...",
            variant: "default",
          });

          // Redirecionar para o novo slug após um curto atraso
          setTimeout(() => {
            navigate(`/pdf/${data.redirectTo}`);
          }, 1500);

          // Retorna um erro para evitar renderização com dados incorretos
          throw new Error("Redirecionando para o novo URL");
        }
      }

      if (!response.ok) {
        throw new Error("Falha ao buscar PDF");
      }

      return response.json();
    }
  });

  // Fetch category details if PDF is loaded
  const { data: category } = useQuery<Category>({
    queryKey: [`/api/categories/${pdf?.categoryId}`],
    enabled: !!pdf?.categoryId,
  });

  // Removi busca dos dados do uploader já que agora apenas admins podem postar

  // Fetch related PDFs if category is loaded
  const { data: relatedPdfs } = useQuery<Pdf[]>({
    queryKey: [`/api/categories/${pdf?.categoryId}/pdfs`],
    enabled: !!pdf?.categoryId,
  });

  // Buscar configurações de SEO
  const { data: seoSettings } = useQuery({
    queryKey: ['/api/seo'],
    enabled: !!pdf, // Só busca quando o PDF estiver carregado
  });

  // Busca o título formatado do PDF
  const { data: formattedTitle, isSuccess: isTitleFormatted } = useQuery({
    queryKey: ['/api/pdfs/formatted-title', pdf?.title],
    queryFn: async () => {
      const res = await fetch(`/api/pdfs/formatted-title?title=${encodeURIComponent(pdf!.title)}`);
      if (!res.ok) throw new Error('Failed to fetch formatted title');
      return res.text();
    },
    enabled: !!pdf?.title, // Só busca quando o título do PDF estiver disponível
  });

  // Fetch user's current rating for this PDF (works for public users via IP)
  const { data: userRatingData } = useQuery<{ rating: { isPositive: boolean } | null }>({
    queryKey: [`/api/pdfs/${pdf?.id}/user-rating`],
    enabled: !!pdf?.id && !ratingChanged,
  });

  // Efeito para atualizar o estado de avaliação do usuário quando os dados chegarem
  useEffect(() => {
    if (userRatingData && userRatingData.rating && !ratingChanged) {
      setUserRating(userRatingData.rating.isPositive);
    }
  }, [userRatingData, ratingChanged]);

  // Preparação de valores para meta tags e dados estruturados
  const pageTitle = pdf && (isTitleFormatted && formattedTitle 
    ? formattedTitle 
    : `${pdf.title} - PDFXANDRIA`);

  const description = pdf?.description || (pdf?.pageCount ? `PDF com ${pdf.pageCount} páginas` : 'Documento PDF');
  const canonicalUrl = pdf ? `${window.location.origin}/pdf/${pdf.slug}` : undefined;
  const imageUrl = pdf?.coverImage ? `${window.location.origin}/uploads/thumbnails/${pdf.coverImage}` : undefined;
  const keywords = pdf && category ? [`${pdf.title}`, `${category.name}`, 'PDF', 'livro digital', 'documento', 'leitura online'] : undefined;
  const author = seoSettings?.siteTitle || 'PDFxandria';
  const published = pdf?.createdAt ? new Date(pdf.createdAt).toISOString() : undefined;

  // Twitter handle das configurações de SEO
  const twitterHandle = seoSettings && typeof seoSettings === 'object' && 'twitterHandle' in seoSettings 
    ? String(seoSettings.twitterHandle) 
    : undefined;

  // Redirecionamento para 404 se a rota não corresponder
  useEffect(() => {
    if (!match) {
      navigate("/not-found");
    }
  }, [match, navigate]);

  // Mutation para enviar uma reclamação DMCA
  const dmcaMutation = useMutation({
    mutationFn: async (data: { pdfId: number, reason: string, contactEmail: string }) => {
      const res = await apiRequest("POST", "/api/dmca", data);
      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Reclamação enviada",
        description: "Sua reclamação DMCA foi enviada e será analisada.",
      });
      setDmcaOpen(false);
    },
    onError: (error: Error) => {
      toast({
        title: "Erro ao enviar",
        description: error.message || "Não foi possível enviar sua reclamação. Tente novamente.",
        variant: "destructive",
      });
    },
  });

  // Mutation para enviar uma avaliação
  const ratingMutation = useMutation({
    mutationFn: async (data: { pdfId: number, isPositive: boolean }) => {
      console.log("Enviando avaliação:", data);

      // Enviamos a avaliação usando fetch nativo para garantir o formato certo
      const res = await fetch(`/api/pdfs/${data.pdfId}/rate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify({ isPositive: data.isPositive })
      });

      if (!res.ok) {
        throw new Error(`Erro ao avaliar: ${res.status}`);
      }

      return await res.json();
    },
    onSuccess: () => {
      toast({
        title: "Avaliação enviada",
        description: "Obrigado pela sua avaliação!",
      });

      // Atualiza a query do PDF atual para refletir possíveis mudanças
      queryClient.invalidateQueries({ queryKey: [`/api/pdfs/slug/${slug}`] });
    },
    onError: (error: Error) => {
      console.error("Erro na avaliação:", error);
      toast({
        title: "Erro ao avaliar",
        description: "Não foi possível enviar sua avaliação. Tente novamente.",
        variant: "destructive",
      });
    },
  });







  // Handle PDF download - agora público, sem restrições
const handleDownload = async () => {
  if (!pdf) return;

  try {
    // Download direto sem verificações de autenticação
    const response = await fetch(`/api/pdfs/${pdf.id}/download`, {
      method: 'GET'
    });

    if (!response.ok) {
      throw new Error(`Erro ao baixar: ${response.status}`);
    }

    // Converte o conteúdo recebido em blob para download
    const blob = await response.blob();
    const url = window.URL.createObjectURL(blob);

    // Cria um link temporário para iniciar o download
    const link = document.createElement('a');
    link.href = url;
    link.download = `${pdf.title}.pdf`;
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);

    // Notifica o usuário que o download foi iniciado
    toast({
      title: "Download iniciado",
      description: "O download do seu PDF começou.",
    });

    // Atualiza o cache de informações
    queryClient.invalidateQueries({ queryKey: [`/api/pdfs/slug/${slug}`] });
  } catch (error) {
    console.error("Erro ao baixar PDF:", error);
    toast({
      title: "Erro ao baixar",
      description: "Não foi possível baixar o arquivo. Tente novamente.",
      variant: "destructive",
    });
  }
};
  // Fetch favorite status - agora público
  const { data: favoriteStatus } = useQuery<{ isFavorite: boolean }>({
    queryKey: [`/api/favorites/check/${pdf?.id}`],
    enabled: !!pdf?.id,
  });

  // Estado para favorito
  const [isFavorited, setIsFavorited] = useState(false);

  // Atualizar estado quando os dados forem recebidos
  useEffect(() => {
    if (favoriteStatus) {
      setIsFavorited(favoriteStatus.isFavorite);
    }
  }, [favoriteStatus]);

  // Mutation para adicionar aos favoritos
  const addToFavorites = useMutation({
    mutationFn: async () => {
      if (!pdf) return null;
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
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/check/${pdf?.id}`] });
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
      if (!pdf) return null;
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
      queryClient.invalidateQueries({ queryKey: [`/api/favorites/check/${pdf?.id}`] });
    },
    onError: (error) => {
      toast({
        title: "Erro",
        description: `Falha ao remover dos favoritos: ${error.message}`,
        variant: "destructive",
      });
    }
  });

  // Handle PDF bookmark - agora público
  const handleBookmark = () => {
    if (!pdf) return;

    if (isFavorited) {
      removeFromFavorites.mutate();
    } else {
      addToFavorites.mutate();
    }
  };

  // Handle PDF sharing
  const handleShare = () => {
    // Copy current URL to clipboard
    navigator.clipboard.writeText(window.location.href);

    toast({
      title: "Link copiado",
      description: "O link para este documento foi copiado para a área de transferência.",
    });
  };

  // Format date
  const formatDate = (dateString: Date | null) => {
    if (!dateString) return 'Data desconhecida';
    const date = new Date(dateString);
    return date.toLocaleDateString('pt-BR', { 
      year: 'numeric', 
      month: 'long', 
      day: 'numeric' 
    });
  };

  // Handler para enviar o formulário DMCA
  const handleDmcaSubmit = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const form = e.currentTarget;
    const formData = new FormData(form);

    if (!pdf) return;

    dmcaMutation.mutate({
      pdfId: pdf.id,
      reason: formData.get('reason') as string,
      contactEmail: formData.get('email') as string
    });
  };

  // Handler para avaliação - agora funciona para usuários públicos
  const handleRating = (isPositive: boolean) => {
    if (!pdf) return;

    // Marcar que o usuário alterou ativamente sua avaliação
    setRatingChanged(true);
    setUserRating(isPositive);

    ratingMutation.mutate({
      pdfId: pdf.id,
      isPositive: isPositive
    });
  };

  if (!match) {
    return null; // Já temos useEffect para redirecionar, então retornamos null
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Documento não encontrado</h1>
          <p className="text-gray-400 mb-6">O documento que você está procurando não existe ou foi removido.</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary-dark">Voltar para a página inicial</Button>
          </Link>
        </div>
      </div>
    );
  }

  if (isPdfLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <div className="animate-pulse">
            <div className="h-8 bg-dark-surface-2 rounded w-1/3 mx-auto mb-4"></div>
            <div className="h-64 bg-dark-surface-2 rounded mb-4"></div>
            <div className="h-4 bg-dark-surface-2 rounded w-2/3 mx-auto mb-2"></div>
            <div className="h-4 bg-dark-surface-2 rounded w-1/2 mx-auto"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!pdf) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="text-center">
          <h1 className="text-2xl font-bold mb-4">Erro ao carregar documento</h1>
          <p className="text-gray-400 mb-6">Não foi possível carregar o documento. Tente novamente.</p>
          <Link href="/">
            <Button className="bg-primary hover:bg-primary-dark">Voltar para a página inicial</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Filter out current PDF from related PDFs and limit to 4
  const filteredRelatedPdfs = relatedPdfs
    ?.filter(relatedPdf => relatedPdf.id !== pdf.id)
    ?.slice(0, 4) || [];

  return (
    <main role="main" className="w-full max-w-[1400px] mx-auto px-4 py-8 bg-background text-foreground">
      <article className="w-full" itemScope itemType="https://schema.org/Article">
        <h1 id="pdf-title" className="text-3xl font-bold mb-4" aria-labelledby="pdf-title" itemProp="headline">
          {pdf?.title}
        </h1>

        {/* Componente SEO Unificado */}
        {pdf && pageTitle && (
          <UnifiedSeo 
            pageTitle={pdf.title}
            pageDescription={description}
            canonicalUrl={canonicalUrl}
            imageUrl={imageUrl}
            type="article"
            keywords={keywords}
            published={published}
            modified={pdf.createdAt}
          />
        )}
        {/* DMCA Dialog */}
        <Dialog open={dmcaOpen} onOpenChange={setDmcaOpen}>
          <DialogContent className="bg-dark-surface border-dark-border">
            <DialogHeader>
              <DialogTitle>Reportar violação de direitos autorais (DMCA)</DialogTitle>
              <DialogDescription>
                Preencha o formulário abaixo para reportar uma possível violação de direitos autorais. Sua denúncia será analisada por nossa equipe.
              </DialogDescription>
            </DialogHeader>

            <form onSubmit={handleDmcaSubmit} className="space-y-4 mt-4">
              <div className="space-y-2">
                <label htmlFor="email" className="text-sm font-medium">Seu email de contato</label>
                <input
                  type="email"
                  id="email"
                  name="email"
                  required
                  className="w-full p-2 rounded bg-dark-surface-2 border border-dark-border"
                  placeholder="seu.email@exemplo.com"
                />
              </div>

              <div className="space-y-2">
                <label htmlFor="reason" className="text-sm font-medium">Motivo da denúncia</label>
                <textarea
                  id="reason"
                  name="reason"
                  required
                  rows={4}
                  className="w-full p-2 rounded bg-dark-surface-2 border border-dark-border"
                  placeholder="Descreva detalhadamente a razão da sua denúncia e como este documento viola seus direitos autorais."
                />
              </div>

              <div className="flex justify-end gap-2 mt-4">
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setDmcaOpen(false)}
                >
                  Cancelar
                </Button>
                <Button 
                  type="submit" 
                  className="bg-primary"
                  disabled={dmcaMutation.isPending}
                >
                  {dmcaMutation.isPending ? "Enviando..." : "Enviar denúncia"}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Breadcrumb */}
        <div className="mb-6">
          <nav aria-label="breadcrumb">
            <Breadcrumb className="mb-4">
              <BreadcrumbList>
                <BreadcrumbItem>
                  <Link href="/">
                    <span className="flex items-center text-primary hover:underline">
                      <Home className="w-4 h-4 mr-1" /> Início
                    </span>
                  </Link>
                </BreadcrumbItem>
                <BreadcrumbSeparator />
                {category && (
                  <>
                    <BreadcrumbItem>
                      <Link href={`/categoria/${category.slug}`}>
                        <span className="text-primary hover:underline">
                          {category.name}
                        </span>
                      </Link>
                    </BreadcrumbItem>
                    <BreadcrumbSeparator />
                  </>
                )}
                <BreadcrumbItem>
                  <span className="text-gray-400">
                    {pdf.title}
                  </span>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </nav>
        </div>

        <div className="bg-dark-surface rounded-xl p-6 mb-6">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            <aside className="lg:col-span-1">
              <div className="aspect-[2/3] rounded-lg overflow-hidden bg-dark-surface-2">
                {/* Se houver uma imagem de capa, tenta carregá-la com um cache-buster */}
                {pdf.coverImage ? (
                  <>
                    <img 
                      src={`/uploads/thumbnails/${pdf.coverImage}`}
                      loading="lazy"
                      decoding="async" 
                      alt={`Capa de ${pdf.title}`} 
                      className="w-full h-full object-contain bg-dark-surface-2" 
                      onError={(e) => {
                        // Tenta carregar novamente com cache buster apenas se falhar
                        const img = e.currentTarget as HTMLImageElement;
                        if (!img.dataset.retried) {
                          img.dataset.retried = 'true';
                          img.src = `/uploads/thumbnails/${pdf.coverImage}?t=${Date.now()}`;
                          return;
                        }
                        // Se ainda falhar, mostra fallback
                        img.style.display = 'none';
                        const parent = img.parentElement!;
                        const fallback = parent.querySelector('.fallback-icon');
                        if (fallback) fallback.classList.remove('hidden');
                      }}
                    />

                    {/* Fallback com estilo melhorado para PDFs */}
                    <div className="fallback-icon hidden w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                      <FileText className="w-24 h-24 text-primary mb-4" />
                      <div className="text-center px-6">
                        <h4 className="font-medium text-gray-700 dark:text-gray-300">{pdf.title}</h4>
                        <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                          PDF • {pdf.pageCount || '?'} {pdf.pageCount === 1 ? 'página' : 'páginas'}
                        </p>
                      </div>
                    </div>
                  </>
                ) : (
                  // Se não tiver imagem de capa, mostra o ícone de PDF diretamente
                  <div className="w-full h-full flex flex-col items-center justify-center bg-gradient-to-b from-gray-100 to-gray-200 dark:from-gray-700 dark:to-gray-800">
                    <FileText className="w-24 h-24 text-primary mb-4" />
                    <div className="text-center px-6">
                      <h4 className="font-medium text-gray-700 dark:text-gray-300">{pdf.title}</h4>
                      <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                        PDF • {pdf.pageCount || '?'} {pdf.pageCount === 1 ? 'página' : 'páginas'}
                      </p>
                    </div>
                  </div>
                )}
              </div>

              {/* Sistema de avaliação like/dislike com estatísticas */}
              <div className="mt-4 p-3 bg-dark-surface-2 rounded-lg">
                <div className="text-center mb-2">
                  <h3 className="font-semibold">Avalie este documento</h3>
                </div>
                <div className="flex justify-center gap-8">
                  <button 
                    onClick={() => handleRating(true)}
                    className={`flex flex-col items-center focus:outline-none transition-colors ${
                      userRating === true ? 'text-green-500' : 'text-gray-500 hover:text-green-400'
                    }`}
                  >
                    <ThumbsUp className="w-7 h-7" />
                    <span className="text-xs mt-1">Gostei</span>
                  </button>

                  <button 
                    onClick={() => handleRating(false)}
                    className={`flex flex-col items-center focus:outline-none transition-colors ${
                      userRating === false ? 'text-red-500' : 'text-gray-500 hover:text-red-400'
                    }`}
                  >
                    <ThumbsDown className="w-7 h-7" />
                    <span className="text-xs mt-1">Não gostei</span>
                  </button>
                </div>
                {userRating !== null && (
                  <div className="mt-3 flex justify-center">
                    <div className="bg-dark-surface-2 px-3 py-1 rounded-full text-xs font-medium border border-dark-border">
                      <span className="text-primary">Sua avaliação:</span> {userRating ? 'Positiva 👍' : 'Negativa 👎'}
                    </div>
                  </div>
                )}

                {/* Estatísticas de avaliações */}
                <div className="mt-4 pt-3 border-t border-dark-border">
                  <h4 className="text-sm font-medium text-center mb-2">Avaliações dos usuários</h4>

                  {pdf.totalRatings === 0 ? (
                    <div className="text-center text-gray-400 py-2">
                      <p className="text-xs">Ainda não há avaliações</p>
                      <p className="text-xs mt-1">Seja o primeiro a avaliar este documento</p>
                    </div>
                  ) : (
                    <>
                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-green-500 flex items-center">
                          <ThumbsUp className="w-4 h-4 mr-1" /> Positivas
                        </span>
                        <span className="text-xs">{pdf.likesCount || 0} ({pdf.positivePercentage || 0}%)</span>
                      </div>

                      <div className="h-2 w-full bg-gray-700 rounded-full mb-2">
                        <div 
                          className="h-full bg-green-500 rounded-full" 
                          style={{ width: `${pdf.positivePercentage || 0}%` }}
                        ></div>
                      </div>

                      <div className="flex justify-between items-center mb-1">
                        <span className="text-xs text-red-500 flex items-center">
                          <ThumbsDown className="w-4 h-4 mr-1" /> Negativas
                        </span>
                        <span className="text-xs">{pdf.dislikesCount || 0} ({pdf.negativePercentage || 0}%)</span>
                      </div>

                      <div className="h-2 w-full bg-gray-700 rounded-full mb-2">
                        <div 
                          className="h-full bg-red-500 rounded-full" 
                          style={{ width: `${pdf.negativePercentage || 0}%` }}
                        ></div>
                      </div>

                      <p className="text-xs text-gray-400 text-center mt-2">
                        Total: {pdf.totalRatings} {pdf.totalRatings === 1 ? 'avaliação' : 'avaliações'}
                      </p>
                    </>
                  )}
                </div>
              </div>

              {/* Ações em grupo: download, salvar, compartilhar */}
              <div className="mt-4 space-y-2">
                <Button 
                  variant="outline" 
                  className="bg-dark-surface-2 hover:bg-dark-surface w-full flex items-center justify-center"
                  onClick={handleDownload}
                >
                  <Download className="w-4 h-4 mr-2" /> 
                  Baixar PDF
                  <span className="ml-2 text-xs text-gray-400">
                    • {pdf.downloads || 0} downloads
                  </span>
                </Button>

                <Button 
                  variant="outline" 
                  className={`${isFavorited ? 'bg-primary/10 hover:bg-primary/20 text-primary' : 'bg-dark-surface-2 hover:bg-dark-surface'} w-full flex items-center justify-center transition-colors`}
                  onClick={handleBookmark}
                >
                  {isFavorited ? (
                    <>
                      <BookmarkCheck className="w-4 h-4 mr-2" /> Salvo em favoritos
                    </>
                  ) : (
                    <>
                      <Bookmark className="w-4 h-4 mr-2" /> Salvar para depois
                    </>
                  )}
                </Button>

                <Button 
                  variant="outline" 
                  className="bg-dark-surface-2 hover:bg-dark-surface w-full flex items-center justify-center"
                  onClick={handleShare}
                >
                  <Share2 className="w-4 h-4 mr-2" /> Compartilhar
                </Button>
              </div>
            </aside>

            <section className="lg:col-span-3">
              <div className="flex flex-wrap justify-between items-start mb-4">
                <div>
                  {category && (
                    <Badge className="mb-3" variant="outline">
                      {category.name}
                    </Badge>
                  )}
                  <h1 className="text-3xl font-bold mb-1">{pdf.title}</h1>
                </div>
              </div>

              {/* Descrição e metadados do documento */}
              <div className="mb-8 mt-8">
                <div className="flex flex-col lg:flex-row gap-6">
                  <div className="lg:w-2/3 order-2 lg:order-1">
                    <h2 className="text-xl font-semibold mb-3 flex items-center">
                      <FileText className="mr-2 h-5 w-5 text-primary" /> 
                      Descrição
                    </h2>
                    <div className="bg-dark-surface-2 p-4 rounded-lg border border-dark-border shadow-sm" itemProp="description">
                      {pdf.description ? (
                        <p className="text-gray-300 leading-relaxed">{pdf.description}</p>
                      ) : (
                        <p className="text-gray-400 italic">Nenhuma descrição disponível para este documento.</p>
                      )}
                    </div>
                  </div>

                  <div className="lg:w-1/3 order-1 lg:order-2">
                    <h2 className="text-xl font-semibold mb-3 flex items-center">
                      <Calendar className="mr-2 h-5 w-5 text-primary" /> 
                      Informações
                    </h2>
                    <div className="bg-dark-surface-2 p-4 rounded-lg border border-dark-border shadow-sm">
                      <div className="space-y-3">
                        <div className="flex items-center gap-2">
                          <div className="bg-dark-surface rounded-full p-1.5">
                            <Calendar className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Data de envio</p>
                            <p className="text-sm font-medium">{formatDate(pdf.createdAt)}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-dark-surface rounded-full p-1.5">
                            <Eye className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Visualizações</p>
                            <p className="text-sm font-medium">{pdf.views || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-dark-surface rounded-full p-1.5">
                            <Download className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Downloads</p>
                            <p className="text-sm font-medium">{pdf.downloads || 0}</p>
                          </div>
                        </div>
                        <div className="flex items-center gap-2">
                          <div className="bg-dark-surface rounded-full p-1.5">
                            <FileText className="w-4 h-4 text-primary" />
                          </div>
                          <div>
                            <p className="text-sm text-gray-400">Páginas</p>
                            <p className="text-sm font-medium">{pdf.pageCount || 'Desconhecido'}</p>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              {/* Visualizador de PDF com estilo melhorado */}
              <div className="mt-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center">
                  <FileText className="mr-2 h-5 w-5 text-primary" /> 
                  Visualizar documento
                </h2>
                <div className="border border-dark-border rounded-lg overflow-hidden shadow-lg">
                  <PdfViewer pdfFile={`/api/pdfs/${pdf.id}/file`} height={700} />
                </div>
              </div>
            </section>
          </div>
        </div>

        {/* Documentos relacionados */}
        {filteredRelatedPdfs.length > 0 && (
          <div className="mt-8">
            <h2 className="text-2xl font-bold mb-4">Documentos relacionados</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {filteredRelatedPdfs.map((relatedPdf) => (
                <PdfCard key={relatedPdf.id} pdf={relatedPdf} />
              ))}
            </div>
          </div>
        )}
      </article>
    </main>
  );
}
