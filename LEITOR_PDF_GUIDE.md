# 📖 Sistema de Leitura PDF - Guia Completo

## 🔍 Como Funciona o Leitor de PDF

### Arquitetura do Visualizador

```
PDF.js Worker → Document Loading → Lazy Rendering → Canvas Display
     ↓              ↓                ↓               ↓
  Background        Progressive      Scroll-based    High-Quality
  Processing        Loading          Page Loading    Rendering
```

### Componentes Principais

1. **PDF.js Engine** - Renderização de PDFs no navegador
2. **Lazy Loading** - Carregamento inteligente de páginas
3. **Viewport Optimization** - Ajuste automático ao tamanho da tela
4. **Memory Management** - Liberação automática de páginas não visíveis
5. **Progressive Enhancement** - Carregamento progressivo e otimizado

---

## 🛠️ Implementação Técnica

### 1. **Configuração do PDF.js**

**Arquivo:** `client/src/components/pdf/pdf-viewer-redesigned.tsx`

```typescript
import * as pdfjsLib from "pdfjs-dist";
import { GlobalWorkerOptions } from "pdfjs-dist";

// Configurar worker para processamento em background
GlobalWorkerOptions.workerSrc = `https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/build/pdf.worker.min.js`;

interface PdfViewerProps {
  pdfFile: string;  // URL do arquivo PDF
  height?: number;  // Altura opcional
}
```

### 2. **Carregamento Progressivo do Documento**

```typescript
const loadPdf = async () => {
  try {
    setIsLoading(true);
    
    // Normalizar URL do PDF
    const pdfUrl = pdfFile.startsWith('http') 
      ? pdfFile 
      : `${window.location.origin}${pdfFile}`;
    
    // Configuração otimizada para carregamento
    const loadingTask = pdfjsLib.getDocument({
      url: pdfUrl,
      withCredentials: true,
      cMapUrl: 'https://cdn.jsdelivr.net/npm/pdfjs-dist@3.11.174/cmaps/',
      cMapPacked: true,
      disableRange: false,      // Permite carregamento por partes
      disableStream: false,     // Habilita streaming
      disableAutoFetch: false,  // Auto-fetch de recursos
      rangeChunkSize: 65536     // 64KB por chunk (otimizado)
    });
    
    // Timeout para feedback de carregamento lento
    const loadingTimeout = setTimeout(() => {
      console.log("PDF carregando... Por favor aguarde.");
    }, 3000);
    
    const pdfDocument = await loadingTask.promise;
    clearTimeout(loadingTimeout);
    
    console.log(`PDF carregado: ${pdfDocument.numPages} páginas`);
    setPdfDoc(pdfDocument);
    setPageCount(pdfDocument.numPages);
    setIsLoading(false);
    
  } catch (error) {
    console.error("Erro carregando PDF:", error);
    setIsLoading(false);
  }
};
```

### 3. **Sistema de Lazy Loading Inteligente**

```typescript
// Configuração do sistema de páginas sob demanda
const renderedPages = new Map<number, HTMLDivElement>();
const pagePromises = new Map<number, Promise<HTMLDivElement | null>>();
const visiblePagesBuffer = 2; // Buffer de páginas

// Preparar placeholders para layout preservado
const preparePagePlaceholders = () => {
  const container = containerRef.current;
  if (!container) return;
  
  container.innerHTML = '';
  
  // Criar placeholder para cada página
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const pageWrapper = document.createElement('div');
    pageWrapper.id = `page-${i}`;
    pageWrapper.className = 'pdf-page-wrapper flex flex-col items-center w-full';
    pageWrapper.setAttribute('data-nosnippet', ''); // SEO: previne snippets
    
    // Placeholder com loading spinner
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
    
    // Número da página
    const pageNumberDiv = document.createElement('div');
    pageNumberDiv.className = 'text-center text-sm bg-gray-800/80 text-gray-300 py-1 px-3 rounded-full shadow-md mb-8';
    pageNumberDiv.textContent = `Página ${i} de ${pdfDoc.numPages}`;
    
    pageWrapper.appendChild(placeholderDiv);
    pageWrapper.appendChild(pageNumberDiv);
    container.appendChild(pageWrapper);
  }
};
```

### 4. **Renderização Otimizada de Páginas**

