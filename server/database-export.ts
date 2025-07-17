import { db } from './db';
import { 
  users, categories, pdfs, dmcaRequests,
  ratings, seoSettings, siteSettings, slugHistory
} from '@shared/schema';
import fs from 'fs';
import path from 'path';
import { Response } from 'express';

// Função para exportar todos os dados do banco para um arquivo JSON
export async function exportDatabase(res: Response) {
  try {
    // Cria diretório de exportação se não existir
    const exportDir = path.join(process.cwd(), 'exports');
    if (!fs.existsSync(exportDir)) {
      fs.mkdirSync(exportDir, { recursive: true });
    }

    // Busca todos os dados de todas as tabelas
    const allUsers = await db.select().from(users);
    const allCategories = await db.select().from(categories);
    const allPdfs = await db.select().from(pdfs);
    const allDmcaRequests = await db.select().from(dmcaRequests);
    const allRatings = await db.select().from(ratings);
    const allSeoSettings = await db.select().from(seoSettings);
    const allSiteSettings = await db.select().from(siteSettings);
    const allSlugHistory = await db.select().from(slugHistory);

    // Monta objeto com todos os dados
    const exportData = {
      metadata: {
        version: '1.0',
        exportDate: new Date().toISOString(),
        tables: [
          'users', 'categories', 'pdfs', 'dmcaRequests',
          'ratings', 'seoSettings', 'siteSettings', 'slugHistory'
        ],
      },
      data: {
        users: allUsers,
        categories: allCategories,
        pdfs: allPdfs,
        dmcaRequests: allDmcaRequests,
        ratings: allRatings,
        seoSettings: allSeoSettings,
        siteSettings: allSiteSettings,
        slugHistory: allSlugHistory,
      }
    };

    // Nome de arquivo com timestamp
    const timestamp = new Date().toISOString().replace(/:/g, '-').replace(/\..+/, '');
    const filename = `pdfxandria_backup_${timestamp}.json`;
    const filePath = path.join(exportDir, filename);

    // Escreve arquivo de exportação
    fs.writeFileSync(filePath, JSON.stringify(exportData, null, 2));

    // Envia o arquivo para download
    res.download(filePath, filename, (err) => {
      if (err) {
        console.error("Erro ao enviar arquivo de exportação:", err);
      } else {
        // Opcionalmente remove o arquivo após envio
        // fs.unlinkSync(filePath);
      }
    });

    return { success: true, filename };
  } catch (error) {
    console.error("Erro ao exportar banco de dados:", error);
    throw error;
  }
}

// Função para importar dados de um arquivo JSON
export async function importDatabase(filePath: string) {
  try {
    // Lê o arquivo de importação
    const fileContent = fs.readFileSync(filePath, 'utf8');
    const importData = JSON.parse(fileContent);
    
    // Verifica se o formato é válido
    if (!importData.metadata || !importData.data) {
      throw new Error('Formato de arquivo inválido');
    }
    
    // Inicia uma transação para garantir consistência
    return await db.transaction(async (tx) => {
      // Limpa tabelas existentes (ordem importa por causa de chaves estrangeiras)
      // Primeiro limpa as tabelas que fazem referência a outras (tabelas de N para 1)
      await tx.delete(ratings);
      await tx.delete(dmcaRequests);
      await tx.delete(slugHistory);
      
      // Em seguida limpa as tabelas que não tem dependentes
      await tx.delete(pdfs);
      await tx.delete(categories);
      await tx.delete(users);
      await tx.delete(seoSettings);
      await tx.delete(siteSettings);
      
      // Insere os dados na ordem correta (primeiro as tabelas-base sem relações de chave estrangeira)
      if (importData.data.users && importData.data.users.length > 0) {
        await tx.insert(users).values(importData.data.users);
      }
      
      if (importData.data.categories && importData.data.categories.length > 0) {
        await tx.insert(categories).values(importData.data.categories);
      }
      
      if (importData.data.seoSettings && importData.data.seoSettings.length > 0) {
        await tx.insert(seoSettings).values(importData.data.seoSettings);
      }
      
      if (importData.data.siteSettings && importData.data.siteSettings.length > 0) {
        await tx.insert(siteSettings).values(importData.data.siteSettings);
      }
      
      // Agora insere as tabelas que dependem de outras
      if (importData.data.pdfs && importData.data.pdfs.length > 0) {
        await tx.insert(pdfs).values(importData.data.pdfs);
      }
      
      // Por fim, insere as tabelas que têm relações com várias outras tabelas
      if (importData.data.dmcaRequests && importData.data.dmcaRequests.length > 0) {
        await tx.insert(dmcaRequests).values(importData.data.dmcaRequests);
      }
      
      if (importData.data.ratings && importData.data.ratings.length > 0) {
        await tx.insert(ratings).values(importData.data.ratings);
      }
      
      if (importData.data.slugHistory && importData.data.slugHistory.length > 0) {
        await tx.insert(slugHistory).values(importData.data.slugHistory);
      }
      
      return { success: true };
    });
  } catch (error) {
    console.error("Erro ao importar banco de dados:", error);
    throw error;
  }
}