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
  Scroll
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Toggle } from "@/components/ui/toggle";
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from "@/components/ui/tooltip";
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

// Configurar o worker para PDF.js
GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/3.4.120/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfFile: string; // URL para o arquivo PDF
  height?: number; // Altura opcional em pixels
}

export default function PdfViewer({ pdfFile, height = 500 }: PdfViewerProps) {
  const [pdfDoc, setPdfDoc] = useState<pdfjsLib.PDFDocumentProxy | null>(null);
  const [pageNum, setPageNum] = useState(1);
  const [pageCount, setPageCount] = useState(0);
  const [scale, setScale] = useState(1.0);
  const [isLoading, setIsLoading] = useState(true);
  const [rotation, setRotation] = useState(0);
  const [pageInputValue, setPageInputValue] = useState("1");
  const [searchQuery, setSearchQuery] = useState("");
  const [isSearchVisible, setIsSearchVisible] = useState(false);
  const [viewMode, setViewMode] = useState<'scroll' | 'single'>('scroll'); // Alterado para scroll como padrão
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
        
        // Verifica primeiro se o usuário está autenticado para carregar o PDF
        try {
          const checkResponse = await fetch(pdfUrlWithViewCount, { 
            method: 'HEAD',
            credentials: 'include' 
          });
          
          // Removendo verificação de status 401 pois usuários não logados devem poder visualizar o PDF
          // Aqui apenas verificamos outros erros de status que não sejam relacionados à autenticação
          if (checkResponse.status >= 400 && checkResponse.status !== 401) {
            console.error(`Erro ao acessar PDF: ${checkResponse.status}`);
            setIsLoading(false);
            return;
          }
        } catch (checkError) {
          console.error("Erro ao verificar autenticação:", checkError);
        }
        
        // Uso de estratégia de carregamento progressivo para melhorar desempenho
        // 1. Primeiro define carga baixa para carregamento rápido das primeiras páginas
        const initialLoadingTask = pdfjsLib.getDocument({
          url: pdfUrlWithViewCount,
          withCredentials: true,
          cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.4.120/cmaps/',
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
        
        // Removemos a verificação de status 401 para permitir visualização por usuários não logados
        // Apenas logamos o erro e continuamos
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
        
        // Se o documento for maior que o container, ajusta a escala para caber
        if (viewport.width > containerWidth) {
          autoScale = (containerWidth / viewport.width) * scale;
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
  
  // Renderiza páginas progressivamente no modo de rolagem vertical
  useEffect(() => {
    if (!pdfDoc || viewMode !== 'scroll' || !containerRef.current) return;
    
    // Configuração do sistema de renderização progressiva
    const visiblePagesBuffer = 2; // Número de páginas extras a carregar acima/abaixo da área visível
    const renderedPages = new Map(); // Mapa de páginas já renderizadas: número da página -> wrapper
    const pagePromises = new Map(); // Mapa de promessas de carregamento: número da página -> Promise
    
    // Função para preparar todos os placeholders de páginas 
    const preparePagePlaceholders = () => {
      setIsLoading(true);
      
      // Limpa o container antes de renderizar
      const container = containerRef.current;
      if (!container) return;
      
      container.innerHTML = '';
      
      // Cria placeholders para todas as páginas
      for (let i = 1; i <= pdfDoc.numPages; i++) {
        const pageWrapper = document.createElement('div');
        pageWrapper.className = 'pdf-page-wrapper';
        pageWrapper.setAttribute('data-nosnippet', '');
        pageWrapper.setAttribute('data-page', i.toString());
        pageWrapper.id = `page-${i}`;
        
        // Adiciona um placeholder carregando visível para cada página
        const placeholderDiv = document.createElement('div');
        placeholderDiv.className = 'flex items-center justify-center bg-gray-800/30 rounded-lg border border-gray-700/50 shadow-lg mb-4';
        placeholderDiv.style.height = '400px'; // Altura aproximada inicial
        placeholderDiv.style.width = '100%';
        placeholderDiv.innerHTML = `
          <div class="text-center">
            <div class="inline-block w-6 h-6 border-2 border-t-primary border-gray-700/30 rounded-full animate-spin mb-2"></div>
            <div class="text-sm text-gray-400">Carregando página ${i}...</div>
          </div>
        `;
        
        // Adiciona o número da página ao placeholder
        const pageNumberDiv = document.createElement('div');
        pageNumberDiv.className = 'text-center text-sm text-gray-500 mb-6';
        pageNumberDiv.textContent = `Página ${i} de ${pdfDoc.numPages}`;
        
        pageWrapper.appendChild(placeholderDiv);
        pageWrapper.appendChild(pageNumberDiv);
        container.appendChild(pageWrapper);
      }
      
      // Adiciona botão para voltar ao topo da página
      const backToTopButton = document.createElement('button');
      backToTopButton.id = 'pdf-back-to-top';
      backToTopButton.textContent = 'Voltar ao topo';
      backToTopButton.className = 'fixed bottom-4 right-4 bg-primary hover:bg-primary/80 text-white px-3 py-2 rounded-md shadow-md z-50';
      backToTopButton.onclick = () => {
        container.scrollTop = 0;
      };
      document.body.appendChild(backToTopButton);
      
      // Marca que terminamos de preparar os placeholders
      setIsLoading(false);
    };
    
    // Função para renderizar uma página específica
    const renderPage = async (pageNumber: number): Promise<HTMLDivElement | null> => {
      try {
        // Se já temos uma promessa para esta página, retornamos ela
        if (pagePromises.has(pageNumber)) {
          return await pagePromises.get(pageNumber);
        }
        
        // Cria uma nova promessa para esta página
        const pagePromise = (async () => {
          const container = containerRef.current;
          if (!container) return null;
          
          // Obtém o wrapper da página
          const pageWrapper = document.getElementById(`page-${pageNumber}`);
          if (!pageWrapper) return null;
          
          // Obtém a largura disponível
          const containerWidth = container.clientWidth - 20;
          
          // Carrega a página do PDF
          const page = await pdfDoc.getPage(pageNumber);
          
          // Ajusta escala para mobile automaticamente
          let autoScale = scale;
          const viewport = page.getViewport({ scale: 1.0, rotation });
          
          if (viewport.width > containerWidth) {
            autoScale = (containerWidth / viewport.width) * scale;
          }
          
          const finalViewport = page.getViewport({ scale: autoScale, rotation });
          
          // Cria um canvas para a página
          const canvas = document.createElement('canvas');
          const context = canvas.getContext('2d');
          
          if (!context) return null;
          
          canvas.height = finalViewport.height;
          canvas.width = finalViewport.width;
          canvas.className = 'shadow-lg mb-4 max-w-full rounded';
          
          const renderContext = {
            canvasContext: context,
            viewport: finalViewport
          };
          
          // Limpa o placeholder e adiciona o canvas
          pageWrapper.innerHTML = '';
          pageWrapper.appendChild(canvas);
          
          // Adiciona o número da página
          const pageNumberDiv = document.createElement('div');
          pageNumberDiv.className = 'text-center text-sm text-gray-500 mb-6';
          pageNumberDiv.textContent = `Página ${pageNumber} de ${pdfDoc.numPages}`;
          pageWrapper.appendChild(pageNumberDiv);
          
          // Renderiza a página com otimização para performance
          // Usamos requestAnimationFrame para garantir que a renderização aconteça no próximo frame de animação
          await new Promise<void>((resolve) => {
            requestAnimationFrame(async () => {
              try {
                await page.render(renderContext).promise;
                resolve();
              } catch (error) {
                console.error(`Erro na renderização da página ${pageNumber}:`, error);
                resolve(); // Resolve mesmo em caso de erro para não travar o fluxo
              }
            });
          });
          
          // Código de cache desabilitado temporariamente para focar na performance
          // Este trecho seria usado para criar versões em baixa resolução das páginas 
          // como cache para recarregamentos futuros, reduzindo a carga no renderizador
          /*
          try {
            // Cria uma versão de baixa resolução para uso como cache
            const lowResCanvas = document.createElement('canvas');
            const lowResContext = lowResCanvas.getContext('2d');
            
            if (lowResContext) { 
              // Reduzir para 1/4 da resolução original para economizar memória
              lowResCanvas.width = canvas.width / 4;
              lowResCanvas.height = canvas.height / 4;
              
              // Desenha a versão em baixa resolução
              lowResContext.drawImage(canvas, 0, 0, lowResCanvas.width, lowResCanvas.height);
              
              // Armazena para uso futuro (caso a página seja liberada e recarregada)
              // const dataUrl = lowResCanvas.toDataURL('image/jpeg', 0.5);
              // pageCache.set(pageNumber, dataUrl);
            }
          } catch (e) {
            // Ignoramos erros no cache, pois é apenas uma otimização
            console.debug("Erro ao criar cache de página (ignorado):", e);
          }
          */
          
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
            pageNumberDiv.className = 'text-center text-sm text-gray-500 mb-6';
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
      
      // Por padrão, começamos analisando as 10 primeiras páginas
      let start = 1;
      let end = Math.min(1, pdfDoc.numPages);
      
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
            setTimeout(() => renderPage(i), 50); // Pequeno atraso para priorizar páginas visíveis
          }
        }
        
        for (let i = visibleRange.end + 1; i <= loadEnd; i++) {
          if (!renderedPages.has(i) && !pagePromises.has(i)) {
            setTimeout(() => renderPage(i), 50); // Pequeno atraso para priorizar páginas visíveis
          }
        }
        
        // Libera memória para páginas que estão muito longe da área visível
        releaseInvisiblePages(visibleRange);
      } finally {
        // Termina o processamento
        isScrolling = false;
      }
    };
    
    // Prepara os placeholders e configura a rolagem
    preparePagePlaceholders();
    
    // Carrega as primeiras páginas visíveis
    setTimeout(() => {
      handleScroll();
    }, 100);
    
    // Adiciona o listener de rolagem
    const container = containerRef.current;
    if (container) {
      container.addEventListener('scroll', handleScroll);
    }
    
    // Adiciona um listener para redimensionamento
    const handleResize = () => {
      // Quando redimensionamos, limpamos todos os caches e recomeçamos
      renderedPages.clear();
      pagePromises.clear();
      preparePagePlaceholders();
      
      setTimeout(() => {
        handleScroll();
      }, 100);
    };
    
    window.addEventListener('resize', handleResize);
    
    // Função de limpeza ao desmontar o componente
    return () => {
      window.removeEventListener('resize', handleResize);
      if (container) {
        container.removeEventListener('scroll', handleScroll);
      }
      
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
    // Criar URL para download que aponta para a rota de download
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
  
  return (
    <div className="mb-6 relative">
      <div className="bg-dark-surface rounded-xl p-2 sm:p-4 md:p-6">
        <h2 className="text-lg sm:text-xl font-semibold mb-2 sm:mb-4 px-2 sm:px-0">Leitor de PDF</h2>
        
        <div className="mb-2 sm:mb-4 relative">
          {/* Barra de ferramentas fixa com estilo melhorado */}
          <div className="sticky top-0 z-10 w-full bg-dark-surface shadow-lg">
            <TooltipProvider>
              {/* Barra de ferramentas principal - layout responsivo */}
              <div className="flex flex-col bg-dark-surface-2 rounded-t-lg border border-dark-border">
                {/* Controles de navegação (funciona em mobile e desktop) */}
                <div className="flex flex-wrap items-center justify-between p-2 sm:p-3 gap-2">
                  {/* Grupo de navegação (esquerda) */}
                  <div className="flex items-center justify-center space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={goToFirstPage}
                          disabled={pageNum <= 1 || viewMode === 'scroll'}
                          className="hover:bg-dark-bg rounded p-1"
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
                          className="hover:bg-dark-bg rounded p-1"
                        >
                          <ArrowLeft className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Página anterior</p>
                      </TooltipContent>
                    </Tooltip>

                    <div className="flex items-center">
                      <Input
                        type="text"
                        value={viewMode === 'scroll' ? `${pageCount}` : pageInputValue}
                        onChange={handlePageInputChange}
                        onKeyDown={handlePageInputKeyDown}
                        disabled={viewMode === 'scroll'}
                        className="w-10 sm:w-12 h-7 text-xs sm:text-sm text-center bg-dark-bg"
                      />
                      <span className="mx-1 text-xs whitespace-nowrap">/ {pageCount}</span>
                    </div>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={nextPage}
                          disabled={pageNum >= pageCount || viewMode === 'scroll'}
                          className="hover:bg-dark-bg rounded p-1"
                        >
                          <ArrowRight className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Próxima página</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                  
                  {/* Grupo de ações (direita) - visível em ambos */}
                  <div className="flex items-center space-x-1">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handleDownload}
                          className="hover:bg-dark-bg rounded p-1"
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
                          className="hover:bg-dark-bg rounded p-1"
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
                          className="hover:bg-dark-bg rounded p-1"
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

                {/* Segunda linha de ferramentas - para zoom e outras ações */}
                <div className="flex items-center justify-between border-t border-dark-border p-2">
                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button
                          variant="ghost" 
                          size="sm"
                          onClick={zoomOut}
                          className="hover:bg-dark-bg rounded p-1"
                        >
                          <ZoomOut className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Diminuir zoom</p>
                      </TooltipContent>
                    </Tooltip>

                    <span className="text-xs w-12 text-center">{Math.round(scale * 100)}%</span>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={zoomIn}
                          className="hover:bg-dark-bg rounded p-1"
                        >
                          <ZoomIn className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Aumentar zoom</p>
                      </TooltipContent>
                    </Tooltip>

                    {/* Alternador de modo de visualização */}
                    <div className="border-l border-dark-border ml-2 pl-2 flex items-center">
                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={viewMode === 'scroll'}
                            onPressedChange={() => setViewMode('scroll')}
                            size="sm"
                            className="hover:bg-dark-bg rounded p-1 data-[state=on]:bg-primary/20"
                            aria-label="Modo de rolagem"
                          >
                            <Scroll className="w-4 h-4" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modo de rolagem</p>
                        </TooltipContent>
                      </Tooltip>

                      <Tooltip>
                        <TooltipTrigger asChild>
                          <Toggle
                            pressed={viewMode === 'single'}
                            onPressedChange={() => setViewMode('single')}
                            size="sm"
                            className="hover:bg-dark-bg rounded p-1 data-[state=on]:bg-primary/20"
                            aria-label="Modo de página única"
                          >
                            <BookOpen className="w-4 h-4" />
                          </Toggle>
                        </TooltipTrigger>
                        <TooltipContent>
                          <p>Modo de página única</p>
                        </TooltipContent>
                      </Tooltip>
                    </div>
                  </div>

                  <div className="flex items-center space-x-2">
                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={rotateClockwise}
                          className="hover:bg-dark-bg rounded p-1"
                        >
                          <RotateCw className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Girar página</p>
                      </TooltipContent>
                    </Tooltip>

                    <Tooltip>
                      <TooltipTrigger asChild>
                        <Button 
                          variant="ghost" 
                          size="sm"
                          onClick={handlePrint}
                          className="hover:bg-dark-bg rounded p-1"
                        >
                          <Printer className="w-4 h-4" />
                        </Button>
                      </TooltipTrigger>
                      <TooltipContent>
                        <p>Imprimir</p>
                      </TooltipContent>
                    </Tooltip>
                  </div>
                </div>
              </div>
            </TooltipProvider>
            
            {/* Barra de pesquisa condicional */}
            {isSearchVisible && (
              <div className="flex items-center p-2 bg-dark-surface-2 border-x border-b border-dark-border">
                <Input
                  type="text"
                  placeholder="Buscar no documento..."
                  value={searchQuery}
                  onChange={handleSearchChange}
                  className="flex-1 mr-2 bg-dark-bg"
                />
                <Button size="sm" variant="default" disabled={!searchQuery.trim()}>
                  Buscar
                </Button>
              </div>
            )}
          </div>
          
          {/* Container do PDF */}
          <div 
            id="pdf-container" 
            style={{ minHeight: `${height}px`, maxHeight: `${height + 100}px` }}
            className={`flex items-center justify-center bg-dark-surface-2 overflow-auto
              ${isSearchVisible ? 'rounded-b-lg' : 'rounded-b-lg'} border-x border-b border-dark-border p-2`}
          >
            {isLoading ? (
              <div className="flex flex-col items-center justify-center h-full">
                <Loader2 className="w-10 h-10 animate-spin text-primary" />
                <p className="mt-2">Carregando PDF...</p>
              </div>
            ) : viewMode === 'single' ? (
              <div 
                style={{ 
                  transform: `rotate(${rotation}deg)`,
                  transition: 'transform 0.3s ease',
                  maxWidth: '100%'
                }}
                className="max-w-full overflow-auto"
              >
                <canvas ref={canvasRef} className="shadow-lg max-w-full"></canvas>
                <div className="text-center mt-4 text-sm text-gray-500">
                  Página {pageNum} de {pageCount}
                </div>
              </div>
            ) : (
              <div 
                ref={containerRef}
                className="w-full flex flex-col items-center justify-start"
                style={{ 
                  maxWidth: '100%',
                  transition: 'transform 0.3s ease'
                }}
              >
                {/* O conteúdo será preenchido dinamicamente pelo useEffect do modo scroll */}
                {!pdfDoc && (
                  <div className="text-center py-8 text-gray-400">
                    Carregando visualização contínua...
                  </div>
                )}
              </div>
            )}
          </div>
          
          {/* Controles flutuantes para o modo de rolagem contínua */}
          {viewMode === 'scroll' && !isLoading && (
            <div className="fixed bottom-6 right-6 z-10 bg-dark-surface-2 rounded-full shadow-xl p-3 flex items-center space-x-2">
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={zoomOut}
                className="rounded-full h-9 w-9 p-0 flex items-center justify-center hover:bg-dark-bg"
              >
                <ZoomOut className="h-4 w-4" />
              </Button>
              <span className="text-xs px-1">{Math.round(scale * 100)}%</span>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={zoomIn}
                className="rounded-full h-9 w-9 p-0 flex items-center justify-center hover:bg-dark-bg"
              >
                <ZoomIn className="h-4 w-4" />
              </Button>
              <Button 
                variant="ghost" 
                size="sm" 
                onClick={rotateClockwise}
                className="rounded-full h-9 w-9 p-0 flex items-center justify-center hover:bg-dark-bg"
              >
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