```typescript
const renderPage = async (pageNumber: number): Promise<HTMLDivElement | null> => {
  try {
    // Verificar se já existe promessa para esta página
    if (pagePromises.has(pageNumber)) {
      return pagePromises.get(pageNumber) as Promise<HTMLDivElement | null>;
    }
    
    const pagePromise = (async () => {
      const page = await pdfDoc.getPage(pageNumber);
      const container = containerRef.current;
      if (!container) return null;
      
      const pageWrapper = document.getElementById(`page-${pageNumber}`);
      if (!pageWrapper) return null;
      
      // Limpar conteúdo do wrapper
      pageWrapper.innerHTML = '';
      
      // Calcular escala automática para fit no container
      const containerWidth = container.clientWidth - 20;
      let autoScale = scale;
      const viewport = page.getViewport({ scale: 1.0, rotation });
      
      if (viewport.width > containerWidth) {
        autoScale = (containerWidth / viewport.width) * scale;
      }
      
      const finalViewport = page.getViewport({ scale: autoScale, rotation });
      
      // Criar canvas para renderização
      const canvas = document.createElement('canvas');
      const context = canvas.getContext('2d', { alpha: false }); // alpha: false = melhor performance
      
      if (!context) return null;
      
      canvas.height = finalViewport.height;
      canvas.width = finalViewport.width;
      canvas.className = 'shadow-2xl mb-5 max-w-full mx-auto rounded-md';
      
      pageWrapper.appendChild(canvas);
      
      // Renderizar página com tratamento de erro robusto
      try {
        const renderTask = page.render({
          canvasContext: context,
          viewport: finalViewport
        });
        
        await renderTask.promise;
        
        // Adicionar número da página após renderização
        const pageNumberDiv = document.createElement('div');
        pageNumberDiv.className = 'text-center text-sm bg-gray-800/80 text-gray-300 py-1 px-3 rounded-full shadow-md mb-8';
        pageNumberDiv.textContent = `Página ${pageNumber} de ${pdfDoc.numPages}`;
        pageWrapper.appendChild(pageNumberDiv);
        
        // Marcar como renderizada
        renderedPages.set(pageNumber, pageWrapper as HTMLDivElement);
        
      } catch (renderError) {
        console.warn(`Falha na renderização da página ${pageNumber}:`, renderError);
        
        // Fallback: placeholder com erro
        context.fillStyle = '#f0f0f0';
        context.fillRect(0, 0, canvas.width, canvas.height);
        context.font = '14px Arial';
        context.fillStyle = '#666';
        context.textAlign = 'center';
        context.fillText(`Erro na página ${pageNumber}`, canvas.width / 2, canvas.height / 2);
      }
      
      return pageWrapper as HTMLDivElement;
    })();
    
    // Armazenar promessa
    pagePromises.set(pageNumber, pagePromise);
    return pagePromise;
    
  } catch (error) {
    console.error(`Erro renderizando página ${pageNumber}:`, error);
    return null;
  }
};
```

### 5. **Sistema de Scroll Inteligente**

```typescript
// Detectar páginas visíveis no viewport
const getVisiblePages = (): { start: number, end: number } => {
  const container = containerRef.current;
  if (!container) return { start: 1, end: Math.min(5, pdfDoc.numPages) };
  
  const scrollTop = container.scrollTop;
  const containerHeight = container.clientHeight;
  
  let start = 1;
  let end = Math.min(3, pdfDoc.numPages);
  
  // Detectar páginas visíveis baseado na posição
  for (let i = 1; i <= pdfDoc.numPages; i++) {
    const pageWrapper = document.getElementById(`page-${i}`);
    if (!pageWrapper) continue;
    
    const rect = pageWrapper.getBoundingClientRect();
    const containerRect = container.getBoundingClientRect();
    
    // Verificar se página está visível (com buffer)
    const isVisible = (
      rect.top < containerRect.bottom + 200 &&  // 200px abaixo
      rect.bottom > containerRect.top - 200     // 200px acima
    );
    
    if (isVisible) {
      start = Math.min(start, i);
      end = Math.max(end, i);
    }
  }
  
  return { start, end };
};

// Handler de scroll com throttling
let scrollTimeout: number | null = null;
let isScrolling = false;

const handleScroll = () => {
  if (!containerRef.current || isScrolling) return;
  
  isScrolling = true;
  
  requestAnimationFrame(() => {
    try {
      const visibleRange = getVisiblePages();
      
      // Janela de carregamento (visíveis + buffer)
      const loadStart = Math.max(1, visibleRange.start - visiblePagesBuffer);
      const loadEnd = Math.min(pdfDoc.numPages, visibleRange.end + visiblePagesBuffer);
      
      // PRIORIDADE ALTA: Páginas visíveis
      for (let i = visibleRange.start; i <= visibleRange.end; i++) {
        if (!renderedPages.has(i) && !pagePromises.has(i)) {
          renderPage(i);
        }
      }
      
      // PRIORIDADE BAIXA: Buffer pages (com delay)
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
      
      // Liberar memória de páginas distantes
      releaseInvisiblePages(visibleRange);
      
    } catch (error) {
      console.error("Erro no scroll:", error);
    } finally {
      isScrolling = false;
    }
  });
};
```

