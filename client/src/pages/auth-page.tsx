import { useEffect } from "react";
import { useLocation, Link } from "wouter";
import { z } from "zod";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuth } from "@/hooks/use-auth";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/components/ui/form";
import { Shield, BookOpen, ExternalLink } from "lucide-react";

// Login schema
const loginSchema = z.object({
  username: z.string().min(1, "O nome de usuário é obrigatório"),
  password: z.string().min(1, "A senha é obrigatória"),
});

type LoginFormValues = z.infer<typeof loginSchema>;

export default function AuthPage() {
  const [location, navigate] = useLocation();
  const { user, loginMutation } = useAuth();
  
  // Redirect if user is already logged in
  useEffect(() => {
    if (user) {
      navigate("/admin");
    }
  }, [user, navigate]);
  
  // Login form
  const loginForm = useForm<LoginFormValues>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
    },
  });
  
  // Handle login form submission
  const onLoginSubmit = (values: LoginFormValues) => {
    loginMutation.mutate(values);
  };
  
  return (
    <div className="flex flex-col min-h-screen bg-dark-bg">
      {/* Cabeçalho para dar contexto à página */}
      <header className="py-4 px-4 sm:px-6 lg:px-8 border-b border-dark-border">
          <Link href="/">
            <a className="flex items-center gap-2 text-white hover:text-primary transition-colors">
              <BookOpen className="w-6 h-6 text-primary" />
              <span className="font-bold text-xl">Repositório de PDFs</span>
            </a>
          </Link>
      </header>

      <main className="flex flex-1 items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="w-full max-w-md">
          <Card className="bg-dark-surface border-dark-border">
            <CardHeader className="text-center">
              <div className="mx-auto mb-4 w-12 h-12 bg-primary/10 rounded-lg flex items-center justify-center">
                <Shield className="w-6 h-6 text-primary" />
              </div>
              <CardTitle className="text-2xl font-bold">
                Acesso Administrativo
              </CardTitle>
              <CardDescription className="text-gray-400">
                Esta área é restrita a administradores do site.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <Form {...loginForm}>
                <form onSubmit={loginForm.handleSubmit(onLoginSubmit)} className="space-y-6">
                  <FormField
                    control={loginForm.control}
                    name="username"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Nome de Usuário</FormLabel>
                        <FormControl>
                          <Input 
                            placeholder="Digite seu nome de usuário" 
                            {...field} 
                            className="bg-dark-surface-2 border-dark-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <FormField
                    control={loginForm.control}
                    name="password"
                    render={({ field }) => (
                      <FormItem>
                        <div className="flex justify-between items-center">
                          <FormLabel>Senha</FormLabel>
                          <a href="#" className="text-xs text-primary hover:underline">
                            Esqueceu a senha?
                          </a>
                        </div>
                        <FormControl>
                          <Input 
                            type="password" 
                            placeholder="Digite sua senha" 
                            {...field} 
                            className="bg-dark-surface-2 border-dark-border"
                          />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  {loginMutation.isError && (
                    <div className="text-center text-sm text-destructive">
                      Usuário ou senha inválidos. Tente novamente.
                    </div>
                  )}

                  <Button 
                    type="submit" 
                    className="w-full bg-primary hover:bg-primary-dark" 
                    disabled={loginMutation.isPending}
                  >
                    {loginMutation.isPending ? "Verificando..." : "Fazer Login"}
                  </Button>
                </form>
              </Form>
            </CardContent>
          </Card>
        </div>
      </main>

      {/* Rodapé com links importantes */}
      <footer className="py-4 px-4 sm:px-6 lg:px-8 text-center text-xs text-gray-500 border-t border-dark-border">
        <p className="mb-2">
          © {new Date().getFullYear()} Repositório de PDFs. Todos os direitos reservados.
        </p>
        <div className="flex justify-center gap-4">
          <a href="#" className="hover:text-primary hover:underline">Política de Privacidade</a>
          <a href="#" className="hover:text-primary hover:underline">Termos de Uso</a>
        </div>
      </footer>
    </div>
  );
}
