import { zodfetch } from "./core";
import { z } from "zod";

/**
 * Trigger.dev v3 API client
 */
export class ApiClient {
  private readonly baseUrl: string;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, "");
  }

  async getRunResult(runId: string) {
    return zodfetch(z.any(), `${this.baseUrl}/api/v1/runs/${runId}/result`, {
      method: "GET",
    });
  }
}
