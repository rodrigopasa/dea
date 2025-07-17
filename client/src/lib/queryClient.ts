import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    // Tentar obter uma mensagem de erro JSON primeiro
    try {
      const errorData = await res.json();
      const errorMessage = errorData.message || errorData.error || res.statusText;
      
      // Verificar se é um erro de permissão
      if (res.status === 403 && errorData.requiresUpgrade) {
        throw new Error('upgrade_required');
      }
      
      throw new Error(errorMessage);
    } catch (jsonError) {
      // Se não for possível obter JSON, use o texto da resposta
      const text = await res.text();
      throw new Error(`${res.status}: ${text || res.statusText}`);
    }
  }
}

export async function apiRequest<T = any>(
  methodOrEndpoint: string,
  endpointOrOptions?: string | RequestInit,
  bodyOrUndefined?: any,
  extraOptions?: { formData?: FormData }
): Promise<any> {
  let method = "GET";
  let endpoint = "";
  let options: RequestInit = {};

  // Verifica se estamos enviando um FormData
  if (extraOptions?.formData) {
    method = methodOrEndpoint;
    endpoint = endpointOrOptions as string;
    options = {
      method,
      body: extraOptions.formData,
      // Não adicione Content-Type para FormData - o navegador definirá com boundary correto
    };
  }
  // Verifica o formato dos argumentos padrão
  else if (endpointOrOptions === undefined) {
    // apiRequest(endpoint)
    endpoint = methodOrEndpoint;
  } else if (typeof endpointOrOptions === "string") {
    // apiRequest(method, endpoint, body?)
    method = methodOrEndpoint;
    endpoint = endpointOrOptions;
    if (bodyOrUndefined) {
      options = {
        method,
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(bodyOrUndefined),
      };
    } else {
      options = { method };
    }
  } else {
    // apiRequest(endpoint, options)
    endpoint = methodOrEndpoint;
    options = endpointOrOptions;
  }

  console.log("Enviando requisição:", {
    method: options.method || "GET",
    endpoint,
    hasBody: !!options.body
  });

  const res = await fetch(endpoint, {
    credentials: "include",
    ...options
  });

  await throwIfResNotOk(res);
  
  // Corrigido o erro "body stream already read" verificando o método
  // Não tente ler o corpo da resposta para métodos como HEAD ou se houver redirecionamento
  if (method === "HEAD" || res.redirected) {
    return { success: true, redirected: res.redirected, url: res.url };
  }
  
  // Clona a resposta antes de tentar ler o corpo, para evitar o erro "body stream already read"
  const resClone = res.clone();
  
  // Para requisições HTTP padrão, tente converter para JSON, se falhar retorne o objeto Response
  try {
    const data = await resClone.json();
    return data;
  } catch (e) {
    // Se não for possível converter para JSON, retorna um objeto simples
    return { success: true, status: res.status, statusText: res.statusText };
  }
}

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    const res = await fetch(queryKey[0] as string, {
      credentials: "include",
    });

    if (unauthorizedBehavior === "returnNull" && res.status === 401) {
      return null;
    }

    await throwIfResNotOk(res);
    
    // Clona a resposta antes de tentar ler o corpo, para evitar o erro "body stream already read"
    const resClone = res.clone();
    try {
      return await resClone.json();
    } catch (e) {
      // Se não for possível converter para JSON, retorna um objeto simples
      return { success: true, status: res.status, statusText: res.statusText };
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: 300000, // 5 minutos em vez de Infinity para permitir refetch automático em tempo razoável
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});
