import { Link, useLocation } from 'wouter';
import {
  Sidebar,
  SidebarHeader,
  SidebarContent,
  SidebarFooter
} from './ui/sidebar';
import { Button } from './ui/button';
import { cn } from '@/lib/utils';
import { useQuery } from '@tanstack/react-query';
import { apiRequest } from '@/lib/queryClient';

interface AdminLayoutProps {
  children: React.ReactNode;
}

export function AdminLayout({ children }: AdminLayoutProps) {
  const [location] = useLocation();
  
  // Buscar informações do usuário
  const { data: user } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => await apiRequest('/api/user')
  });

  // Verificar se o usuário é administrador
  if (!user?.isAdmin) {
    return (
      <div className="flex items-center justify-center min-h-screen p-4">
        <div className="text-center max-w-md">
          <h1 className="text-xl font-bold mb-2">Acesso Restrito</h1>
          <p className="mb-4">Esta área é restrita a administradores.</p>
          <Link href="/">
            <Button>Voltar para a página inicial</Button>
          </Link>
        </div>
      </div>
    );
  }

  // Links do menu administrativo
  const menuItems = [
    { path: '/admin', label: 'Dashboard', exact: true },
    { path: '/admin/users', label: 'Usuários' },
    { path: '/admin/pdfs', label: 'PDFs' },
    { path: '/admin/categories', label: 'Categorias' },
    { path: '/admin/plans', label: 'Planos de Assinatura' },
    { path: '/admin/payments', label: 'Pagamentos' },
    { path: '/admin/dmca', label: 'Solicitações DMCA' },
    { path: '/admin/settings', label: 'Configurações' },
  ];

  return (
    <div className="flex min-h-screen">
      <Sidebar className="w-64 border-r bg-card">
        <SidebarHeader className="p-4 border-b">
          <h1 className="text-xl font-bold">Admin</h1>
        </SidebarHeader>
        
        <SidebarContent className="py-4">
          <nav>
            <ul className="space-y-1">
              {menuItems.map((item) => {
                const isActive = item.exact 
                  ? location === item.path 
                  : location.startsWith(item.path);
                
                return (
                  <li key={item.path}>
                    <Link href={item.path}>
                      <a className={cn(
                        "block px-4 py-2 text-sm rounded-md",
                        isActive 
                          ? "bg-primary text-primary-foreground font-medium" 
                          : "text-muted-foreground hover:bg-secondary transition-colors"
                      )}>
                        {item.label}
                      </a>
                    </Link>
                  </li>
                );
              })}
            </ul>
          </nav>
        </SidebarContent>
        
        <SidebarFooter className="p-4 border-t">
          <div className="flex items-center justify-between">
            <span className="text-sm">{user?.username}</span>
            <Link href="/">
              <Button variant="ghost" size="sm">Sair</Button>
            </Link>
          </div>
        </SidebarFooter>
      </Sidebar>
      
      <main className="flex-1 overflow-auto">
        {children}
      </main>
    </div>
  );
}