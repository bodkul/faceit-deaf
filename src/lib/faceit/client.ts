import ky from "ky";

const faceitClient = ky.create({
  prefixUrl: process.env.NEXT_PUBLIC_API_URL!,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN!}`,
  },
  hooks: {
    afterResponse: [
      async (request, options, response) => {
        if (!response.ok) {
          console.error(
            `Error fetching data from ${request.url}: ${response.status} ${response.statusText}`,
          );
        }
      },
    ],
  },
});

export default faceitClient;
