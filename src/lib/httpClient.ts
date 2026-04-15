import { logger } from './logger';
import { API_BASE_URL, getAuthToken } from './env';

export { API_BASE_URL };

type ApiErrorBody = {
  success?: boolean;
  message?: string;
  error?: string;
  errors?: string[] | Record<string, unknown>;
};

const isRecord = (value: unknown): value is Record<string, unknown> => (
  typeof value === 'object' && value !== null
);

const getStoredToken = (): string | null => {
  return getAuthToken();
};

const setStoredToken = (token: string | null): void => {
  if (typeof localStorage === 'undefined') {
    return;
  }

  if (token) {
    localStorage.setItem('token', token);
  } else {
    localStorage.removeItem('token');
  }
};

const parseResponseBody = async (response: Response): Promise<unknown> => {
  if (response.status === 204) {
    return null;
  }

  const contentType = response.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return response.json();
  }

  const text = await response.text();
  return text ? { message: text } : null;
};

const resolveErrorMessage = (data: unknown, fallback: string): string => {
  if (!isRecord(data)) {
    return fallback;
  }

  const body = data as ApiErrorBody;
  if (body.message) {
    return body.message;
  }

  if (body.error) {
    return body.error;
  }

  if (Array.isArray(body.errors) && body.errors.length > 0) {
    return body.errors.join(', ');
  }

  return fallback;
};

export class ApiRequestError extends Error {
  status?: number;
  endpoint: string;
  payload: unknown;

  constructor(message: string, endpoint: string, status?: number, payload?: unknown) {
    super(message);
    this.name = 'ApiRequestError';
    this.status = status;
    this.endpoint = endpoint;
    this.payload = payload;
  }
}

export class HttpClient {
  protected readonly baseURL: string;
  protected token: string | null;

  constructor(baseURL: string) {
    this.baseURL = baseURL;
    this.token = getStoredToken();
  }

  updateToken(token: string | null): void {
    this.token = token;
    setStoredToken(token);
  }

  logout(): void {
    this.updateToken(null);
  }

  protected async request<T>(
    endpoint: string,
    options: RequestInit = {}
  ): Promise<T> {
    const url = `${this.baseURL}${endpoint}`;
    const isFormData = typeof FormData !== 'undefined' && options.body instanceof FormData;

    const headers: HeadersInit = {
      ...(isFormData ? {} : { 'Content-Type': 'application/json' }),
      ...options.headers,
    };

    if (this.token) {
      (headers as Record<string, string>).Authorization = `Bearer ${this.token}`;
      logger.debug(`API Request to ${endpoint} with token`, { token: `${this.token.substring(0, 20)}...` });
    } else {
      logger.debug(`API Request to ${endpoint} without token`);
    }

    try {
      const response = await fetch(url, {
        ...options,
        headers,
      });

      const data = await parseResponseBody(response);

      if (!response.ok) {
        logger.error(`API Error for ${endpoint}`, data);
        throw new ApiRequestError(
          resolveErrorMessage(data, `HTTP error! status: ${response.status}`),
          endpoint,
          response.status,
          data
        );
      }

      if (isRecord(data) && data.success === false) {
        logger.error(`API Error for ${endpoint}`, data);
        throw new ApiRequestError(resolveErrorMessage(data, 'Request failed'), endpoint, response.status, data);
      }

      logger.debug(`API Success for ${endpoint}`, data);
      return data as T;
    } catch (error) {
      logger.error('API request failed', error);
      throw error;
    }
  }
}
