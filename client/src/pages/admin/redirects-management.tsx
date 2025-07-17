import React from "react";
import { useQuery } from "@tanstack/react-query";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { ExternalLink, Calendar, ArrowRight } from "lucide-react";
import { formatDistanceToNow } from "date-fns";
import { ptBR } from "date-fns/locale";

interface SlugRedirect {
  id: number;
  oldSlug: string;
  newSlug: string;
  pdfId: number;
  pdfTitle: string;
  createdAt: string;
  redirectUntil: string;
}

export default function RedirectsManagement() {
  const { data: redirects, isLoading } = useQuery<SlugRedirect[]>({
    queryKey: ["/api/admin/redirects"],
  });

  if (isLoading) {
    return (
      <div className="space-y-4">
        <div className="h-8 bg-dark-surface-2 rounded animate-pulse"></div>
        <div className="h-32 bg-dark-surface-2 rounded animate-pulse"></div>
      </div>
    );
  }

  const activeRedirects = redirects?.filter(redirect => 
    new Date(redirect.redirectUntil) > new Date()
  ) || [];

  const expiredRedirects = redirects?.filter(redirect => 
    new Date(redirect.redirectUntil) <= new Date()
  ) || [];

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Gerenciamento de Redirecionamentos</h2>
        <p className="text-gray-400 mt-1">
          Visualize e gerencie os redirecionamentos automáticos de URLs quando PDFs são editados
        </p>
      </div>

      {/* Estatísticas */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card className="bg-dark-surface border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Total de Redirecionamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-white">{redirects?.length || 0}</div>
          </CardContent>
        </Card>

        <Card className="bg-dark-surface border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Ativos</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-400">{activeRedirects.length}</div>
          </CardContent>
        </Card>

        <Card className="bg-dark-surface border-dark-border">
          <CardHeader className="pb-2">
            <CardTitle className="text-sm font-medium text-gray-300">Expirados</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-gray-500">{expiredRedirects.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Redirecionamentos Ativos */}
      <Card className="bg-dark-surface border-dark-border">
        <CardHeader>
          <CardTitle className="text-white">Redirecionamentos Ativos</CardTitle>
          <CardDescription>
            URLs que estão sendo redirecionadas automaticamente
          </CardDescription>
        </CardHeader>
        <CardContent>
          {activeRedirects.length === 0 ? (
            <div className="text-center py-8 text-gray-400">
              <Calendar className="w-12 h-12 mx-auto mb-4 opacity-50" />
              <p>Nenhum redirecionamento ativo no momento</p>
              <p className="text-sm mt-1">Edite um PDF para criar redirecionamentos automáticos</p>
            </div>
          ) : (
            <div className="space-y-4">
              {activeRedirects.map((redirect) => (
                <div key={redirect.id} className="bg-dark-surface-2 border border-dark-border rounded-lg p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="bg-green-500/10 text-green-400 border-green-500/20">
                          Ativo
                        </Badge>
                        <span className="text-sm text-gray-400">PDF #{redirect.pdfId}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <code className="bg-dark-surface px-2 py-1 rounded text-red-400">
                          /{redirect.oldSlug}
                        </code>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <code className="bg-dark-surface px-2 py-1 rounded text-green-400">
                          /{redirect.newSlug}
                        </code>
                      </div>
                      
                      <p className="text-white font-medium mt-2">{redirect.pdfTitle}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-400">
                        <span>
                          Criado {formatDistanceToNow(new Date(redirect.createdAt), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                        <span>
                          Expira {formatDistanceToNow(new Date(redirect.redirectUntil), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => window.open(`/${redirect.oldSlug}`, '_blank')}
                        className="border-dark-border hover:bg-dark-surface-2"
                      >
                        <ExternalLink className="w-4 h-4 mr-1" />
                        Testar
                      </Button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Redirecionamentos Expirados */}
      {expiredRedirects.length > 0 && (
        <Card className="bg-dark-surface border-dark-border">
          <CardHeader>
            <CardTitle className="text-white">Redirecionamentos Expirados</CardTitle>
            <CardDescription>
              URLs que não são mais redirecionadas automaticamente
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {expiredRedirects.map((redirect) => (
                <div key={redirect.id} className="bg-dark-surface-2 border border-dark-border rounded-lg p-4 opacity-60">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="flex items-center space-x-2 mb-2">
                        <Badge variant="outline" className="bg-gray-500/10 text-gray-400 border-gray-500/20">
                          Expirado
                        </Badge>
                        <span className="text-sm text-gray-400">PDF #{redirect.pdfId}</span>
                      </div>
                      
                      <div className="flex items-center space-x-2 text-sm">
                        <code className="bg-dark-surface px-2 py-1 rounded text-gray-400">
                          /{redirect.oldSlug}
                        </code>
                        <ArrowRight className="w-4 h-4 text-gray-500" />
                        <code className="bg-dark-surface px-2 py-1 rounded text-gray-400">
                          /{redirect.newSlug}
                        </code>
                      </div>
                      
                      <p className="text-gray-300 font-medium mt-2">{redirect.pdfTitle}</p>
                      
                      <div className="flex items-center space-x-4 mt-2 text-xs text-gray-500">
                        <span>
                          Criado {formatDistanceToNow(new Date(redirect.createdAt), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                        <span>
                          Expirou {formatDistanceToNow(new Date(redirect.redirectUntil), { 
                            addSuffix: true, 
                            locale: ptBR 
                          })}
                        </span>
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      {/* Explicação */}
      <Card className="bg-blue-500/5 border-blue-500/20">
        <CardHeader>
          <CardTitle className="text-blue-400">Como Funciona o Redirecionamento</CardTitle>
        </CardHeader>
        <CardContent className="text-sm text-gray-300 space-y-2">
          <p>• Quando você edita o título de um PDF, uma nova URL é gerada automaticamente</p>
          <p>• A URL antiga é redirecionada para a nova por 1 ano</p>
          <p>• Isso mantém os links antigos funcionando e preserva o SEO</p>
          <p>• O redirecionamento é transparente para os usuários</p>
        </CardContent>
      </Card>
    </div>
  );
}