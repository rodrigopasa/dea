import { useState, useEffect, useRef } from "react";
import { 
  Loader2, 
  ZoomIn, 
  ZoomOut, 
  ArrowLeft, 
  ArrowRight, 
  Maximize, 
  Printer, 
  Download, 
  RotateCw,
  Search,
  Home,
  BookOpen,
  Scroll,
  UserPlus
} from "lucide-react";
import { Link } from "wouter";
import { useAuth } from "@/hooks/use-auth";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

// Configurar o worker para PDF.js
// Usar a versão específica do worker que corresponde à versão da API
GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfFile: string; // URL para o arquivo PDF
  height?: number; // Altura opcional em pixels
}

export default function PdfViewer({ pdfFile, height = 500 }: PdfViewerProps) {
  const { user } = useAuth();
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  // Modo scroll como padrão e único
  const [viewMode] = useState<'scroll' | 'single'>('scroll');
  const [showToolbar, setShowToolbar] = useState(true);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    // Load the PDF
    const loadPdf = async () => {
      try {
        setIsLoading(true);
        
        // Para garantir que a URL esteja correta, normalizamos o caminho
        const pdfUrl = pdfFile.startsWith('http') ? pdfFile : `${window.location.origin}${pdfFile}`;
        
        // Adicionamos um parâmetro de consulta para contar visualização apenas na carga inicial
        const pdfUrlWithViewCount = pdfUrl.includes('?') 
          ? `${pdfUrl}&countView=true` 
          : `${pdfUrl}?countView=true`;
        
        console.log("Carregando PDF de:", pdfUrlWithViewCount);
        
        // Uso de estratégia de carregamento progressivo para melhorar desempenho
        // 1. Primeiro define carga baixa para carregamento rápido das primeiras páginas
        const initialLoadingTask = pdfjsLib.getDocument({
          url: pdfUrlWithViewCount,
          withCredentials: true,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
          cMapPacked: true,
          disableRange: false,
          disableStream: false,
          disableAutoFetch: false,
          rangeChunkSize: 65536 // 64K por chunk - otimizado para carregamento inicial mais rápido
        });
        
        // Cria um timeout para mostrar um feedback para o usuário se o carregamento demorar muito
        const loadingTimeout = setTimeout(() => {
          // Apenas atualiza a mensagem se ainda estiver carregando
          if (isLoading) {
            console.log("O PDF está demorando para carregar. Continuando o carregamento em segundo plano...");
          }
        }, 3000);
        
        // 2. Aguarda o carregamento do documento com configurações otimizadas
        const pdfDocument = await initialLoadingTask.promise;
        clearTimeout(loadingTimeout);
        
        console.log(`PDF carregado com ${pdfDocument.numPages} páginas`);
        setPdfDoc(pdfDocument);
        setPageCount(pdfDocument.numPages);
        setIsLoading(false);
      } catch (error) {
        console.error("Error loading PDF:", error);
        setIsLoading(false);
      }
    };
    
    loadPdf();
    
    // Cleanup
    return () => {
      if (pdfDoc) {
        pdfDoc.destroy();
      }
    };
  }, [pdfFile]);
  
  useEffect(() => {
    // Render page whenever page number, scale, or rotation changes (single page mode)
    const renderPage = async () => {
      if (!pdfDoc || !canvasRef.current || viewMode === 'scroll') return;
      
      try {
        const page = await pdfDoc.getPage(pageNum);
        
        // Obtém o container para determinar a largura disponível
        const pdfContainer = document.getElementById('pdf-container');
        const containerWidth = pdfContainer ? pdfContainer.clientWidth - 20 : window.innerWidth - 40; // 20px para padding
        
        // Ajusta escala para mobile automaticamente se necessário
        let autoScale = scale;
        const viewport = page.getViewport({ scale: 1.0, rotation }); // viewport com escala 1
        
        // Detecta se é um dispositivo móvel (largura menor que 768px)
        const isMobile = window.innerWidth < 768;
        
        // Se o documento for maior que o container, ajusta a escala para caber
        if (viewport.width > containerWidth) {
          // Em dispositivos móveis, reduzimos um pouco mais para garantir melhor visualização
          const mobileAdjustment = isMobile ? 0.9 : 1.0;
          autoScale = (containerWidth / viewport.width) * scale * mobileAdjustment;
        }
        
        // Em dispositivos móveis, limita o zoom máximo para evitar problemas de usabilidade
        if (isMobile && autoScale > 1.5) {
          autoScale = 1.5;
        }
        
        // Cria viewport final com a escala adequada
        const finalViewport = page.getViewport({ scale: autoScale, rotation });
        
        const canvas = canvasRef.current;
        const context = canvas.getContext("2d");
        
        canvas.height = finalViewport.height;
        canvas.width = finalViewport.width;
        
        const renderContext = {
          canvasContext: context!,
          viewport: finalViewport
        };
        
        await page.render(renderContext).promise;
      } catch (error) {
        console.error("Error rendering page:", error);
      }
    };
    
    if (pdfDoc && viewMode === 'single') {
      renderPage();
    }

    // Update page input value whenever page number changes
    setPageInputValue(pageNum.toString());
    
    // Adiciona um listener para redimensionamento de janela para ajustar em tempo real
    const handleResize = () => {
      if (pdfDoc && viewMode === 'single') {
        renderPage();
      }
    };
    
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, [pdfDoc, pageNum, scale, rotation, viewMode]);
  
  // Renderiza páginas sob demanda com lazy loading quando está no modo de rolagem vertical
  useEffect(() => {
    if (!pdfDoc || viewMode !== 'scroll' || !containerRef.current) return;

    // Mapa para controlar páginas renderizadas e promessas de renderização em andamento
    const renderedPages = new Map<number, HTMLDivElement>();
    const pagePromises = new Map<number, Promise<HTMLDivElement | null>>();
    
    // Número de páginas a serem mantidas em buffer (antes e depois das visíveis)
    const visiblePagesBuffer = 2;
    
    // Preparar placeholders para todas as páginas para preservar layout e permitir scroll
    const preparePagePlaceholders = () => {
      const container = containerRef.current;
      if (!container) return;
      
      // Limpa o container antes de criar placeholders
      container.innerHTML = '';
      
      // Cria placeholders para cada página para preservar o layout do scroll
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pageWrapper = document.createElement('div');
        pageWrapper.id = `page-${i}`;
        pageWrapper.className = 'pdf-page-wrapper flex flex-col items-center w-full';
        pageWrapper.setAttribute('data-nosnippet', ''); // Previne snippets do Google
        
        // Placeholder cinza com indicador de carregamento para páginas não carregadas
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'bg-gray-800/30 rounded-lg border border-gray-700/50 shadow-lg mb-4';
        placeholderDiv.style.height = '400px';
        placeholderDiv.style.width = '100%';
        placeholderDiv.innerHTML = `
          <div class="flex items-center justify-center h-full">
            <div class="text-center">
              <div class="text-sm text-gray-400">Página ${i}</div>
              <div class="mt-2">
                <div class="inline-block w-6 h-6 border-2 border-t-primary border-primary/30 rounded-full animate-spin"></div>
              </div>
            </div>
          </div>
        `;
        
        // Adiciona o número da página
        const pageNumberDiv = document.createElement('div');
        pageNumberDiv.className = 'text-center text-sm bg-gray-800/80 text-gray-300 py-1 px-3 rounded-full shadow-md mb-8 backdrop-blur-sm border border-gray-700/50';
        pageNumberDiv.textContent = `Página ${i} de ${pdfDoc.numPages}`;
        
        // Adiciona os elementos ao container
        pageWrapper.appendChild(placeholderDiv);
        pageWrapper.appendChild(pageNumberDiv);
        container.appendChild(pageWrapper);
      }
      
      // Adiciona botão "Voltar ao topo" fixo
      const backToTopButton = document.createElement('button');
      backToTopButton.id = 'pdf-back-to-top';
      backToTopButton.className = 'fixed bottom-6 right-6 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/80 transition-opacity duration-300 opacity-0';
      backToTopButton.innerHTML = '<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polyline points="18 15 12 9 6 15"></polyline></svg>';
      backToTopButton.addEventListener('click', () => {
        container.scrollTo({ top: 0, behavior: 'smooth' });
      });
      
      // Apenas mostra o botão quando a rolagem estiver abaixo de 100px
      container.addEventListener('scroll', () => {
        if (container.scrollTop > 300) {
          backToTopButton.style.opacity = '1';
        } else {
          backToTopButton.style.opacity = '0';
        }
      });
      
      document.body.appendChild(backToTopButton);
    };
    
    // Função para renderizar uma página específica
    const renderPage = async (pageNumber: number): Promise<HTMLDivElement | null> => {
      try {
        // Verifica se já existe uma promessa para esta página
        if (pagePromises.has(pageNumber)) {
          return pagePromises.get(pageNumber) as Promise<HTMLDivElement | null>;
        }
        
        // Cria uma nova promessa para renderizar a página
        const pagePromise = (async () => {
          const page = await pdfDoc.getPage(pageNumber);
          const container = containerRef.current;
          if (!container) return null;
          
          // Obtém o wrapper da página
          const pageWrapper = document.getElementById(`page-${pageNumber}`);
          if (!pageWrapper) return null;
          
          // Limpa o conteúdo do wrapper
          pageWrapper.innerHTML = '';
          
          // Obtém a largura disponível para renderização
          const containerWidth = container.clientWidth - 20;
          
          // Ajusta escala para se adequar ao container
          let autoScale = scale;
          const viewport = page.getViewport({ scale: 1.0, rotation });
          
          if (viewport.width > containerWidth) {
            autoScale = (containerWidth / viewport.width) * scale;
          }
          
          const finalViewport = page.getViewport({ scale: autoScale, rotation });
          
          // Cria um canvas para renderizar a página
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d', { alpha: false }); // alpha: false para melhor performance
          
          if (!context) return null;
          
          canvas.height = finalViewport.height;
          canvas.width = finalViewport.width;
          canvas.className = 'shadow-2xl mb-5 max-w-full mx-auto rounded-md';
          
          // Adiciona o canvas ao wrapper
          pageWrapper.appendChild(canvas);
          
          // Renderiza a página no canvas com tratamento de erro mais robusto
          try {
            const renderTask = page.render({
              canvasContext: context,
              viewport: finalViewport
            });
            
            await renderTask.promise;
          } catch (renderError) {
            console.warn(`Falha ao renderizar página ${pageNumber}, tentando novamente com configurações simplificadas:`, renderError);
            
            // Tenta uma segunda vez com uma abordagem mais simples
            try {
              context.clearRect(0, 0, canvas.width, canvas.height);
              context.fillStyle = '#f0f0f0';
              context.fillRect(0, 0, canvas.width, canvas.height);
              context.font = '14px Arial';
              context.fillStyle = '#666';
              context.textAlign = 'center';
              context.fillText(`Página ${pageNumber}`, canvas.width / 2, canvas.height / 2);
            } catch (fallbackError) {
              console.error('Falha também na renderização de fallback:', fallbackError);
            }
          }
          
          // Adiciona o número da página após o canvas
          const pageNumberDiv = document.createElement('div');
          pageNumberDiv.className = 'text-center text-sm bg-gray-800/80 text-gray-300 py-1 px-3 rounded-full shadow-md mb-8 backdrop-blur-sm border border-gray-700/50';
          pageNumberDiv.textContent = `Página ${pageNumber} de ${pdfDoc.numPages}`;
          pageWrapper.appendChild(pageNumberDiv);
          
          return pageWrapper as HTMLDivElement;
        })();
        
        // Armazena a promessa no mapa
        pagePromises.set(pageNumber, pagePromise);
        
        // Aguarda a conclusão e registra o resultado
        const result = await pagePromise;
        if (result) {
          renderedPages.set(pageNumber, result);
        }
        
        return result;
      } catch (error) {
        console.error(`Erro ao renderizar página ${pageNumber}:`, error);
        return null;
      }
    };
    
    // Função para liberar páginas que não estão mais visíveis
    const releaseInvisiblePages = (visibleRange: { start: number, end: number }) => {
      const bufferStart = Math.max(1, visibleRange.start - visiblePagesBuffer);
      const bufferEnd = Math.min(pdfDoc.numPages, visibleRange.end + visiblePagesBuffer);
      
      // Identifica páginas a serem liberadas (fora da área visível + buffer)
      renderedPages.forEach((wrapper, pageNum) => {
        if (pageNum < bufferStart || pageNum > bufferEnd) {
          // Substitui a página renderizada com um placeholder
          const container = containerRef.current;
          if (!container) return;
          
          const pageWrapper = document.getElementById(`page-${pageNum}`);
          if (pageWrapper) {
            const placeholderDiv = document.createElement('div');
            placeholderDiv.className = 'bg-gray-800/30 rounded-lg border border-gray-700/50 shadow-lg mb-4';
            placeholderDiv.style.height = '400px';
            placeholderDiv.style.width = '100%';
            placeholderDiv.innerHTML = `
              <div class="flex items-center justify-center h-full">
                <div class="text-center">
                  <div class="text-sm text-gray-400">Página ${pageNum}</div>
                </div>
              </div>
            `;
            
            // Limpa a página atual
            pageWrapper.innerHTML = '';
            
            // Adiciona o placeholder
            pageWrapper.appendChild(placeholderDiv);
            
            // Adiciona o número da página
            const pageNumberDiv = document.createElement('div');
            pageNumberDiv.className = 'text-center text-sm bg-gray-800/80 text-gray-300 py-1 px-3 rounded-full shadow-md mb-8 backdrop-blur-sm border border-gray-700/50';
            pageNumberDiv.textContent = `Página ${pageNum} de ${pdfDoc.numPages}`;
            pageWrapper.appendChild(pageNumberDiv);
            
            // Remove do mapa de páginas renderizadas
            renderedPages.delete(pageNum);
            pagePromises.delete(pageNum);
          }
        }
      });
    };
    
    // Função para determinar quais páginas estão visíveis no container
    const getVisiblePages = (): { start: number, end: number } => {
      const container = containerRef.current;
      if (!container) return { start: 1, end: Math.min(5, pdfDoc.numPages) };
      
      const scrollTop = container.scrollTop;
      const containerHeight = container.clientHeight;
      
      // Por padrão, começamos analisando as primeiras páginas
      let start = 1;
      let end = Math.min(3, pdfDoc.numPages);
      
      // Encontra as páginas visíveis com base na posição de rolagem
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pageWrapper = document.getElementById(`page-${i}`);
        if (!pageWrapper) continue;
        
        const rect = pageWrapper.getBoundingClientRect();
        const containerRect = container.getBoundingClientRect();
        
        // Verifica se a página está visível
        const isVisible = (
          rect.top < containerRect.bottom + 200 && // Um pouco abaixo da área visível
          rect.bottom > containerRect.top - 200    // Um pouco acima da área visível
        );
        
        if (isVisible) {
          start = Math.min(start, i);
          end = Math.max(end, i);
        }
      }
      
      return { start, end };
    };
    
    // Variáveis para throttling do scroll (evita múltiplas renderizações em sequência)
    let scrollTimeout: number | null = null;
    let isScrolling = false;
    
    // Callback para o evento de rolagem com throttling - carrega as páginas visíveis
    const handleScroll = () => {
      if (!containerRef.current) return;
      
      // Se já estamos processando um scroll, apenas agendamos outro para depois
      if (isScrolling) {
        // Cancela qualquer timeout anterior
        if (scrollTimeout !== null) {
          window.clearTimeout(scrollTimeout);
        }
        
        // Agenda nova verificação após 100ms
        scrollTimeout = window.setTimeout(() => {
          scrollTimeout = null;
          handleScrollThrottled();
        }, 100);
        return;
      }
      
      // Inicia o processamento do scroll
      isScrolling = true;
      
      // Usando requestAnimationFrame para sincronizar com o ciclo de renderização do navegador
      requestAnimationFrame(() => {
        handleScrollThrottled();
      });
    };
    
    // Versão otimizada do handler de scroll
    const handleScrollThrottled = () => {
      try {
        // Determina quais páginas estão visíveis
        const visibleRange = getVisiblePages();
        
        // Define a janela de carregamento (páginas visíveis + buffer)
        const loadStart = Math.max(1, visibleRange.start - visiblePagesBuffer);
        const loadEnd = Math.min(pdfDoc.numPages, visibleRange.end + visiblePagesBuffer);
        
        // Carrega primeiro as páginas visíveis (prioridade alta)
        for (let i = visibleRange.start; i <= visibleRange.end; i++) {
          if (!renderedPages.has(i) && !pagePromises.has(i)) {
            renderPage(i);
          }
        }
        
        // Depois, carrega o buffer (prioridade mais baixa)
        for (let i = loadStart; i < visibleRange.start; i++) {
          if (!renderedPages.has(i) && !pagePromises.has(i)) {
            setTimeout(() => renderPage(i), 50);
          }
        }
        
        for (let i = visibleRange.end + 1; i <= loadEnd; i++) {
          if (!renderedPages.has(i) && !pagePromises.has(i)) {
            setTimeout(() => renderPage(i), 50);
          }
        }
        
        // Libera memória para páginas que estão muito longe da área visível
        releaseInvisiblePages(visibleRange);
        
        // Finaliza o processamento do scroll
        isScrolling = false;
      } catch (error) {
        console.error("Erro ao processar scroll:", error);
        isScrolling = false;
      }
    };
    
    // Inicializa a renderização
    const initRender = async () => {
      setIsLoading(true);
      
      // Configura a estrutura do documento
      preparePagePlaceholders();
      
      // Carrega as primeiras páginas (visíveis inicialmente)
      setTimeout(() => {
        handleScrollThrottled();
        setIsLoading(false);
      }, 100);
    };
    
    // Inicializa a renderização
    initRender();
    
    // Adiciona o listener de rolagem
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    // Listener para redimensionamento
    const handleResize = () => {
      // Ao redimensionar, limpamos o cache de páginas e reconstruímos
      renderedPages.clear();
      pagePromises.clear();
      preparePagePlaceholders();
      
      // Recarregamos as páginas visíveis
      setTimeout(() => {
        handleScrollThrottled();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Limpeza ao desmontar
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      
      // Remove o botão "Voltar ao topo" se existir
      const backToTopButton = document.getElementById('pdf-back-to-top');
      if (backToTopButton && document.body.contains(backToTopButton)) {
        document.body.removeChild(backToTopButton);
      }
    };
  }, [pdfDoc, scale, rotation, viewMode]);
  
  const prevPage = () => {
    if (pageNum > 1) {
      setPageNum(pageNum - 1);
    }
  };
  
  const nextPage = () => {
    if (pageNum < pageCount) {
      setPageNum(pageNum + 1);
    }
  };
  
  const zoomIn = () => {
    setScale(prevScale => Math.min(prevScale + 0.1, 2.0));
  };
  
  const zoomOut = () => {
    setScale(prevScale => Math.max(prevScale - 0.1, 0.5));
  };
  
  const enterFullscreen = () => {
    const pdfContainer = document.getElementById('pdf-container');
    if (pdfContainer) {
      if (pdfContainer.requestFullscreen) {
        pdfContainer.requestFullscreen();
      }
    }
  };
  
  const rotateClockwise = () => {
    setRotation((prevRotation) => (prevRotation + 90) % 360);
  };
  
  const handleDownload = () => {
    // Download público - sem verificação de autenticação
    const downloadUrl = pdfFile.replace('/file', '/download');
    window.open(downloadUrl, '_blank');
  };
  
  const handlePrint = () => {
    // Para impressão, vamos usar a mesma URL do PDF mas em uma janela separada
    const pdfUrl = pdfFile.startsWith('http') ? pdfFile : `${window.location.origin}${pdfFile}`;
    const printWindow = window.open(pdfUrl, '_blank', 'width=800,height=600');
    if (printWindow) {
      setTimeout(() => {
        printWindow.print();
      }, 1000);
    }
  };
  
  const handlePageInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setPageInputValue(e.target.value);
  };
  
  const handlePageInputKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter') {
      const pageNo = parseInt(pageInputValue);
      if (!isNaN(pageNo) && pageNo >= 1 && pageNo <= pageCount) {
        setPageNum(pageNo);
      } else {
        setPageInputValue(pageNum.toString());
      }
    }
  };
  
  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchQuery(e.target.value);
  };
  
  const toggleSearch = () => {
    setIsSearchVisible(!isSearchVisible);
  };
  
  const goToFirstPage = () => {
    setPageNum(1);
  };
  
  // Classe comum para todos os botões de ação
  const actionButtonClass = "hover:bg-gray-700/80 text-white rounded-full p-1 backdrop-blur-sm transition-all duration-200 hover:shadow-md";
  
  return (
    <div className="mb-6 relative">
      <div className="bg-gradient-to-b from-dark-surface to-dark-surface/90 rounded-xl p-2 sm:p-4 md:p-6 shadow-2xl border border-dark-border/40">
        {/* Barra de título e botão de mostrar/ocultar barra de ferramentas */}
        <div className="flex justify-between items-center mb-3 sm:mb-5 px-2 sm:px-0">
          <div className="flex items-center">
            <BookOpen className="w-6 h-6 mr-2 text-primary" />
            <h2 className="text-lg sm:text-xl font-semibold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent">Leitor de PDF</h2>
          </div>
          <div className="flex gap-2">
            <Button 
              variant="outline" 
              size="sm" 
              onClick={() => setShowToolbar(!showToolbar)}
              className="text-xs bg-dark-surface/70 border-dark-border/60 hover:bg-dark-surface transition-all duration-200"
            >
              {showToolbar ? "Ocultar ferramentas" : "Mostrar ferramentas"}
            </Button>
          </div>
        </div>
        
        <div className="mb-2 sm:mb-4 relative">
          {/* Barra de ferramentas estilo Scribd - visível apenas quando showToolbar for true */}
          {showToolbar && (
            <div className="sticky top-0 z-10 w-full bg-dark-surface shadow-lg">
              <TooltipProvider>
                <div className="flex flex-col bg-gradient-to-b from-gray-800 to-gray-900 rounded-t-lg border border-gray-700/50 shadow-md overflow-x-auto overflow-y-hidden backdrop-blur-sm">
                  {/* Controles principais na barra superior */}
                  <div className="flex flex-wrap items-center justify-between p-2 sm:p-3 gap-2 bg-gradient-to-r from-transparent via-gray-800/30 to-transparent border-b border-gray-700/30">
                    {/* Controle de páginas e navegação */}
                    <div className="flex items-center justify-center space-x-1">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button
                            variant="ghost" 
                            size="sm"
                            onClick={goToFirstPage}
                            disabled={pageNum <= 1 || viewMode === 'scroll'}
                            className={actionButtonClass}
                          >
                            <Home className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Primeira página</p>
                        </TooltipContent>
                      </Tooltip>
                      
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={prevPage}
                            disabled={pageNum <= 1 || viewMode === 'scroll'}
                            className={actionButtonClass}
                          >
                            <ArrowLeft className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Página anterior</p>
                        </TooltipContent>
                      </Tooltip>

                      <div className="flex items-center bg-gray-700/90 rounded-lg px-2 py-1 border border-gray-600/30 shadow-inner">
                        <Input
                          type="text"
                          value={viewMode === 'scroll' ? `${pageCount}` : pageInputValue}
                          onChange={handlePageInputChange}
                          onKeyDown={handlePageInputKeyDown}
                          disabled={viewMode === 'scroll'}
                          className="w-10 sm:w-12 h-7 text-xs sm:text-sm text-center bg-transparent border-none text-white font-medium"
                        />
                        <span className="mx-1 text-xs text-gray-300 whitespace-nowrap font-medium">/ {pageCount}</span>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={nextPage}
                            disabled={pageNum >= pageCount || viewMode === 'scroll'}
                            className={actionButtonClass}
                          >
                            <ArrowRight className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Próxima página</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                    
                    {/* Ferramentas do lado direito */}
                    <div className="flex items-center space-x-2">
                      {/* Botão de alternância de modo removido - apenas modo vertical disponível */}

                      <div className="flex items-center space-x-1 bg-gray-700/90 rounded-lg px-2 py-1 border border-gray-600/30 shadow-inner">
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={zoomOut}
                          className="hover:bg-gray-600/80 text-white p-1 h-6 w-6 rounded-full backdrop-blur-sm transition-all duration-200"
                        >
                          <ZoomOut className="w-3 h-3" />
                        </Button>
                        
                        <span className="text-xs text-gray-300 w-12 text-center font-medium">
                          {Math.round(scale * 100)}%
                        </span>
                        
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={zoomIn}
                          className="hover:bg-gray-600/80 text-white p-1 h-6 w-6 rounded-full backdrop-blur-sm transition-all duration-200"
                        >
                          <ZoomIn className="w-3 h-3" />
                        </Button>
                      </div>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={rotateClockwise}
                            className={actionButtonClass}
                          >
                            <RotateCw className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Girar</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={handleDownload}
                            className={actionButtonClass}
                          >
                            <Download className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Baixar PDF</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={toggleSearch}
                            className={actionButtonClass}
                          >
                            <Search className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Buscar</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Button 
                            variant="ghost" 
                            size="sm"
                            onClick={enterFullscreen}
                            className={actionButtonClass}
                          >
                            <Maximize className="w-4 h-4" />
                          </Button>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Tela cheia</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>
                  
                  {/* Barra de busca - aparece apenas quando o usuário clica no botão de busca */}
                  {isSearchVisible && (
                    <div className="p-2 border-t border-gray-700">
                      <div className="flex items-center">
                        <Input
                          type="text"
                          value={searchQuery}
                          onChange={handleSearchChange}
                          placeholder="Buscar no documento..."
                          className="w-full h-8 text-sm bg-gray-700/90 text-white border-none rounded-md focus:ring-1 focus:ring-primary/50 transition-all duration-200"
                        />
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={toggleSearch}
                          className="ml-2 hover:bg-gray-700/80 text-white rounded-md backdrop-blur-sm transition-all duration-200"
                        >
                          Cancelar
                        </Button>
                      </div>
                    </div>
                  )}
                </div>
              </TooltipProvider>
            </div>
          )}
        </div>
        
        {/* PDF Renderer com estilo Scribd aprimorado e responsivo */}
        <div 
          id="pdf-container" 
          className="relative bg-gradient-to-b from-gray-800 to-gray-900 rounded-lg border border-gray-700/70 shadow-xl overflow-hidden touch-auto" 
          style={{ 
            height: `${height}px`, 
            overflowY: 'auto',
            WebkitOverflowScrolling: 'touch',
            backgroundImage: 'radial-gradient(circle at 15% 50%, rgba(20, 20, 30, 0.3) 0%, transparent 25%), radial-gradient(circle at 85% 30%, rgba(30, 30, 60, 0.3) 0%, transparent 30%)'
          }}
        >
          {isLoading ? (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-gray-900/50 backdrop-blur-sm rounded-lg">
              <div className="relative w-16 h-16 mb-3">
                <div className="absolute inset-0 rounded-full border-t-2 border-primary animate-spin"></div>
                <div className="absolute inset-0 rounded-full border-r-2 border-primary/30 animate-pulse"></div>
                <div className="absolute inset-1 rounded-full bg-gray-900/80 flex items-center justify-center">
                  <BookOpen className="h-6 w-6 text-primary animate-pulse" />
                </div>
              </div>
              <span className="text-lg font-medium text-white drop-shadow-lg">Carregando documento...</span>
              <span className="text-xs text-gray-300 mt-1">Por favor, aguarde</span>
            </div>
          ) : (
            <>
              {viewMode === 'single' ? (
                <div className="flex flex-col items-center justify-center min-h-full p-4 gap-3">
                  <canvas ref={canvasRef} className="shadow-2xl" />
                </div>
              ) : (
                <div 
                  ref={containerRef} 
                  className="p-4 overflow-auto flex flex-col items-center touch-auto" 
                  style={{ 
                    height: `${height}px`,
                    WebkitOverflowScrolling: 'touch'
                  }} 
                />
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
}
