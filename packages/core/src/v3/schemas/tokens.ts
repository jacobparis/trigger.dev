import { z } from "zod";

const CreateAuthorizationCodeResponseSchema = z.object({
  url: z.string().url(),
  authorizationCode: z.string(),
});

type CreateAuthorizationCodeResponse = z.infer<typeof CreateAuthorizationCodeResponseSchema>;

const GetPersonalAccessTokenRequestSchema = z.object({
  authorizationCode: z.string(),
});
type GetPersonalAccessTokenRequest = z.infer<typeof GetPersonalAccessTokenRequestSchema>;

const GetPersonalAccessTokenResponseSchema = z.object({
  token: z
    .object({
      token: z.string(),
      obfuscatedToken: z.string(),
    })
    .nullable(),
});
type GetPersonalAccessTokenResponse = z.infer<typeof GetPersonalAccessTokenResponseSchema>;
