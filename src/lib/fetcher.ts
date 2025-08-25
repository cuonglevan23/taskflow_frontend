// Standard API fetcher for the application
// Follows v1f guidelines for API layer separation

interface FetcherConfig {
  method?: 'GET' | 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  headers?: Record<string, string>;
  body?: unknown;
}

export class ApiError extends Error {
  constructor(
    message: string,
    public status: number,
    public response?: unknown
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function fetcher<T>(url: string, config: FetcherConfig = {}): Promise<T> {
  const { method = 'GET', headers = {}, body } = config;

  const requestInit: RequestInit = {
    method,
    headers: {
      'Content-Type': 'application/json',
      ...headers,
    },
  };

  if (body && method !== 'GET') {
    requestInit.body = JSON.stringify(body);
  }

  try {
    const response = await fetch(url, requestInit);

    if (!response.ok) {
      let errorMessage = `HTTP ${response.status}: ${response.statusText}`;
      let errorResponse: unknown;

      try {
        errorResponse = await response.json();
        if (errorResponse && typeof errorResponse === 'object' && 'message' in errorResponse) {
          errorMessage = (errorResponse as { message: string }).message;
        }
      } catch {
        // If response is not JSON, use the status text
      }

      throw new ApiError(errorMessage, response.status, errorResponse);
    }

    // Handle empty responses
    const contentType = response.headers.get('content-type');
    if (!contentType || !contentType.includes('application/json')) {
      return {} as T;
    }

    return response.json();
  } catch (error) {
    if (error instanceof ApiError) {
      throw error;
    }

    // Network or other errors
    throw new ApiError(
      error instanceof Error ? error.message : 'Unknown error occurred',
      0,
      error
    );
  }
}

export default fetcher;
