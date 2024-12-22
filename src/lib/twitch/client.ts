import axios from "axios";

import { logger } from "@/lib/logger";

const twitchClient = axios.create();

twitchClient.interceptors.response.use(
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

export default twitchClient;
