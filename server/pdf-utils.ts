import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import util from 'util';
import { v4 as uuidv4 } from 'uuid';
import { PDFExtract } from 'pdf.js-extract';
import sharp from 'sharp';

// Interface estendida para representar o resultado real da extração que inclui metadados
interface ExtendedPDFExtractResult {
  pages: {
    content: { str: string }[];
  }[];
  pdfInfo: {
    numPages: number;
  };
  metadata?: {
    info?: {
      Title?: string;
      Subject?: string;
      Keywords?: string;
      Author?: string;
      CreationDate?: string;
      Producer?: string;
      [key: string]: any;
    };
  };
}

// Função para extrair metadados do PDF com tratamento robusto de acentos
export async function extractPdfMetadata(pdfFilePath: string): Promise<any> {
  try {
    console.log(`Extraindo metadados do arquivo: ${pdfFilePath}`);
    const pdfExtract = new PDFExtract();
    const result = await pdfExtract.extract(pdfFilePath, {}) as ExtendedPDFExtractResult;
    
    let title = '';
    let description = '';
    let pageCount = result.pages.length;
    let hasMetadataTitle = false;
    
    console.log(`Número de páginas extraídas: ${pageCount}`);
    
    // PRIORIDADE 1: Extrair título dos metadados do PDF
    if (result.metadata && result.metadata.info) {
      console.log("Metadados encontrados no PDF:", result.metadata.info);
      
      // Tentar obter título dos metadados (prioridade máxima)
      if (result.metadata.info.Title && result.metadata.info.Title.trim().length > 0) {
        title = cleanText(result.metadata.info.Title);
        hasMetadataTitle = true;
        console.log(`Título extraído dos metadados: ${title}`);
      }
      
      // Tentar obter descrição ou assunto dos metadados
      if (result.metadata.info.Subject && result.metadata.info.Subject.trim().length > 0) {
        description = cleanText(result.metadata.info.Subject);
      } else if (result.metadata.info.Keywords && result.metadata.info.Keywords.trim().length > 0) {
        description = cleanText(result.metadata.info.Keywords);
      }
    }
    
    // PRIORIDADE 2: Se não encontrou título nos metadados, usar nome do arquivo primeiro
    if (!hasMetadataTitle) {
      const baseName = path.basename(pdfFilePath, '.pdf');
      const fileTitle = formatFileName(baseName);
      
      // Se o nome do arquivo gerou um título válido, usar ele
      if (fileTitle !== 'Documento PDF') {
        title = fileTitle;
        console.log(`Usando nome do arquivo formatado como título: ${title}`);
      } else {
        // Se o nome do arquivo não gerou um título válido, tentar extrair do conteúdo
        console.log("Nome do arquivo não gerou título válido, tentando extrair do conteúdo");
        
        if (result.pages.length > 0) {
          // Obter o conteúdo da primeira página para buscar um título
          const firstPageContent = result.pages[0].content
            .map(item => item.str)
            .filter(str => str && str.trim().length > 0)
            .join(' ');
          
          console.log(`Conteúdo da primeira página (primeiros 300 chars): ${firstPageContent.substring(0, 300)}`);
          
          // Tentar encontrar um título nas primeiras linhas (primeiros 400 caracteres)
          const firstLines = firstPageContent.substring(0, 400).trim();
          if (firstLines.length > 0) {
            // Dividir por linhas e espaços para encontrar frases significativas
            const sentences = firstLines.split(/[.\r\n]+/).map(s => s.trim());
            
            // Procurar primeira frase significativa como título
            const titleCandidate = sentences.find(sentence => 
              sentence.length > 5 && 
              sentence.length < 120 && 
              !sentence.toLowerCase().includes('página') &&
              !sentence.toLowerCase().includes('page') &&
              !sentence.toLowerCase().includes('primeiro') &&
              !sentence.match(/^\d+$/) && // Não apenas números
              sentence.split(' ').length > 1 // Mais de uma palavra
            );
            
            if (titleCandidate) {
              title = cleanText(titleCandidate);
              console.log(`Título extraído do conteúdo: ${title}`);
            } else {
              // Se não encontrou frase, tentar primeira linha significativa
              const words = firstPageContent.split(/\s+/);
              const firstSignificantWords = words.slice(0, 10).join(' ');
              if (firstSignificantWords.length > 5) {
                title = cleanText(firstSignificantWords);
                console.log(`Título extraído das primeiras palavras: ${title}`);
              } else {
                // Como último recurso, usar o fallback
                title = fileTitle;
                console.log(`Usando fallback como título: ${title}`);
              }
            }
          } else {
            // Se não há conteúdo, usar o fallback
            title = fileTitle;
            console.log(`Sem conteúdo disponível, usando fallback: ${title}`);
          }
        } else {
          // Se não há páginas, usar o fallback
          title = fileTitle;
          console.log(`Sem páginas disponíveis, usando fallback: ${title}`);
        }
      }
    }
    
    // Extrair descrição do conteúdo se não encontrou nos metadados
    if (!description || description.trim().length < 10) {
      console.log("Extraindo descrição do conteúdo");
      
      // Obter o conteúdo das primeiras páginas
      let fullContent = "";
      const pagesToProcess = Math.min(3, result.pages.length);
      
      for (let i = 0; i < pagesToProcess; i++) {
        const pageContent = result.pages[i].content
          .map(item => item.str)
          .filter(str => str && str.trim().length > 0)
          .join(' ');
          
        fullContent += pageContent + " ";
        
        // Se já temos conteúdo suficiente para a descrição, parar
        if (fullContent.length > 1500) break;
      }
      
      // Extrair as primeiras 150 palavras do conteúdo para a descrição
      const words = fullContent.split(/\s+/);
      const firstWords = words.slice(0, 150).join(' ');
      
      if (firstWords.length > 0) {
        description = cleanText(firstWords);
        
        // Garantir que a descrição termina em um ponto ou em uma frase completa
        const lastPeriodIndex = description.lastIndexOf('.');
        if (lastPeriodIndex > description.length * 0.6) {
          description = description.substring(0, lastPeriodIndex + 1);
        }
      }
    }
    
    // Garantir que a descrição tenha pelo menos alguns caracteres
    if (!description || description.trim().length < 10) {
      description = `Documento PDF com ${pageCount} páginas disponível para consulta`;
    }
    
    // Limitar tamanhos para evitar problemas de armazenamento
    if (title.length > 200) {
      title = title.substring(0, 200).trim();
    }
    if (description.length > 500) {
      description = description.substring(0, 500).trim();
    }
    
    console.log(`Metadados finais - Título: ${title}`);
    console.log(`Metadados finais - Descrição: ${description.substring(0, 50)}...`);
    
    return {
      title,
      description,
      pageCount,
      fileSize: fs.statSync(pdfFilePath).size
    };
  } catch (error) {
    console.error('Error extracting PDF metadata:', error);
    const baseName = path.basename(pdfFilePath, '.pdf');
    return {
      title: formatFileName(baseName),
      description: `Documento PDF com conteúdo compartilhado`,
      pageCount: 0,
      fileSize: fs.statSync(pdfFilePath).size
    };
  }
}

