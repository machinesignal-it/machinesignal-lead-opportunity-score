import { handleRequest, MachineSignalLedgerDurableObject } from "./core.mjs";

export { MachineSignalLedgerDurableObject };

export default {
  async fetch(request, env) {
    return handleRequest(request, env);
  }
};

