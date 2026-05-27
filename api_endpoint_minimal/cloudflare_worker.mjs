import { handleRequest } from "./core.mjs";

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};

