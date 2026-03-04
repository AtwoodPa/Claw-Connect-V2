import { z } from 'zod';

export const pluginConfigSchema = z.object({
  port: z.number().int().min(1).max(65535).default(3000),
  host: z.string().default('127.0.0.1'),
  cors: z
    .object({
      origins: z.array(z.string()).optional(),
      credentials: z.boolean().default(true)
    })
    .optional(),
  auth: z
    .object({
      type: z.enum(['jwt', 'apikey']).default('jwt'),
      secret: z.string().min(1).default('openclaw-web-channel-dev-secret'),
      expiration: z.number().int().positive().default(3600),
      allowAnonymous: z.boolean().default(false)
    })
    .default({
      type: 'jwt',
      secret: 'openclaw-web-channel-dev-secret',
      expiration: 3600,
      allowAnonymous: false
    }),
  limits: z
    .object({
      maxConnections: z.number().int().positive().default(1000),
      maxMessageLength: z.number().int().positive().default(4000),
      maxFileSize: z.number().int().positive().default(50 * 1024 * 1024)
    })
    .default({
      maxConnections: 1000,
      maxMessageLength: 4000,
      maxFileSize: 50 * 1024 * 1024
    }),
  accounts: z
    .record(
      z.object({
        enabled: z.boolean().default(true),
        webhookUrl: z.string().url().optional(),
        apiKey: z.string().optional()
      })
    )
    .optional()
});

export type PluginConfig = z.infer<typeof pluginConfigSchema>;
