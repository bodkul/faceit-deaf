import {
  createFaceitSDK,
  type HttpClient,
  type HttpRequestConfig,
} from "faceit-sdk";

import faceitClient from "./client";

const httpClient: HttpClient = {
  async get<T>(url: string, config?: HttpRequestConfig) {
    const response = await faceitClient.get(url.replace(/^\//, ""), {
      headers: {
        ...config?.headers,
      },
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
    const response = await faceitClient.post(url.replace(/^\//, ""), {
      headers: {
        ...config?.headers,
      },
      searchParams: config?.params,
      body: data,
    });
    const responseData = await response.json<T>();
    return {
      data: responseData,
      status: response.status,
      statusText: response.statusText,
      headers: Object.fromEntries(response.headers.entries()),
    };
  },
};

const faceitSdk = createFaceitSDK(httpClient);

export { faceitClient, faceitSdk };
