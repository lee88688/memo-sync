import { createEnv } from "@t3-oss/env-nextjs";
import { z } from "zod";

export const env = createEnv({
  server: {
    NEXT_AUTH_SECRET: z.string().min(16),
    DB_URL: z.string(),
    // github
    AUTH_GITHUB_ID: z.string(),
    AUTH_GITHUB_SECRET: z.string(),
  },
  runtimeEnv: process.env,
  emptyStringAsUndefined: true,
});
