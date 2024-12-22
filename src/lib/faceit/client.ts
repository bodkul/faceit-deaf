import axios from "axios";

import { logger } from "@/lib/logger";

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
      logger.error(
        `Error fetching data from ${error.config.url}: ${error.response.status} ${error.response.statusText}`,
      );
    } else if (error.request) {
      logger.error(`Error in request to ${error.config.url}: ${error.message}`);
    } else {
      logger.error(`Error: ${error.message}`);
    }
    return Promise.reject(error);
  },
);

export default faceitClient;
