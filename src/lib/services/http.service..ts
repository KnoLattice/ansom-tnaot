import axios, {
  AxiosInstance,
  AxiosRequestConfig,
  AxiosResponse,
  HttpStatusCode,
} from "axios";
import { IParams } from "../types";
import { HTTP_SERVICE_METHOD as HttpMethod } from "../types/enums/service.enum";

interface ApiError extends Error {
  status?: number;
  code?: string;
  details?: unknown;
}

type UploadMeta = {
  file?: File | Blob;
  fileName?: string;
  fileSize?: number;
};

class HttpService {
  http: AxiosInstance;
  baseUrl: string = process.env.NEXT_PUBLIC_API_URL!;
  private interceptorsInjected = false;

  constructor() {
    this.http = axios.create({
      baseURL: this.baseUrl,
      timeout: 30000,
      withCredentials: true,
      headers: this.headers(),
    });

    this.injectInterceptors();
  }

  public async get<T>(url: string, params?: IParams): Promise<T> {
    return this.request<T>(HttpMethod.GET, url, { params });
  }

  public async post<T, P>(
    url: string,
    payload: P,
    params?: IParams,
  ): Promise<T> {
    return this.request<T>(HttpMethod.POST, url, {
      data: payload,
      params,
    });
  }

  public async put<T, P>(
    url: string,
    payload?: P,
    params?: IParams,
  ): Promise<T> {
    return this.request<T>(HttpMethod.PUT, url, {
      data: payload,
      params,
    });
  }

  public async patch<T, P>(
    url: string,
    payload?: P,
    params?: IParams,
  ): Promise<T> {
    return this.request<T>(HttpMethod.PATCH, url, {
      data: payload,
      params,
    });
  }

  public async delete<T>(url: string, params?: IParams): Promise<T> {
    return this.request<T>(HttpMethod.DELETE, url, { params });
  }

  private async request<T>(
    method: HttpMethod,
    url: string,
    options: AxiosRequestConfig = {},
  ): Promise<T> {
    try {
      const cleanUrl = url.replace(/([^:])\/+/g, "$1/");
      const uploadMeta = this.extractUploadMeta(options.data);

      if (uploadMeta) {
        (options as ExplicitAny).__uploadMeta = uploadMeta;
        options.headers = {
          ...options.headers,
          "Content-Type": "multipart/form-data",
        };
      }

      const response: AxiosResponse<T> = await this.http.request<T>({
        method,
        url: cleanUrl,
        ...options,
      });

      return response.data;
    } catch (error) {
      this.normalizeError(error);
    }
  }

  private headers() {
    return {
      "Content-Type": "application/json",
    };
  }

  private injectInterceptors() {
    if (this.interceptorsInjected) return;
    this.interceptorsInjected = true;

    this.http.interceptors.request.use((config) => {
      const token = localStorage.getItem("access_token");

      if (token) {
        config.headers = config.headers ?? {};
        config.headers.Authorization = `Bearer ${token}`;
      }

      return config;
    });

    this.http.interceptors.response.use(
      (response) => response,
      (error) => {
        const { response } = error;

        if (response?.status === HttpStatusCode.Unauthorized) {
          localStorage.removeItem("access_token");
        }

        return Promise.reject(error);
      },
    );
  }

  private extractUploadMeta(data: unknown): UploadMeta | null {
    if (typeof FormData === "undefined" || !(data instanceof FormData)) {
      return null;
    }

    let file: File | Blob | undefined;
    let fileName: string | undefined;
    let fileSize: number | undefined;

    data.forEach((value: ExplicitAny, key) => {
      if (file) return;

      if (value instanceof File || value instanceof Blob) {
        file = value;
        fileName = value instanceof File ? value.name : key;
        fileSize = value.size;
      }
    });

    return file ? { file, fileName, fileSize } : null;
  }

  private normalizeError(error: unknown): never {
    if (axios.isAxiosError(error)) {
      const apiError: ApiError = new Error(
        error.response?.data?.message || "Unexpected error",
      );

      apiError.status = error.response?.status;
      apiError.code = error.code;
      apiError.details = error.response?.data;

      switch (error.response?.status) {
        case HttpStatusCode.BadRequest:
          apiError.message = error.response?.data?.message || "Invalid request";
          break;
        case HttpStatusCode.Unauthorized:
          apiError.message = "Unauthorized";
          break;
        case HttpStatusCode.Forbidden:
          apiError.message = "Forbidden";
          break;
        case HttpStatusCode.NotFound:
          apiError.message = "Resource not found";
          break;
        case HttpStatusCode.InternalServerError:
          apiError.message = "Server error";
          break;
      }

      throw apiError;
    }

    throw new Error(error instanceof Error ? error.message : "Unknown error");
  }
}

export { HttpService };
