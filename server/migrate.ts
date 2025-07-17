import { db } from './db';
import { users, categories } from '@shared/schema';
import { hashPassword } from './auth';
import { eq } from 'drizzle-orm';

// Create admin user
export async function createAdminUser() {
  try {
    const existingUser = await db.select().from(users).where(eq(users.username, 'Hisoka'));
    
    if (existingUser.length === 0) {
      const hashedPassword = await hashPassword('Fudencio992#');
      await db.insert(users).values({
        username: 'Hisoka',
        password: hashedPassword,
        isAdmin: true,
        name: 'Admin Hisoka',
        email: 'admin@pdfxandria.com'
      });
      console.log('Admin user "Hisoka" created successfully');
    } else {
      console.log('Admin user "Hisoka" already exists');
    }
  } catch (error) {
    console.error('Error creating admin user:', error);
  }
}

// Create default categories
export async function createDefaultCategories() {
  try {
    const defaultCategories = [
      { name: 'General', slug: 'general', icon: 'folder', color: '#4f46e5' },
      { name: 'Education', slug: 'education', icon: 'book', color: '#10b981' },
      { name: 'Business', slug: 'business', icon: 'briefcase', color: '#f59e0b' },
      { name: 'Technology', slug: 'technology', icon: 'computer', color: '#8b5cf6' },
      { name: 'Science', slug: 'science', icon: 'beaker', color: '#06b6d4' },
      { name: 'Literature', slug: 'literature', icon: 'library', color: '#ef4444' },
      { name: 'Research', slug: 'research', icon: 'search', color: '#84cc16' },
      { name: 'Manuals', slug: 'manuals', icon: 'settings', color: '#6b7280' }
    ];

    for (const category of defaultCategories) {
      const existing = await db.select().from(categories).where(eq(categories.slug, category.slug));
      
      if (existing.length === 0) {
        await db.insert(categories).values(category);
        console.log(`Category '${category.name}' created`);
      }
    }
    
    console.log('Default categories setup completed');
  } catch (error) {
    console.error('Error creating default categories:', error);
  }
}