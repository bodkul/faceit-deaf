import ky from "ky";
import createClient from "openapi-fetch";
import pThrottle from "p-throttle";

import type { paths } from "./openapi";

const throttle = pThrottle({ limit: 10, interval: 1000 });

// ky only retries on an HTTPError, so it must keep throwing them: with
// `throwHttpErrors: false` 429/5xx responses would never be retried.
const http = ky.create({
  hooks: {
    beforeRetry: [
      ({ request, error, retryCount }) => {
        console.warn(
          `Retrying request to ${request.url}. Attempt #${retryCount}. Error: ${error.message}`,
        );
      },
    ],
  },
  fetch: (...args) => throttle(() => fetch(...args))(),
});

/**
 * Typed client for the FACEIT Data API v4. Failed requests reject with ky's
 * HTTPError after its retries, so a resolved result always carries `data`.
 */
export const faceit = createClient<paths>({
  baseUrl: "https://open.faceit.com/data/v4",
  headers: { Authorization: `Bearer ${process.env.FACEIT_API_TOKEN}` },
  fetch: (request) => http(request),
});
