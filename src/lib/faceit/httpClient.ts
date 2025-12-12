import type { HttpClient, HttpRequestConfig } from "faceit-sdk";
import ky from "ky";
import pThrottle from "p-throttle";

const throttle = pThrottle({ limit: 10, interval: 1000 });

const faceitClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL!,
  headers: { Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN!}` },
  hooks: {
    beforeRetry: [
      ({ request, error, retryCount }) => {
        console.warn(
          `Retrying request to ${request.url}. Attempt #${retryCount}. Error: ${error.message}`,
        );
      },
    ],
    beforeRequest: [
      (request, options) => {
        if (request.url.startsWith("/"))
          options.prefixUrl = options.prefixUrl?.replace(/\/$/, "");
      },
    ],
  },
  fetch: (...args) => throttle(() => fetch(...args))(),
});

const cleanUrl = (url: string) => (url.startsWith("/") ? url.slice(1) : url);

export const httpClient: HttpClient = {
  async get<T>(url: string, config?: HttpRequestConfig) {
    const response = await faceitClient.get(cleanUrl(url), {
      searchParams: config?.params,
    });
    const data = await response.json<T>();
    return {
      data,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };
  },
  async post<T>(
    url: string,
    data?: BodyInit | null,
    config?: HttpRequestConfig,
  ) {
    const response = await faceitClient.post(cleanUrl(url), {
      searchParams: config?.params,
      body: data,
    });
    const json = await response.json<T>();
    return {
      data: json,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };
  },
};
