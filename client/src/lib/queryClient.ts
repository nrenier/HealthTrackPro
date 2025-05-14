import { QueryClient, QueryFunction } from "@tanstack/react-query";

async function throwIfResNotOk(res: Response) {
  if (!res.ok) {
    const text = (await res.text()) || res.statusText;
    throw new Error(`${res.status}: ${text}`);
  }
}

export const apiRequest = (method: string, endpoint: string, data?: any) => {
  const url = `${import.meta.env.VITE_API_BASE_URL || ''}${endpoint}`;

  return fetch(url, {
    method,
    headers: {
      'Content-Type': 'application/json',
    },
    credentials: 'include',
    body: data ? JSON.stringify(data) : undefined,
  }).then(res => {
    if (!res.ok) {
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
      const res = await fetch(queryKey[0] as string, {
        credentials: "include",
      });

      if (unauthorizedBehavior === "returnNull" && res.status === 401) {
        return null;
      }

      if (!res.ok) {
        const error: any = new Error(`API request failed: ${res.statusText}`);
        error.status = res.status;
        throw error;
      }

      return await res.json();
    } catch (err: any) {
      // Gestisci e propaghi l'errore con informazioni aggiuntive
      if (!err.status && err.message) {
        err.status = 500;
      }
      throw err;
    }
  };

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      queryFn: getQueryFn({ on401: "throw" }),
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