/**
 * Função para obter o nome formatado de um tipo de operação de PDF
 * @param operationType Nome técnico da operação
 * @returns Nome formatado para exibição
 */
export function getPdfOperationTypeName(operationType: string): string {
  const names: Record<string, string> = {
    convertToWord: 'Conversão para Word',
    convertToImage: 'Conversão para Imagem',
    compressPdf: 'Compressão de PDF',
    mergePdfs: 'Mesclagem de PDFs',
    splitPdf: 'Divisão de PDF',
    addWatermark: 'Adição de Marca d\'água',
    rotatePdf: 'Rotação de PDF',
    deletePdfPages: 'Exclusão de Páginas',
    extractPdfPages: 'Extração de Páginas',
    protectPdf: 'Proteção com Senha',
    editMetadata: 'Edição de Metadados'
  };

  return names[operationType] || operationType;
}