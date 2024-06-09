import { ApiClient } from "../apiClient";

export class APIClientManagerAPI {
  private static _instance?: APIClientManagerAPI;

  private constructor() {}

  public static getInstance(): APIClientManagerAPI {
    if (!this._instance) {
      this._instance = new APIClientManagerAPI();
    }

    return this._instance;
  }

  get client(): ApiClient | undefined {
    return new ApiClient("https://api.trigger.dev", "https://api.trigger.dev");
  }
}