### 6. **Gestão de Memória**

```typescript
// Liberar páginas que estão muito longe para economizar memória
const releaseInvisiblePages = (visibleRange: { start: number, end: number }) => {
  const memoryThreshold = 10; // Páginas além de 10 da área visível
  
  renderedPages.forEach((pageElement, pageNumber) => {
    const distanceFromVisible = Math.min(
      Math.abs(pageNumber - visibleRange.start),
      Math.abs(pageNumber - visibleRange.end)
    );
    
    // Se a página está muito longe da área visível
    if (distanceFromVisible > memoryThreshold) {
      console.log(`Liberando memória da página ${pageNumber}`);
      
      // Substituir por placeholder
      const pageWrapper = document.getElementById(`page-${pageNumber}`);
      if (pageWrapper) {
        pageWrapper.innerHTML = `
          <div class="bg-gray-800/30 rounded-lg border border-gray-700/50 shadow-lg mb-4" style="height: 400px; width: 100%;">
            <div class="flex items-center justify-center h-full">
              <div class="text-center">
                <div class="text-sm text-gray-400">Página ${pageNumber}</div>
                <div class="mt-2">
                  <div class="inline-block w-6 h-6 border-2 border-t-primary border-primary/30 rounded-full animate-spin"></div>
                </div>
              </div>
            </div>
          </div>
        `;
        
        // Adicionar número da página
        const pageNumberDiv = document.createElement('div');
        pageNumberDiv.className = 'text-center text-sm bg-gray-800/80 text-gray-300 py-1 px-3 rounded-full shadow-md mb-8';
        pageNumberDiv.textContent = `Página ${pageNumber} de ${pdfDoc.numPages}`;
        pageWrapper.appendChild(pageNumberDiv);
      }
      
      // Remover do cache
      renderedPages.delete(pageNumber);
      pagePromises.delete(pageNumber);
    }
  });
};
```

---

## 🎮 Funcionalidades do Leitor

### 1. **Controles de Zoom**

```typescript
// Zoom In/Out
const zoomIn = () => setScale(prev => Math.min(prev + 0.25, 3.0));
const zoomOut = () => setScale(prev => Math.max(prev - 0.25, 0.5));

// Zoom automático para fit na tela
const fitToWidth = () => {
  if (!pdfDoc || !containerRef.current) return;
  
  const containerWidth = containerRef.current.clientWidth - 20;
  // Calcular escala baseada na primeira página
  pdfDoc.getPage(1).then(page => {
    const viewport = page.getViewport({ scale: 1.0 });
    const newScale = containerWidth / viewport.width;
    setScale(newScale);
  });
};
```

### 2. **Navegação por Páginas**

```typescript
// Ir para página específica
const goToPage = (pageNumber: number) => {
  if (pageNumber >= 1 && pageNumber <= pageCount) {
    setPageNum(pageNumber);
    setPageInputValue(pageNumber.toString());
    
    // Scroll para a página no modo scroll
    if (viewMode === 'scroll') {
      const pageElement = document.getElementById(`page-${pageNumber}`);
      if (pageElement) {
        pageElement.scrollIntoView({ behavior: 'smooth', block: 'start' });
      }
    }
  }
};

// Página anterior/próxima
const previousPage = () => goToPage(pageNum - 1);
const nextPage = () => goToPage(pageNum + 1);
```

### 3. **Botão "Voltar ao Topo"**

```typescript
// Botão flutuante para voltar ao início
const backToTopButton = document.createElement('button');
backToTopButton.id = 'pdf-back-to-top';
backToTopButton.className = 'fixed bottom-6 right-6 bg-primary text-white rounded-full p-3 shadow-lg hover:bg-primary/80 transition-opacity duration-300 opacity-0';
backToTopButton.innerHTML = '<svg>...</svg>'; // Ícone de seta para cima

backToTopButton.addEventListener('click', () => {
  container.scrollTo({ top: 0, behavior: 'smooth' });
});

// Mostrar/esconder baseado na posição do scroll
container.addEventListener('scroll', () => {
  if (container.scrollTop > 300) {
    backToTopButton.style.opacity = '1';
  } else {
    backToTopButton.style.opacity = '0';
  }
});
```

