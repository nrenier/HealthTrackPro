import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const apiRequest = (method: string, endpoint: string, data?: any) => {
  const url = `${import.meta.env.VITE_API_BASE_URL || ''}${endpoint}`;
  console.log(`API Request: ${method} ${url}`);

  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  }).then(res => {
    if (!res.ok) {
      console.error(`API error: ${res.status} ${res.statusText}`);
      const error: any = new Error(`API request failed: ${res.statusText}`);
      error.status = res.status;
      throw error;
    }
    return res;
  });
};

type UnauthorizedBehavior = "returnNull" | "throw";
export const getQueryFn: <T>(options: {
  on401: UnauthorizedBehavior;
}) => QueryFunction<T> =
  ({ on401: unauthorizedBehavior }) =>
  async ({ queryKey }) => {
    try {
      const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
      const url = `${baseUrl}${queryKey[0]}`;
      console.log(`Query: GET ${url}`);

      const res = await fetch(url, {
        credentials: "include",
      });

      // Gestisci risposte speciali
      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      // 404 per ricerche di date è un caso normale
      if (res.status === 404 && url.includes('/api/diary/')) {
        console.log('Diary entry not found, returning null');
        return null;
      }

      if (!res.ok) {
        console.error(`Query error: ${res.status} ${res.statusText} for ${url}`);
        const error: any = new Error(`API request failed: ${res.statusText}`);
        error.status = res.status;
        throw error;
      }

      const data = await res.json();
      return data;
    } catch (err: any) {
      // Gestisci e propaghi l'errore con informazioni aggiuntive
      if (!err.status && err.message) {
        err.status = 500;
      }
      console.error('Query execution error:', err);
      throw err;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ 
        on401: "throw",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          "Accept": "application/json"
        }
      }),
      refetchInterval: false,
      refetchOnWindowFocus: false,
      staleTime: Infinity,
      retry: false,
    },
    mutations: {
      retry: false,
    },
  },
});