import ky from "ky";

const faceitClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL!,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN!}`,
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
});

export default faceitClient;
