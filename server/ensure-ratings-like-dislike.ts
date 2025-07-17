// Função para garantir que a tabela ratings esteja no formato like/dislike
import { db } from './db';
import { sql } from 'drizzle-orm';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

// Obter o diretório atual em ESM
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export async function ensureRatingsLikeDislikeFormat(): Promise<boolean> {
  try {
    console.log('Verificando formato da tabela ratings...');
    
    // Ler o arquivo SQL
    const sqlFilePath = path.join(__dirname, '..', 'migrations', '0012_update_ratings_to_like_dislike.sql');
    
    // Verificar se o arquivo existe
    if (!fs.existsSync(sqlFilePath)) {
      console.error('Arquivo de migração não encontrado:', sqlFilePath);
      return false;
    }
    
    const sqlContent = fs.readFileSync(sqlFilePath, 'utf8');

    // Executar o SQL
    await db.execute(sql.raw(sqlContent));
    
    console.log('Tabela ratings verificada/atualizada com sucesso para o formato like/dislike');
    return true;
  } catch (error) {
    console.error('Erro ao verificar/atualizar tabela ratings:', error);
    return false;
  }
}