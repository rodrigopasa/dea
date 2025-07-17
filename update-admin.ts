#!/usr/bin/env tsx
import { hashPassword } from './server/auth.js';
import { eq } from 'drizzle-orm';
import { db } from './server/db.js';
import { users } from './shared/schema.js';

async function updateAdminCredentials() {
  try {
    console.log('🔐 Atualizando credenciais do admin...');
    
    const newPassword = 'Fudencio992#';
    const newUsername = 'Hisoka';
    
    // Gerar hash da nova senha
    const hashedPassword = await hashPassword(newPassword);
    console.log('✅ Hash da senha gerado');
    
    // Atualizar no banco
    const result = await db.update(users)
      .set({
        username: newUsername,
        password: hashedPassword,
        name: 'Admin Hisoka',
        email: 'admin@pdfxandria.com'
      })
      .where(eq(users.isAdmin, true))
      .returning();
    
    if (result.length > 0) {
      console.log('✅ Credenciais atualizadas com sucesso!');
      console.log('📋 Novas credenciais:');
      console.log(`   Usuário: ${newUsername}`);
      console.log(`   Senha: ${newPassword}`);
      console.log('');
      console.log('🔗 Acesse: /admin para fazer login');
    } else {
      console.log('❌ Nenhum usuário admin encontrado para atualizar');
    }
    
    process.exit(0);
  } catch (error) {
    console.error('❌ Erro ao atualizar credenciais:', error);
    process.exit(1);
  }
}

updateAdminCredentials();