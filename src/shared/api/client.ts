import { API_BASE_URL } from "@shared/api/endpoints";

type Primitive = string | number | boolean;
type QueryValue = Primitive | null | undefined;
type QueryParams = Record<string, QueryValue>;

interface RequestConfig extends Omit<RequestInit, "body"> {
  params?: QueryParams;
  body?: unknown;
  timeoutMs?: number;
}

/**
 * 네트워크 오류를 구분하기 위한 공통 API 에러 객체.
 */
export class ApiError extends Error {
  status: number;
  payload?: unknown;

  /**
   * HTTP 상태코드와 서버 응답을 포함한 에러를 생성한다.
   */
  constructor(message: string, status: number, payload?: unknown) {
    super(message);
    this.name = "ApiError";
    this.status = status;
    this.payload = payload;
  }
}

/**
 * undefined/null 값을 제외하고 URL query string을 생성한다.
 */
const buildQueryString = (params?: QueryParams): string => {
  if (!params) return "";

  const searchParams = new URLSearchParams();
  Object.entries(params).forEach(([key, value]) => {
    if (value === undefined || value === null) return;
    searchParams.append(key, String(value));
  });

  const query = searchParams.toString();
  return query ? `?${query}` : "";
};

/**
 * 상대 경로(`/api/*` 프록시)면 API_BASE_URL을 붙인다.
 *
 * 프록시 전용 구조이므로 상대 경로인데 API_BASE_URL이 비어 있으면
 * 잘못된 요청 URL이 되어 원인 파악이 어렵다. 이 경우 즉시 명확한 에러를 던진다.
 */
const resolveUrl = (path: string, params?: QueryParams): string => {
  const isAbsolute = /^https?:\/\//i.test(path);
  if (!isAbsolute && !API_BASE_URL) {
    throw new ApiError(
      "EXPO_PUBLIC_API_BASE_URL is not set — proxy(/api/*) 요청을 보낼 수 없습니다.",
      0,
    );
  }
  const base = isAbsolute ? path : `${API_BASE_URL}${path}`;
  return `${base}${buildQueryString(params)}`;
};

/**
 * fetch 응답 본문을 JSON 우선으로 파싱한다.
 */
const parseResponsePayload = async (response: Response): Promise<unknown> => {
  const contentType = response.headers.get("content-type") ?? "";

  if (contentType.includes("application/json")) {
    return response.json();
  }

  const text = await response.text();
  return text.length ? text : null;
};

/**
 * 모든 API 요청의 공통 처리(타임아웃, 헤더, 에러 파싱)를 담당한다.
 */
export const request = async <T>(
  path: string,
  config: RequestConfig = {},
): Promise<T> => {
  const { params, body, timeoutMs = 10000, headers, ...rest } = config;
  const url = resolveUrl(path, params);

  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeoutMs);

  try {
    const response = await fetch(url, {
      ...rest,
      headers: {
        Accept: "application/json",
        // 웹 BFF(`/api/restaurants` 등)가 이미지 등 리소스를 절대 URL로 내려주도록
        // RN 클라이언트임을 알린다. (웹 라우트의 `X-Client: rn` 옵트인 계약)
        "X-Client": "rn",
        ...(body !== undefined ? { "Content-Type": "application/json" } : {}),
        ...headers,
      },
      body: body !== undefined ? JSON.stringify(body) : undefined,
      signal: controller.signal,
    });

    const payload = await parseResponsePayload(response);

    if (!response.ok) {
      throw new ApiError(
        `API request failed: ${response.status} ${response.statusText}`,
        response.status,
        payload,
      );
    }

    return payload as T;
  } catch (error) {
    if (error instanceof ApiError) throw error;
    if (error instanceof Error && error.name === "AbortError") {
      throw new ApiError("API request timeout", 408);
    }
    throw new ApiError("Network request failed", 0, error);
  } finally {
    clearTimeout(timer);
  }
};

/**
 * GET 요청 전용 헬퍼.
 */
export const get = async <T>(
  path: string,
  config: Omit<RequestConfig, "method" | "body"> = {},
): Promise<T> => {
  return request<T>(path, { ...config, method: "GET" });
};

/**
 * POST 요청 전용 헬퍼.
 */
export const post = async <TResponse, TBody = unknown>(
  path: string,
  body?: TBody,
  config: Omit<RequestConfig, "method" | "body"> = {},
): Promise<TResponse> => {
  return request<TResponse>(path, {
    ...config,
    method: "POST",
    body,
  });
};