// Função auxiliar para limpar texto (preserva acentos e caracteres em português)
function cleanText(text: string): string {
  if (!text) return '';
  
  return text
    .replace(/[\r\n\t]+/g, ' ') // Remove quebras de linha e tabs
    .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
    .trim()
    // Remove apenas caracteres de controle e símbolos problemáticos, preservando acentos
    .replace(/[\x00-\x1F\x7F-\x9F]/g, '') // Remove caracteres de controle
    .replace(/[^\u0020-\u007E\u00A0-\u00FF\u0100-\u017F\u0180-\u024F]/g, '') // Mantém ASCII estendido e caracteres latinos
    .replace(/\s+/g, ' ') // Normaliza espaços novamente
    .trim();
}

// Função auxiliar para formatar nome de arquivo
export function formatFileName(fileName: string): string {
  if (!fileName) return 'Documento PDF';
  
  console.log(`Formatando nome do arquivo: ${fileName}`);
  
  // Remove timestamps (números de 13 dígitos no início)
  let cleanName = fileName.replace(/^\d{13}-/, '');
  console.log(`Após remover timestamp: ${cleanName}`);
  
  // Remove UUIDs (padrão: 8-4-4-4-12 caracteres hexadecimais)
  cleanName = cleanName.replace(/[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/gi, '');
  console.log(`Após remover UUID: ${cleanName}`);
  
  // Remove hífens extras no início que sobraram da remoção do UUID
  cleanName = cleanName.replace(/^[-_\s]+/, '');
  console.log(`Após limpar início: ${cleanName}`);
  
  // Remove extensão .pdf se estiver presente
  cleanName = cleanName.replace(/\.pdf$/i, '');
  console.log(`Após remover extensão: ${cleanName}`);
  
  // Se não sobrou nada útil, usar nome genérico
  if (cleanName.length <= 2) {
    console.log(`Nome muito curto, usando fallback: ${cleanName}`);
    cleanName = 'Documento PDF';
  } else {
    // Formatar o nome limpo
    cleanName = cleanName
      .replace(/[-_]/g, ' ') // Substitui hífens e underscores por espaços
      .replace(/\s+/g, ' ') // Normaliza espaços múltiplos
      .trim()
      .replace(/\b\w/g, char => char.toUpperCase()); // Capitaliza primeira letra de cada palavra
  }
  
  console.log(`Nome final formatado: ${cleanName}`);
  return cleanName;
}

// Função para gerar slug a partir de texto com tratamento robusto de acentos
export function generateSlug(text: string): string {
  if (!text) return '';
  
  return text
    .toString()
    .trim()
    // Normaliza caracteres acentuados e decompõe em componentes
    .normalize('NFD')
    // Remove acentos diacríticos (combina caracteres)
    .replace(/[\u0300-\u036f]/g, '')
    // Conversões específicas para caracteres especiais do português
    .replace(/ç/g, 'c')
    .replace(/Ç/g, 'C')
    .replace(/ñ/g, 'n')
    .replace(/Ñ/g, 'N')
    // Converte para minúsculas
    .toLowerCase()
    // Substitui espaços e underscores por hífens
    .replace(/[\s_]+/g, '-')
    // Remove caracteres não alfanuméricos, exceto hífens
    .replace(/[^\w\-]+/g, '')
    // Remove múltiplos hífens consecutivos
    .replace(/\-\-+/g, '-')
    // Remove hífens no início e fim
    .replace(/^-+|-+$/g, '')
    // Limita o tamanho para URLs amigáveis
    .slice(0, 80);
}

// Função para criar thumbnail do PDF
export async function createPdfThumbnail(pdfFilePath: string, thumbnailDir: string, baseName?: string): Promise<string> {
  try {
    // Garante que o diretório existe
    if (!fs.existsSync(thumbnailDir)) {
      fs.mkdirSync(thumbnailDir, { recursive: true });
    }
    
    // Nome base para o arquivo de thumbnail
    const fileBaseName = baseName || path.basename(pdfFilePath, '.pdf');
    const thumbnailFileName = `${fileBaseName}-${Date.now()}.webp`;
    const thumbnailPath = path.join(thumbnailDir, thumbnailFileName);
    
    // Converter primeira página do PDF para imagem temporária
    const tempDir = path.join(process.cwd(), 'uploads', 'temp');
    if (!fs.existsSync(tempDir)) {
      fs.mkdirSync(tempDir, { recursive: true });
    }
    
    const tempImageBase = path.join(tempDir, `temp-${Date.now()}`);
    
    // Usar pdftoppm para converter a primeira página em imagem
    const command = `pdftoppm -png -singlefile -r 150 "${pdfFilePath}" "${tempImageBase}"`;
    await execPromise(command);
    
    // Encontrar a imagem temporária gerada
    const tempImageFiles = fs.readdirSync(tempDir);
    const tempImageFile = tempImageFiles.find(file => file.startsWith(path.basename(tempImageBase)));
    
    if (!tempImageFile) {
      throw new Error('Failed to generate temporary image for thumbnail');
    }
    
    const tempImagePath = path.join(tempDir, tempImageFile);
    
    // Usar sharp para processar a imagem (redimensionar e converter para webp)
    await sharp(tempImagePath)
      .resize(300) // Largura fixa, altura proporcional
      .webp({ quality: 80 })
      .toFile(thumbnailPath);
    
    // Limpar arquivo temporário
    fs.unlinkSync(tempImagePath);
    
    return thumbnailFileName;
  } catch (error) {
    console.error('Error creating PDF thumbnail:', error);
    throw new Error('Failed to create thumbnail');
  }
}

// Promisify exec for async/await usage
const execPromise = util.promisify(exec);

// PDF Processing utilities
export default class PdfProcessor {
  // Helper function to get process PDF information
  static async getPdfInfo(pdfFilePath: string): Promise<{ pages: number, fileSize: number }> {
    try {
      const execPromise = util.promisify(exec);
      const { stdout } = await execPromise(`pdftk "${pdfFilePath}" dump_data`);
      
      // Parse output to get the number of pages
      const pagesMatch = stdout.match(/NumberOfPages:\s*(\d+)/);
      const pages = pagesMatch ? parseInt(pagesMatch[1]) : 0;
      
      // Get file size
      const stats = fs.statSync(pdfFilePath);
      const fileSize = stats.size;
      
      console.log(`PDF Info for ${pdfFilePath}: Pages = ${pages}, Size = ${fileSize}`);
      
      return { pages, fileSize };
    } catch (error) {
      console.error("Error getting PDF info:", error);
      
      // Fallback to using pdf.js-extract if pdftk fails
      try {
        console.log("Attempting fallback to pdf.js-extract for page count...");
        const pdfExtract = new PDFExtract();
        const result = await pdfExtract.extract(pdfFilePath, {});
        const pages = result.pages.length;
        
        // Get file size
        const stats = fs.statSync(pdfFilePath);
        const fileSize = stats.size;
        
        console.log(`PDF Info from fallback: Pages = ${pages}, Size = ${fileSize}`);
        
        return { pages, fileSize };
      } catch (fallbackError) {
        console.error("Fallback also failed:", fallbackError);
        throw new Error("Could not get PDF information");
      }
    }
  }
  // Convert PDF to Word
  static async convertPdfToWord(pdfFilePath: string): Promise<string> {
    try {
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate unique output filename
      const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-${uuidv4()}.docx`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      // Use pdf.js-extract for text extraction (simplified example)
      // In a real implementation, you'd use a library like pdf2docx or a service for better conversion
      const command = `pdf2docx convert "${pdfFilePath}" "${outputFilePath}"`;
      await execPromise(command);
      
      // Check if output file was created
      if (!fs.existsSync(outputFilePath)) {
        throw new Error('Failed to convert PDF to Word');
      }
      
      return outputFilePath;
    } catch (error) {
      console.error('Error converting PDF to Word:', error);
      throw new Error('PDF to Word conversion failed');
    }
  }
  
  // Convert PDF to Image
  static async convertPdfToImage(pdfFilePath: string, format: string = 'png', dpi: number = 300): Promise<string[]> {
    try {
      console.log("PDF to Image - Input file:", pdfFilePath);
      console.log("PDF to Image - Format:", format);
      console.log("PDF to Image - DPI:", dpi);
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(pdfFilePath)) {
        throw new Error(`Arquivo PDF não encontrado: ${pdfFilePath}`);
      }
      
      // Criar diretório de saída
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Garantir que o diretório existe
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Gerar nome de arquivo base único
      const timestamp = Date.now();
      const uniqueId = Math.random().toString(36).substring(2, 15);
      const outputBaseFileName = `${path.basename(pdfFilePath, '.pdf')}-${timestamp}-${uniqueId}`;
      const outputPattern = path.join(outputDir, outputBaseFileName);
      
      console.log("PDF to Image - Output pattern:", outputPattern);
      
      // Configurar flag de formato correto para pdftoppm
      const formatFlag = format === 'jpg' ? 'jpeg' : format;
      
      // Executar conversão com pdftoppm
      // Obter o caminho absoluto para o pdftoppm
      const pdftoppmPath = "/nix/store/1f2vbia1rg1rh5cs0ii49v3hln9i36rv-poppler-utils-24.02.0/bin/pdftoppm";
      const command = `${pdftoppmPath} -${formatFlag} -r ${dpi} "${pdfFilePath}" "${outputPattern}"`;
      console.log(`Executando comando de conversão: ${command}`);
      
      try {
        const { stdout, stderr } = await execPromise(command);
        console.log("Comando executado com sucesso");
        if (stdout) console.log("Saída padrão:", stdout);
        if (stderr) console.log("Saída de erro:", stderr);
      } catch (execError) {
        console.error("Erro ao executar o comando:", execError);
        // Tentar com o caminho relativo em caso de falha
        const fallbackCommand = `pdftoppm -${formatFlag} -r ${dpi} "${pdfFilePath}" "${outputPattern}"`;
        console.log(`Tentando alternativa: ${fallbackCommand}`);
        const { stdout, stderr } = await execPromise(fallbackCommand);
        if (stderr) console.warn(`Avisos na conversão (fallback): ${stderr}`);
      }

      
      // Aguardar um momento para garantir que os arquivos sejam escritos
      await new Promise(resolve => setTimeout(resolve, 500));
      
      // Listar arquivos gerados
      const files = fs.readdirSync(outputDir);
      console.log(`Total de arquivos no diretório: ${files.length}`);
      
      // Encontrar arquivos gerados
      const expectedExtension = format === 'jpg' ? 'jpeg' : format;
      const generatedFiles = files.filter(file => {
        return file.startsWith(path.basename(outputBaseFileName)) && 
               (file.endsWith(`.${format}`) || 
                (format === 'jpg' && file.endsWith('.jpeg')));
      });
      
      console.log(`Arquivos correspondentes encontrados: ${generatedFiles.length}`);
      
      if (generatedFiles.length === 0) {
        // Segunda tentativa: procurar por qualquer arquivo com o prefixo
        const anyMatchingFiles = files.filter(file => 
          file.startsWith(path.basename(outputBaseFileName))
        );
        
        console.log(`Segunda tentativa - arquivos com prefixo correspondente: ${anyMatchingFiles.length}`);
        
        if (anyMatchingFiles.length > 0) {
          // Retornar os arquivos encontrados na segunda tentativa com caminho completo para download
          const outputPaths = anyMatchingFiles.map(file => path.join(outputDir, file));
          return outputPaths;
        }
        
        // Se ainda não encontrou nada, tentar converter com opções diferentes
        const fallbackCommand = `pdftoppm -png -r ${dpi} "${pdfFilePath}" "${outputPattern}"`;
        console.log(`Tentativa alternativa com o comando: ${fallbackCommand}`);
        
        await execPromise(fallbackCommand);
        
        // Verificar novamente os arquivos
        const newFiles = fs.readdirSync(outputDir);
        const fallbackFiles = newFiles.filter(file => 
          file.startsWith(path.basename(outputBaseFileName))
        );
        
        if (fallbackFiles.length > 0) {
          // Retornar os arquivos encontrados na tentativa alternativa com caminho completo
          const outputPaths = fallbackFiles.map(file => path.join(outputDir, file));
          return outputPaths;
        }
        
        throw new Error('Não foi possível gerar imagens a partir do PDF');
      }
      
      // Caminhos completos dos arquivos gerados
      const outputPaths = generatedFiles.map(file => path.join(outputDir, file));
      return outputPaths;
    } catch (error) {
      console.error('Erro ao converter PDF para imagens:', error);
      throw new Error('Falha na conversão de PDF para imagem');
    }
  }
  
  // Compress PDF
  static async compressPdf(pdfFilePath: string, compressionLevel: string = 'medium'): Promise<string> {
    try {
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate unique output filename
      const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-compressed-${uuidv4()}.pdf`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      // Set compression parameters based on level
      let quality;
      switch (compressionLevel) {
        case 'low':
          quality = 'printer'; // High quality
          break;
        case 'medium':
          quality = 'ebook'; // Medium quality
          break;
        case 'high':
          quality = 'screen'; // Low quality, high compression
          break;
        default:
          quality = 'ebook';
      }
      
      // Use ghostscript for PDF compression
      const command = `gs -sDEVICE=pdfwrite -dCompatibilityLevel=1.4 -dPDFSETTINGS=/${quality} -dNOPAUSE -dQUIET -dBATCH -sOutputFile="${outputFilePath}" "${pdfFilePath}"`;
      
      await execPromise(command);
      
      // Check if output file was created
      if (!fs.existsSync(outputFilePath)) {
        throw new Error('Failed to compress PDF');
      }
      
      return outputFilePath;
    } catch (error) {
      console.error('Error compressing PDF:', error);
      throw new Error('PDF compression failed');
    }
  }
  
  // Merge PDFs
  static async mergePdfs(pdfFilePaths: string[]): Promise<string> {
    try {
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate unique output filename
      const outputFileName = `merged-${uuidv4()}.pdf`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      // Use ghostscript to merge PDFs
      const inputFiles = pdfFilePaths.map(file => `"${file}"`).join(' ');
      const command = `gs -sDEVICE=pdfwrite -dNOPAUSE -dBATCH -dSAFER -sOutputFile="${outputFilePath}" ${inputFiles}`;
      
      await execPromise(command);
      
      // Check if output file was created
      if (!fs.existsSync(outputFilePath)) {
        throw new Error('Failed to merge PDFs');
      }
      
      return outputFilePath;
    } catch (error) {
      console.error('Error merging PDFs:', error);
      throw new Error('PDF merging failed');
    }
  }
  
  // Split PDF (by page ranges)
  static async splitPdf(pdfFilePath: string, pageRanges: string[]): Promise<string[]> {
    try {
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      const outputFiles: string[] = [];
      
      // Use pdftk to split PDF
      for (let i = 0; i < pageRanges.length; i++) {
        const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-part${i + 1}-${uuidv4()}.pdf`;
        const outputFilePath = path.join(outputDir, outputFileName);
        
        const command = `pdftk "${pdfFilePath}" cat ${pageRanges[i]} output "${outputFilePath}"`;
        await execPromise(command);
        
        // Check if output file was created
        if (fs.existsSync(outputFilePath)) {
          outputFiles.push(outputFilePath);
        }
      }
      
      if (outputFiles.length === 0) {
        throw new Error('Failed to split PDF');
      }
      
      return outputFiles;
    } catch (error) {
      console.error('Error splitting PDF:', error);
      throw new Error('PDF splitting failed');
    }
  }
  
  // Add watermark to PDF
  static async addWatermark(
    pdfFilePath: string, 
    watermarkText: string,
    options: {
      fontSize?: number;
      color?: string;
      opacity?: number;
      rotation?: number;
      position?: string;
      allPages?: boolean;
      pageRange?: string;
    } = {}
  ): Promise<string> {
    try {
      console.log(`Adicionando marca d'água ao PDF: ${pdfFilePath}`);
      console.log(`Texto da marca d'água: "${watermarkText}"`);
      console.log(`Opções:`, options);
      
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate unique output filename
      const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-watermarked-${uuidv4()}.pdf`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      // Configurar parâmetros opcionais com seus valores padrões
      const fontSize = options.fontSize || 50;
      const opacity = options.opacity ? options.opacity / 100 : 0.5; // Converter porcentagem para valor entre 0 e 1
      const rotation = options.rotation || 30;
      const color = options.color || '#FF0000';
      const position = options.position || 'center';
      
      // Usar pdftk para adicionar marca d'água em todas as páginas
      // Como os comandos do pdftk são limitados para marca d'água, vamos usar outra abordagem
      // temporariamente, adicionando marca d'água em todas as páginas
      
      try {
        // Método simples: Usar pdftk para todas as páginas
        // Esta abordagem é temporária e não suporta todas as opções
        console.log("Aplicando marca d'água simples com pdftk");
        
        // Vamos criar um arquivo PDF com uma única página contendo o texto da marca d'água
        const watermarkPdf = path.join(outputDir, `watermark-${uuidv4()}.pdf`);
        
        // Usar ghostscript para criar um PDF com texto centralizado em uma página transparente
        // Extrair componentes RGB de color (formato #RRGGBB)
        let r = 1.0, g = 0, b = 0; // Vermelho por padrão
        if (color.startsWith('#') && color.length === 7) {
          try {
            r = parseInt(color.substr(1, 2), 16) / 255;
            g = parseInt(color.substr(3, 2), 16) / 255;
            b = parseInt(color.substr(5, 2), 16) / 255;
          } catch(e) {
            console.warn("Erro ao parsear cor da marca d'água, usando vermelho padrão", e);
          }
        }
        
        // Criar script PostScript para o texto da marca d'água
        const watermarkScript = path.join(outputDir, `watermark-${uuidv4()}.ps`);
        let scriptContent = `
          /Helvetica findfont ${fontSize} scalefont setfont
          ${r} ${g} ${b} setrgbcolor
          ${opacity} setgray
          ${rotation} rotate
        `;
        
        // Adicionar posição
        switch (position) {
          case 'topleft':
            scriptContent += `100 700 translate\n`;
            break;
          case 'topright':
            scriptContent += `500 700 translate\n`;
            break;
          case 'bottomleft':
            scriptContent += `100 100 translate\n`;
            break;
          case 'bottomright':
            scriptContent += `500 100 translate\n`;
            break;
          case 'center':
          default:
            scriptContent += `300 400 translate\n`;
            break;
        }
        
        // Adicionar texto
        scriptContent += `
          (${watermarkText}) stringwidth pop -2 div 0 moveto
          (${watermarkText}) show
        `;
        
        // Escrever script PostScript
        fs.writeFileSync(watermarkScript, scriptContent);
        
        // Usar ghostscript para criar o PDF da marca d'água
        const gsWatermarkCommand = `gs -q -dNOPAUSE -dBATCH -sDEVICE=pdfwrite -sOutputFile="${watermarkPdf}" -dPDFSETTINGS=/prepress -f "${watermarkScript}"`;
        await execPromise(gsWatermarkCommand);
        
        // Usar pdftk para adicionar a marca d'água a cada página do PDF original
        // Este método é básico e não suporta todas as opções de posicionamento/formato
        const pdftkCommand = `pdftk "${pdfFilePath}" background "${watermarkPdf}" output "${outputFilePath}"`;
        console.log("Executando comando pdftk:", pdftkCommand);
        await execPromise(pdftkCommand);
        
        // Limpar arquivos temporários
        if (fs.existsSync(watermarkScript)) fs.unlinkSync(watermarkScript);
        if (fs.existsSync(watermarkPdf)) fs.unlinkSync(watermarkPdf);
        
      } catch (innerError) {
        console.error("Erro ao aplicar marca d'água com pdftk:", innerError);
        
        // Método alternativo: usar ghostscript diretamente
        console.log("Tentando método alternativo com ghostscript direto");
        
        // Create a temporary PostScript file for the watermark
        const watermarkFile = path.join(outputDir, `watermark-${uuidv4()}.ps`);
        
        // Write watermark PostScript content with options
        fs.writeFileSync(watermarkFile, `
          /Helvetica findfont ${fontSize} scalefont setfont
          ${rotation} rotate
          ${opacity} setgray
          200 400 translate
          (${watermarkText}) stringwidth pop -2 div 0 moveto
          (${watermarkText}) show
        `);
        
        // Use ghostscript to apply watermark
        const command = `gs -sDEVICE=pdfwrite -dBATCH -dNOPAUSE -dQUIET -sOutputFile="${outputFilePath}" -dPDFSETTINGS=/prepress -dFirstPage=1 -c "[ /Marked true /Threads true /PageMode /UseNone ] dup distill_params putinterval" -f "${watermarkFile}" "${pdfFilePath}"`;
        
        await execPromise(command);
        
        // Clean up temporary watermark file
        if (fs.existsSync(watermarkFile)) {
          fs.unlinkSync(watermarkFile);
        }
      }
      
      // Check if output file was created
      if (!fs.existsSync(outputFilePath)) {
        throw new Error('Failed to add watermark to PDF');
      }
      
      return outputFilePath;
    } catch (error) {
      console.error('Error adding watermark to PDF:', error);
      throw new Error('Failed to add watermark');
    }
  }
  
  // Rotate PDF pages
  static async rotatePdf(pdfFilePath: string, rotation: number, direction: string = 'clockwise', pageRange?: string): Promise<string> {
    try {
      console.log(`Rotating PDF: ${pdfFilePath}, rotation: ${rotation}, direction: ${direction}, pageRange: ${pageRange || 'all pages'}`);
      
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate unique output filename
      const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-rotated-${uuidv4()}.pdf`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      // Determine actual rotation angle based on direction
      let actualRotation = parseInt(rotation.toString());
      if (direction === 'counterclockwise') {
        // Convert to counterclockwise by using the complementary angle (360 - angle)
        actualRotation = 360 - actualRotation;
      }
      
      // Validate rotation (should be a multiple of 90)
      const validRotation = Math.round(actualRotation / 90) * 90;
      console.log(`Using rotation angle: ${validRotation}`);
      
      // Determine page range to rotate
      let pageRangeArg = '1-end';
      if (pageRange && pageRange.trim()) {
        pageRangeArg = pageRange.trim();
      }
      
      // Build pdftk command
      let command = '';
      
      // Translate rotation to pdftk rotation command
      let rotationCommand = '';
      if (validRotation === 90) {
        rotationCommand = 'east';
      } else if (validRotation === 180) {
        rotationCommand = 'south';
      } else if (validRotation === 270) {
        rotationCommand = 'west';
      } else {
        rotationCommand = 'north'; // 0 ou 360 graus, sem rotação
      }
      
      console.log(`Convertendo ângulo ${validRotation} para comando pdftk: ${rotationCommand}`);
      
      if (pageRangeArg === '1-end') {
        // Rotate all pages
        command = `pdftk "${pdfFilePath}" cat 1-end${rotationCommand} output "${outputFilePath}"`;
      } else {
        // We need to handle specific pages for rotation
        // First, get the total number of pages
        const pdfInfo = await this.getPdfInfo(pdfFilePath);
        const totalPages = pdfInfo.pages;
        
        // Parse page ranges and build command segments
        const segments: string[] = [];
        const allPages = new Set<number>();
        
        // Track which pages need rotation
        const pagesToRotate = new Set<number>();
        // Convertemos o iterador Set para Array usando Array.from() para evitar erros de compilação
        const pagesArray: number[] = [];
        
        pageRangeArg.split(',').forEach(part => {
          if (part.includes('-')) {
            const [start, end] = part.split('-').map(Number);
            for (let i = start; i <= end; i++) {
              pagesToRotate.add(i);
              allPages.add(i);
              pagesArray.push(i);
            }
          } else {
            const pageNum = Number(part);
            pagesToRotate.add(pageNum);
            allPages.add(pageNum);
            pagesArray.push(pageNum);
          }
        });
        
        // Add pages that need rotation
        // Converter Set para Array para evitar problemas de iteração no TypeScript
        const pagesToRotateArray = Array.from(pagesToRotate);
        for (const page of pagesToRotateArray) {
          segments.push(`${page}${rotationCommand}`);
        }
        
        // Add pages that don't need rotation
        for (let i = 1; i <= totalPages; i++) {
          if (!pagesToRotate.has(i)) {
            segments.push(`${i}`);
          }
        }
        
        // Use pdftk to rotate specific pages
        command = `pdftk "${pdfFilePath}" cat ${segments.join(' ')} output "${outputFilePath}"`;
      }
      
      console.log(`Executing pdftk command: ${command}`);
      await execPromise(command);
      
      // Check if output file was created
      if (!fs.existsSync(outputFilePath)) {
        throw new Error('Failed to rotate PDF');
      }
      
      return outputFilePath;
    } catch (error) {
      console.error('Error rotating PDF:', error);
      throw new Error('PDF rotation failed');
    }
  }
  
  // Delete pages from PDF
  static async deletePages(pdfFilePath: string, pageNumbers: number[]): Promise<string> {
    try {
      console.log(`Excluindo páginas do PDF: ${pdfFilePath}`);
      console.log(`Páginas a excluir:`, pageNumbers);
      
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Verificar se o arquivo existe
      if (!fs.existsSync(pdfFilePath)) {
        console.error(`O arquivo não existe: ${pdfFilePath}`);
        throw new Error('O arquivo PDF não foi encontrado');
      }
      
      // Assegurar que o diretório existe
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Gerar nome de arquivo único para a saída
      const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-pages-removed-${uuidv4()}.pdf`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      console.log(`Arquivo de saída: ${outputFilePath}`);
      
      try {
        // Obter contagem de páginas
        const totalPages = await this.getPageCount(pdfFilePath);
        console.log(`PDF tem ${totalPages} páginas no total`);
        
        if (totalPages === 0) {
          console.error('PDF não contém páginas');
          throw new Error('O PDF não contém páginas para processar');
        }
        
        // Validar números de página
        const validPageNumbers = pageNumbers.filter(page => 
          Number.isInteger(page) && page >= 1 && page <= totalPages
        );
        
        console.log(`Números de página válidos:`, validPageNumbers);
        
        if (validPageNumbers.length !== pageNumbers.length) {
          console.warn(`Alguns números de página foram ignorados por estarem fora do intervalo válido (1-${totalPages})`);
          console.warn(`Páginas originais:`, pageNumbers);
          console.warn(`Páginas válidas:`, validPageNumbers);
        }
        
        if (validPageNumbers.length === 0) {
          console.log('Nenhuma página válida para excluir. Retornando o PDF original.');
          // Copiar o PDF original para um novo arquivo
          fs.copyFileSync(pdfFilePath, outputFilePath);
          return outputFilePath;
        }
        
        if (validPageNumbers.length === totalPages) {
          console.error('Tentativa de excluir todas as páginas do PDF');
          throw new Error('Não é possível excluir todas as páginas do PDF');
        }
        
        // Preparar intervalos de páginas para manter (remover as páginas especificadas)
        console.log(`Obtendo páginas a manter (excluindo ${validPageNumbers.length} páginas)...`);
        const pagesToKeep = await this.getAllPagesExcept(pdfFilePath, validPageNumbers);
        console.log(`Páginas a manter: ${pagesToKeep.join(', ')}`);
        
        // Se não houver páginas para manter, lançar erro
        if (!pagesToKeep || pagesToKeep.length === 0) {
          console.error('Não há páginas para manter após a exclusão');
          throw new Error('Não é possível excluir todas as páginas do PDF');
        }
        
        // Usar pdftk para extrair páginas específicas
        const pageRanges = pagesToKeep.join(' ');
        console.log(`Comando pdftk - páginas a manter: ${pageRanges}`);
        
        const command = `pdftk "${pdfFilePath}" cat ${pageRanges} output "${outputFilePath}"`;
        console.log(`Executando comando: ${command}`);
        
        try {
          const execResult = await execPromise(command);
          console.log(`Comando executado com sucesso:`, execResult);
          
          // Verificar se o arquivo de saída foi criado
          if (!fs.existsSync(outputFilePath)) {
            console.error('Arquivo de saída não foi criado após comando pdftk');
            throw new Error('Falha ao criar o arquivo de saída PDF');
          }
          
          // Verificar tamanho do arquivo
          const stats = fs.statSync(outputFilePath);
          console.log(`Arquivo de saída criado com ${stats.size} bytes`);
          
          if (stats.size === 0) {
            console.error('Arquivo de saída criado, mas está vazio');
            throw new Error('Arquivo PDF gerado está vazio');
          }
          
          console.log(`PDF com páginas excluídas criado com sucesso: ${outputFilePath}`);
          return outputFilePath;
        } catch (execError) {
          console.error('Erro ao executar comando pdftk:', execError);
          throw new Error(`Falha ao processar PDF: ${(execError as Error).message}`);
        }
      } catch (processingError) {
        console.error('Erro ao processar PDF para exclusão de páginas:', processingError);
        
        // Em caso de erro no processamento, tentar entregar o arquivo original
        if (fs.existsSync(pdfFilePath)) {
          console.log('Copiando o PDF original como alternativa');
          fs.copyFileSync(pdfFilePath, outputFilePath);
          
          if (fs.existsSync(outputFilePath)) {
            console.log(`Arquivo alternativo criado: ${outputFilePath}`);
            return outputFilePath;
          }
        }
        
        throw processingError;
      }
    } catch (error) {
      console.error('Erro crítico ao excluir páginas do PDF:', error);
      throw new Error(`Falha ao excluir páginas: ${(error as Error).message || 'Erro desconhecido'}`);
    }
  }
  
  // Extract pages from PDF
  static async extractPages(pdfFilePath: string, pageNumbers: number[]): Promise<string> {
    try {
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate unique output filename
      const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-extracted-${uuidv4()}.pdf`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      // Sort page numbers to maintain correct order
      const sortedPages = [...pageNumbers].sort((a, b) => a - b);
      
      // Format page ranges for pdftk
      const pageRanges = sortedPages.join(' ');
      
      // Use pdftk to extract specific pages
      const command = `pdftk "${pdfFilePath}" cat ${pageRanges} output "${outputFilePath}"`;
      
      await execPromise(command);
      
      // Check if output file was created
      if (!fs.existsSync(outputFilePath)) {
        throw new Error('Failed to extract pages from PDF');
      }
      
      return outputFilePath;
    } catch (error) {
      console.error('Error extracting pages from PDF:', error);
      throw new Error('Failed to extract pages');
    }
  }
  
  // Protect PDF with password
  static async protectPdf(pdfFilePath: string, userPassword: string, ownerPassword?: string): Promise<string> {
    try {
      console.log(`Protegendo PDF com senha: ${pdfFilePath}`);
      console.log(`Senha do usuário: ********`);
      console.log(`Senha do proprietário fornecida: ${ownerPassword ? 'Sim' : 'Não'}`);
      
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate unique output filename
      const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-protected-${uuidv4()}.pdf`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      console.log(`Arquivo de saída: ${outputFilePath}`);
      
      // Construir o comando pdftk
      let command = `pdftk "${pdfFilePath}" output "${outputFilePath}" user_pw "${userPassword}"`;
      
      // Adicionar senha do proprietário apenas se fornecida e se for diferente da senha do usuário
      // pdftk não permite que as senhas de usuário e proprietário sejam iguais
      if (ownerPassword && ownerPassword !== userPassword) {
        command += ` owner_pw "${ownerPassword}"`;
      }
      
      console.log(`Executando comando: ${command.replace(userPassword, '********')}`);
      if (ownerPassword) console.log(`Senha do proprietário usada: ${ownerPassword !== userPassword ? 'Sim' : 'Não (igual à senha do usuário)'}`);
      
      await execPromise(command);
      
      // Check if output file was created
      if (!fs.existsSync(outputFilePath)) {
        console.error('Arquivo de saída não foi criado após comando pdftk');
        throw new Error('Failed to protect PDF with password');
      }
      
      console.log(`PDF protegido com senha criado com sucesso: ${outputFilePath}`);
      return outputFilePath;
    } catch (error) {
      console.error('Error protecting PDF with password:', error);
      throw new Error('Failed to add password protection');
    }
  }
  
  // Edit PDF metadata
  static async editMetadata(pdfFilePath: string, metadata: Record<string, string>): Promise<string> {
    try {
      const outputDir = path.join(process.cwd(), 'uploads', 'pdf-edits');
      
      // Ensure directory exists
      if (!fs.existsSync(outputDir)) {
        fs.mkdirSync(outputDir, { recursive: true });
      }
      
      // Generate unique output filename
      const outputFileName = `${path.basename(pdfFilePath, '.pdf')}-metadata-${uuidv4()}.pdf`;
      const outputFilePath = path.join(outputDir, outputFileName);
      
      // Create temporary metadata file
      const metadataFile = path.join(outputDir, `metadata-${uuidv4()}.txt`);
      
      // Format metadata for pdftk
      let metadataContent = '';
      for (const [key, value] of Object.entries(metadata)) {
        metadataContent += `InfoKey: ${key}\nInfoValue: ${value}\n`;
      }
      
      fs.writeFileSync(metadataFile, metadataContent);
      
      // Use pdftk to update metadata
      const command = `pdftk "${pdfFilePath}" update_info "${metadataFile}" output "${outputFilePath}"`;
      
      await execPromise(command);
      
      // Clean up temporary metadata file
      if (fs.existsSync(metadataFile)) {
        fs.unlinkSync(metadataFile);
      }
      
      // Check if output file was created
      if (!fs.existsSync(outputFilePath)) {
        throw new Error('Failed to update PDF metadata');
      }
      
      return outputFilePath;
    } catch (error) {
      console.error('Error updating PDF metadata:', error);
      throw new Error('Failed to update metadata');
    }
  }
  
  // Helper methods
  
  // Get the number of pages in a PDF
  static async getPageCount(pdfFilePath: string): Promise<number> {
    try {
      // Use pdftk to get PDF info
      const { stdout } = await execPromise(`pdftk "${pdfFilePath}" dump_data`);
      
      // Parse the output to find the number of pages
      const pageCountMatch = stdout.match(/NumberOfPages: (\d+)/);
      if (pageCountMatch && pageCountMatch[1]) {
        return parseInt(pageCountMatch[1], 10);
      }
      
      throw new Error('Could not determine page count');
    } catch (error) {
      console.error('Error getting PDF page count:', error);
      throw new Error('Failed to get page count');
    }
  }
  
  // Get all page numbers except the specified ones
  static async getAllPagesExcept(pdfFilePath: string, pagesToExclude: number[]): Promise<string[]> {
    try {
      const pageCount = await this.getPageCount(pdfFilePath);
      console.log(`PDF tem ${pageCount} páginas. Excluindo páginas:`, pagesToExclude);
      
      // Validar entradas
      if (pageCount === 0) {
        throw new Error('PDF não contém páginas');
      }
      
      if (pagesToExclude.length === 0) {
        console.log("Nenhuma página para excluir, retornando todas as páginas");
        return ['1-end']; // Manter todas as páginas
      }
      
      // Filtrar os números de página válidos
      const validPagesToExclude = pagesToExclude.filter(page => page >= 1 && page <= pageCount);
      console.log(`Páginas válidas a excluir:`, validPagesToExclude);
      
      if (validPagesToExclude.length === 0) {
        console.log("Nenhuma página válida para excluir, retornando todas as páginas");
        return ['1-end']; // Nenhuma página válida para excluir
      }
      
      if (validPagesToExclude.length >= pageCount) {
        console.error(`Tentativa de excluir todas as ${validPagesToExclude.length} páginas de um PDF com ${pageCount} páginas`);
        throw new Error('Não é possível excluir todas as páginas do PDF');
      }
      
      // Ordenar páginas para processa-las em ordem
      const sortedPagesToExclude = [...validPagesToExclude].sort((a, b) => a - b);
      
      // Array para armazenar as sequências de páginas que queremos manter
      const pagesToKeep: string[] = [];
      let currentRange: number[] = [];
      
      // Construir ranges de páginas para manter
      for (let i = 1; i <= pageCount; i++) {
        if (!sortedPagesToExclude.includes(i)) {
          currentRange.push(i);
        } else if (currentRange.length > 0) {
          // Fim de um intervalo
          pagesToKeep.push(this.formatPageRange(currentRange));
          currentRange = [];
        }
      }
      
      // Adicionar o último intervalo se existir
      if (currentRange.length > 0) {
        pagesToKeep.push(this.formatPageRange(currentRange));
      }
      
      console.log('Intervalos de páginas a manter:', pagesToKeep);
      
      if (pagesToKeep.length === 0) {
        console.error('Nenhum intervalo de páginas para manter');
        throw new Error('Não é possível excluir todas as páginas do PDF');
      }
      
      return pagesToKeep;
    } catch (error) {
      console.error('Erro ao determinar páginas a manter:', error);
      throw error;
    }
  }
  
  // Format a consecutive range of page numbers for pdftk
  static formatPageRange(pages: number[]): string {
    if (pages.length === 0) return '';
    if (pages.length === 1) return pages[0].toString();
    
    // Ordenar as páginas para garantir sequência correta
    const sortedPages = [...pages].sort((a, b) => a - b);
    
    // Verificar se o conjunto é consecutivo
    const isConsecutive = sortedPages.every((page, index, arr) => 
      index === 0 || page === arr[index - 1] + 1
    );
    
    if (isConsecutive) {
      // Para sequências consecutivas, usar o formato "início-fim"
      return `${sortedPages[0]}-${sortedPages[sortedPages.length - 1]}`;
    } else {
      // Para páginas não consecutivas, especificar cada página separadamente
      // (o pdftk aceita uma lista de páginas separadas por espaço)
      return sortedPages.join(' ');
    }
  }
}
