#!/usr/bin/env tsx
import { createAdminUser, createDefaultCategories } from './server/migrate.js';

async function initializeDatabase() {
  try {
    console.log('🚀 Inicializando banco de dados...');
    
    console.log('📝 Criando usuário admin...');
    await createAdminUser();
    
    console.log('📁 Criando categorias padrão...');
    await createDefaultCategories();
    
    console.log('✅ Inicialização do banco concluída com sucesso!');
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro na inicialização do banco:', error);
    process.exit(1);
  }
}

initializeDatabase();