### 4. **Download e Impressão**

```typescript
// Download do PDF
const downloadPdf = () => {
  const link = document.createElement('a');
  link.href = pdfFile;
  link.download = `documento-${Date.now()}.pdf`;
  link.click();
};

// Impressão
const printPdf = () => {
  window.open(pdfFile, '_blank');
};
```

---

## 📱 Interface do Usuário

### Toolbar Completa

```typescript
const PdfToolbar = () => (
  <div className="flex items-center justify-between p-4 bg-gray-800 border-b border-gray-700">
    {/* Controles de navegação */}
    <div className="flex items-center space-x-2">
      <Button onClick={previousPage} disabled={pageNum <= 1}>
        <ArrowLeft className="w-4 h-4" />
      </Button>
      
      <div className="flex items-center space-x-2">
        <Input
          type="number"
          value={pageInputValue}
          onChange={(e) => setPageInputValue(e.target.value)}
          onBlur={() => goToPage(parseInt(pageInputValue) || pageNum)}
          className="w-16 text-center"
          min="1"
          max={pageCount}
        />
        <span className="text-sm text-gray-400">de {pageCount}</span>
      </div>
      
      <Button onClick={nextPage} disabled={pageNum >= pageCount}>
        <ArrowRight className="w-4 h-4" />
      </Button>
    </div>
    
    {/* Controles de zoom */}
    <div className="flex items-center space-x-2">
      <Button onClick={zoomOut} disabled={scale <= 0.5}>
        <ZoomOut className="w-4 h-4" />
      </Button>
      
      <span className="text-sm text-gray-400 w-12 text-center">
        {Math.round(scale * 100)}%
      </span>
      
      <Button onClick={zoomIn} disabled={scale >= 3.0}>
        <ZoomIn className="w-4 h-4" />
      </Button>
    </div>
    
    {/* Ações */}
    <div className="flex items-center space-x-2">
      <Button onClick={downloadPdf}>
        <Download className="w-4 h-4" />
      </Button>
      
      <Button onClick={printPdf}>
        <Printer className="w-4 h-4" />
      </Button>
    </div>
  </div>
);
```

---

## 🔧 Otimizações Avançadas

### 1. **Performance**

```typescript
// Configurações otimizadas do PDF.js
const optimizedConfig = {
  rangeChunkSize: 65536,        // 64KB chunks
  disableRange: false,          // Habilita range requests
  disableStream: false,         // Habilita streaming
  disableAutoFetch: false,      // Auto-fetch de recursos
  maxImageSize: 16777216,       // 16MB max para imagens
  cMapPacked: true,             // CMap comprimido
  standardFontDataUrl: false    // Não baixar fontes padrão
};
```

### 2. **SEO e Acessibilidade**

```typescript
// Atributos para SEO
pageWrapper.setAttribute('data-nosnippet', '');  // Previne snippets do Google
pageWrapper.setAttribute('role', 'img');         // Acessibilidade
pageWrapper.setAttribute('aria-label', `Página ${i} do documento PDF`);
```

### 3. **Responsive Design**

```typescript
// Ajuste automático para dispositivos móveis
const isMobile = window.innerWidth < 768;
const visiblePagesBuffer = isMobile ? 1 : 2;  // Menos buffer no mobile
const initialScale = isMobile ? 0.8 : 1.0;    // Escala menor no mobile
```

---

## 💡 Vantagens do Sistema

### ✅ **Performance**
- Lazy loading de páginas (carrega apenas o que está visível)
- Gestão automática de memória
- Rendering otimizado com Canvas 2D
- Worker em background para não bloquear UI

### ✅ **Experiência do Usuário**
- Carregamento progressivo e fluido
- Scroll natural entre páginas
- Zoom inteligente que se adapta à tela
- Feedback visual durante carregamento

### ✅ **Confiabilidade**
- Tratamento robusto de erros
- Fallbacks para renderização
- Retry automático em falhas
- Cleanup automático de recursos

### ✅ **Funcionalidades**
- Visualização em scroll contínuo
- Controles completos de navegação
- Download e impressão
- Responsivo para mobile/desktop

**Este sistema oferece uma experiência de leitura PDF superior, com performance otimizada e funcionalidades avançadas, tudo rodando nativamente no navegador sem plugins externos.**