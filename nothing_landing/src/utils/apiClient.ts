interface ApiError extends Error {
  status: number;
  payload?: any;
}

interface RequestOptions {
  headers?: Record<string, string>;
  signal?: AbortSignal;
}

const DEFAULT_HEADERS = {
  'Content-Type': 'application/json',
};

class ApiClientError extends Error implements ApiError {
  constructor(
    message: string,
    public status: number,
    public payload?: any
  ) {
    super(message);
    this.name = 'ApiClientError';
  }
}

async function handleResponse<T>(response: Response): Promise<T> {
  const contentType = response.headers.get('content-type');
  const isJson = contentType?.includes('application/json');
  
  let payload: any;
  try {
    payload = isJson ? await response.json() : await response.text();
  } catch {
    payload = null;
  }

  if (!response.ok) {
    const errorMessage = isJson && payload?.message 
      ? payload.message 
      : `HTTP ${response.status}: ${response.statusText}`;
    
    throw new ApiClientError(errorMessage, response.status, payload);
  }

  return payload as T;
}

export async function get<T = any>(
  url: string, 
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, signal } = options;
  
  const response = await fetch(`/api${url}`, {
    method: 'GET',
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    signal,
  });

  return handleResponse<T>(response);
}

export async function post<T = any>(
  url: string, 
  body?: any, 
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, signal } = options;
  
  const response = await fetch(`/api${url}`, {
    method: 'POST',
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  return handleResponse<T>(response);
}

export async function put<T = any>(
  url: string, 
  body?: any, 
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, signal } = options;
  
  const response = await fetch(`/api${url}`, {
    method: 'PUT',
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    body: body ? JSON.stringify(body) : undefined,
    signal,
  });

  return handleResponse<T>(response);
}

export async function del<T = any>(
  url: string, 
  options: RequestOptions = {}
): Promise<T> {
  const { headers = {}, signal } = options;
  
  const response = await fetch(`/api${url}`, {
    method: 'DELETE',
    headers: {
      ...DEFAULT_HEADERS,
      ...headers,
    },
    signal,
  });

  return handleResponse<T>(response);
}

// Export the error class for use in services
export { ApiClientError };
export type { ApiError, RequestOptions };
