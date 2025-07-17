import fs from 'fs';
import path from 'path';
import sharp from 'sharp';
import crypto from 'crypto';

/**
 * Gera uma versão WebP otimizada de uma imagem existente
 * @param sourceFilePath Caminho da imagem original
 * @param targetDir Diretório onde salvar a imagem WebP
 * @param quality Qualidade da imagem WebP (1-100)
 * @returns Caminho da imagem WebP gerada
 */
export async function convertToWebP(
  sourceFilePath: string,
  targetDir: string,
  quality: number = 80
): Promise<string | null> {
  try {
    // Verifica se o arquivo de origem existe
    if (!fs.existsSync(sourceFilePath)) {
      console.error(`Arquivo não encontrado: ${sourceFilePath}`);
      return null;
    }

    // Cria o diretório de destino se não existir
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Define o nome do arquivo de saída
    const sourceFileName = path.basename(sourceFilePath);
    const targetFileName = `${path.parse(sourceFileName).name}.webp`;
    const targetFilePath = path.join(targetDir, targetFileName);

    // Verifica se o arquivo WebP já existe e é mais recente que o original
    if (fs.existsSync(targetFilePath)) {
      const sourceStats = fs.statSync(sourceFilePath);
      const targetStats = fs.statSync(targetFilePath);
      
      // Se o arquivo WebP já é mais recente que o original, retorna o caminho existente
      if (targetStats.mtime > sourceStats.mtime) {
        return targetFilePath;
      }
    }

    // Converte a imagem para WebP
    await sharp(sourceFilePath)
      .webp({ quality })
      .toFile(targetFilePath);

    return targetFilePath;
  } catch (error) {
    console.error('Erro ao converter imagem para WebP:', error);
    return null;
  }
}

/**
 * Cria uma miniatura de uma imagem e a converte para WebP
 * @param sourceFilePath Caminho da imagem original
 * @param targetDir Diretório onde salvar a miniatura
 * @param width Largura da miniatura
 * @param height Altura da miniatura (opcional)
 * @param quality Qualidade da imagem WebP (1-100)
 * @returns Caminho da miniatura WebP gerada
 */
export async function createThumbnail(
  sourceFilePath: string,
  targetDir: string,
  width: number = 600,
  height?: number,
  quality: number = 80
): Promise<string | null> {
  try {
    // Verifica se o arquivo de origem existe
    if (!fs.existsSync(sourceFilePath)) {
      console.error(`Arquivo não encontrado: ${sourceFilePath}`);
      return null;
    }

    // Cria o diretório de destino se não existir
    if (!fs.existsSync(targetDir)) {
      fs.mkdirSync(targetDir, { recursive: true });
    }

    // Gera um nome de arquivo único baseado no caminho original e dimensões
    const sourceFileName = path.basename(sourceFilePath);
    const hash = crypto
      .createHash('md5')
      .update(`${sourceFilePath}_${width}_${height || 'auto'}_${quality}`)
      .digest('hex')
      .slice(0, 8);
    
    const targetFileName = `${path.parse(sourceFileName).name}_${width}x${height || 'auto'}_${hash}.webp`;
    const targetFilePath = path.join(targetDir, targetFileName);

    // Verifica se a miniatura já existe e é mais recente que o original
    if (fs.existsSync(targetFilePath)) {
      const sourceStats = fs.statSync(sourceFilePath);
      const targetStats = fs.statSync(targetFilePath);
      
      // Se a miniatura já é mais recente que o original, retorna o caminho existente
      if (targetStats.mtime > sourceStats.mtime) {
        return targetFilePath;
      }
    }

    // Cria a miniatura em formato WebP
    const resizeOptions: sharp.ResizeOptions = {
      width,
      height,
      fit: height ? 'cover' : 'inside',
      withoutEnlargement: true
    };

    await sharp(sourceFilePath)
      .resize(resizeOptions)
      .webp({ quality })
      .toFile(targetFilePath);

    return targetFilePath;
  } catch (error) {
    console.error('Erro ao criar miniatura:', error);
    return null;
  }
}

/**
 * Verifica se o navegador suporta WebP com base no cabeçalho Accept
 * @param acceptHeader Valor do cabeçalho Accept do navegador
 * @returns Verdadeiro se o navegador suportar WebP
 */
export function browserSupportsWebP(acceptHeader?: string): boolean {
  return !!acceptHeader && acceptHeader.includes('image/webp');
}

/**
 * Serve a imagem mais apropriada com base no suporte do navegador
 * @param req Objeto de requisição do Express
 * @param res Objeto de resposta do Express
 * @param originalPath Caminho da imagem original
 * @param webpPath Caminho da imagem WebP
 */
export function serveOptimizedImage(
  req: any,
  res: any,
  originalPath: string,
  webpPath: string
): void {
  const acceptHeader = req.headers.accept;
  
  // Determina qual formato servir
  const filePath = browserSupportsWebP(acceptHeader) && fs.existsSync(webpPath)
    ? webpPath
    : originalPath;
  
  // Verifica se o arquivo existe
  if (!fs.existsSync(filePath)) {
    res.status(404).send('Imagem não encontrada');
    return;
  }
  
  // Define o tipo de conteúdo apropriado
  const contentType = filePath.endsWith('.webp')
    ? 'image/webp'
    : filePath.endsWith('.jpg') || filePath.endsWith('.jpeg')
    ? 'image/jpeg'
    : filePath.endsWith('.png')
    ? 'image/png'
    : 'application/octet-stream';
  
  // Define os cabeçalhos de cache para melhor desempenho
  res.setHeader('Content-Type', contentType);
  res.setHeader('Cache-Control', 'public, max-age=31536000'); // Cache por 1 ano
  res.setHeader('Last-Modified', fs.statSync(filePath).mtime.toUTCString());
  
  // Envia o arquivo
  res.sendFile(filePath);
}

/**
 * Otimiza automaticamente imagens para WebP quando carregadas
 * @param sourceFilePath Caminho da imagem original
 * @param webpDir Diretório para salvar versões WebP
 * @param thumbnailsDir Diretório para salvar miniaturas
 * @param thumbnailSizes Array de tamanhos de miniaturas para gerar
 * @returns Objeto com caminhos para as diferentes versões da imagem
 */
export async function processUploadedImage(
  sourceFilePath: string,
  webpDir: string,
  thumbnailsDir: string,
  thumbnailSizes: Array<{ width: number, height?: number }> = [{ width: 600 }, { width: 300 }]
): Promise<{
  original: string;
  webp: string | null;
  thumbnails: Array<{ size: { width: number, height?: number }, path: string | null }>;
}> {
  // Converção para WebP
  const webpPath = await convertToWebP(sourceFilePath, webpDir);
  
  // Criação de miniaturas
  const thumbnails = await Promise.all(
    thumbnailSizes.map(async (size) => {
      const thumbPath = await createThumbnail(
        sourceFilePath,
        thumbnailsDir,
        size.width,
        size.height
      );
      
      return {
        size,
        path: thumbPath
      };
    })
  );
  
  return {
    original: sourceFilePath,
    webp: webpPath,
    thumbnails
  };
}