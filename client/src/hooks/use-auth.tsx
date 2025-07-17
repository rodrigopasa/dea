import { createContext, ReactNode, useContext, useEffect, useState } from "react";
import { useLocation } from "wouter";
import {
  useQuery,
  useMutation,
  UseMutationResult,
} from "@tanstack/react-query";
import { insertUserSchema, User as SelectUser, InsertUser } from "@shared/schema";
import { getQueryFn, apiRequest, queryClient } from "../lib/queryClient";
import { useToast } from "@/hooks/use-toast";

type AuthContextType = {
  user: SelectUser | null;
  isLoading: boolean;
  error: Error | null;
  loginMutation: UseMutationResult<SelectUser, Error, LoginData>;
  logoutMutation: UseMutationResult<void, Error, void>;
};

type LoginData = Pick<InsertUser, "username" | "password">;

export const AuthContext = createContext<AuthContextType | null>(null);
export function AuthProvider({ children }: { children: ReactNode }) {
  const { toast } = useToast();
  const [location, navigate] = useLocation();
  const {
    data: user,
    error,
    isLoading,
    refetch
  } = useQuery<SelectUser | null, Error>({
    queryKey: ["/api/user"],
    queryFn: getQueryFn({ on401: "returnNull" }),
  });
  
  // Efeito para redirecionar o usuário após login bem-sucedido
  useEffect(() => {
    if (user && location === "/entrar") {
      navigate("/admin");
    }
  }, [user, location, navigate]);

  const loginMutation = useMutation({
    mutationFn: async (credentials: LoginData) => {
      console.log("Enviando requisição:", {
        method: "POST",
        endpoint: "/api/login",
        hasBody: !!credentials
      });
      
      const response = await fetch("/api/login", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        credentials: "include",
        body: JSON.stringify(credentials),
      });
      
      if (!response.ok) {
        const errorData = await response.json().catch(() => ({ error: "Login failed" }));
        throw new Error(errorData.error || "Credenciais inválidas");
      }
      
      const result = await response.json();
      return result.user;
    },
    onSuccess: (user: SelectUser) => {
      queryClient.setQueryData(["/api/user"], user);
      refetch();
      toast({
        title: "Login realizado com sucesso",
        description: `Bem-vindo, ${user.username}!`,
      });
      navigate("/admin");
    },
    onError: (error: Error) => {
      console.error("Erro de login:", error);
      toast({
        title: "Falha no login",
        description: error.message || "Credenciais inválidas. Verifique usuário e senha.",
        variant: "destructive",
      });
    },
  });



  const logoutMutation = useMutation({
    mutationFn: async () => {
      try {
        await apiRequest("POST", "/api/logout");
      } catch (error) {
        // Mesmo se a API falhar, continua com o logout local
        console.warn("Logout API failed, proceeding with local logout:", error);
      }
    },
    onSuccess: () => {
      // Limpa os dados do usuário primeiro
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear(); // Limpa todo o cache
      
      toast({
        title: "Logout concluído",
        description: "Você foi desconectado com sucesso.",
      });
    },
    onError: (error: Error) => {
      // Mesmo com erro, limpa o estado local
      queryClient.setQueryData(["/api/user"], null);
      queryClient.clear();
      
      toast({
        title: "Logout realizado",
        description: "Sessão finalizada localmente.",
        variant: "default",
      });
    },
  });

  return (
    <AuthContext.Provider
      value={{
        user: user ?? null,
        isLoading,
        error,
        loginMutation,
        logoutMutation,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
