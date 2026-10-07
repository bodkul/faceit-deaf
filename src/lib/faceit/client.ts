import ky from "ky";
import pThrottle from "p-throttle";

const throttle = pThrottle({ limit: 10, interval: 1000 });

const faceitClient = ky.create({
  prefix: "https://open.faceit.com/data/v4",
  headers: {
    Authorization: `Bearer ${process.env.FACEIT_API_TOKEN}`,
  },
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

export default faceitClient;
