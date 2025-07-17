import { useQuery } from '@tanstack/react-query';
import { apiRequest } from './queryClient';

/**
 * Verifica se o usuário atual é um administrador
 * @returns Verdadeiro se o usuário for administrador
 */
export function isAdmin(): boolean {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => await apiRequest('/api/user'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (isLoading || isError || !user) {
    return false;
  }

  return !!user.isAdmin;
}

/**
 * Verifica se o usuário está autenticado
 * @returns Verdadeiro se o usuário estiver autenticado
 */
export function isAuthenticated(): boolean {
  const { data: user, isLoading, isError } = useQuery({
    queryKey: ['/api/user'],
    queryFn: async () => await apiRequest('/api/user'),
    retry: false,
    staleTime: 5 * 60 * 1000, // 5 minutos
  });

  if (isLoading || isError || !user) {
    return false;
  }

  return true;
}