#!/usr/bin/env node

/**
 * Script de inicialização do banco de dados
 * Garante que o schema seja criado antes da aplicação iniciar
 */

import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

async function setupDatabase() {
  console.log('🔄 Inicializando setup do banco de dados...');
  
  try {
    // Verifica se DATABASE_URL está configurada
    if (!process.env.DATABASE_URL) {
      console.error('❌ DATABASE_URL não encontrada');
      console.error('   Certifique-se de que o banco PostgreSQL está provisionado');
      return false;
    }
    
    console.log('✅ DATABASE_URL configurada');
    
    // Executa db:push para criar/atualizar schema
    console.log('📋 Sincronizando schema do banco...');
    const { stdout, stderr } = await execAsync('npm run db:push');
    
    if (stderr && !stderr.includes('No config path provided')) {
      console.warn('⚠️ Avisos do db:push:', stderr);
    }
    
    console.log('✅ Schema do banco sincronizado com sucesso');
    return true;
    
  } catch (error) {
    console.error('❌ Erro durante setup do banco:', error.message);
    console.error('   A aplicação continuará, mas pode não funcionar corretamente');
    return false;
  }
}

// Executa setup se chamado diretamente
if (import.meta.url === `file://${process.argv[1]}`) {
  setupDatabase()
    .then((success) => {
      if (success) {
        console.log('🎉 Setup do banco concluído com sucesso!');
        process.exit(0);
      } else {
        console.log('⚠️ Setup do banco falhou, mas aplicação pode continuar');
        process.exit(1);
      }
    })
    .catch((error) => {
      console.error('💥 Erro crítico no setup:', error);
      process.exit(1);
    });
}

export { setupDatabase };