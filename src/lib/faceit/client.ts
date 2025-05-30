import axios from "axios";

const faceitClient = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL!,
  headers: {
    Authorization: `Bearer ${process.env.NEXT_PUBLIC_API_TOKEN!}`,
  },
});

faceitClient.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response) {
      console.error(
        `Error fetching data from ${error.config.url}: ${error.response.status} ${error.response.statusText}`,
      );
    } else if (error.request) {
      console.error(
        `Error in request to ${error.config.url}: ${error.message}`,
      );
    } else {
      console.error(`Error: ${error.message}`);
    }
    return Promise.reject(error);
  },
);

export default faceitClient;
