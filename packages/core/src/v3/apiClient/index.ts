import { castToError } from "./core";

/**
 * Trigger.dev v3 API client
 */
export class ApiClient {
  constructor(baseUrl: string) {}

  async getRunResult(runId: string) {
    return castToError(new Error());
  }
}
