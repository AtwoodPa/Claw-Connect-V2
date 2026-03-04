import { z } from 'zod';
export declare const pluginConfigSchema: z.ZodObject<{
    port: z.ZodDefault<z.ZodNumber>;
    host: z.ZodDefault<z.ZodString>;
    cors: z.ZodOptional<z.ZodObject<{
        origins: z.ZodOptional<z.ZodArray<z.ZodString, "many">>;
        credentials: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        credentials: boolean;
        origins?: string[] | undefined;
    }, {
        origins?: string[] | undefined;
        credentials?: boolean | undefined;
    }>>;
    auth: z.ZodDefault<z.ZodObject<{
        type: z.ZodDefault<z.ZodEnum<["jwt", "apikey"]>>;
        secret: z.ZodDefault<z.ZodString>;
        expiration: z.ZodDefault<z.ZodNumber>;
        allowAnonymous: z.ZodDefault<z.ZodBoolean>;
    }, "strip", z.ZodTypeAny, {
        type: "jwt" | "apikey";
        secret: string;
        expiration: number;
        allowAnonymous: boolean;
    }, {
        type?: "jwt" | "apikey" | undefined;
        secret?: string | undefined;
        expiration?: number | undefined;
        allowAnonymous?: boolean | undefined;
    }>>;
    limits: z.ZodDefault<z.ZodObject<{
        maxConnections: z.ZodDefault<z.ZodNumber>;
        maxMessageLength: z.ZodDefault<z.ZodNumber>;
        maxFileSize: z.ZodDefault<z.ZodNumber>;
    }, "strip", z.ZodTypeAny, {
        maxConnections: number;
        maxMessageLength: number;
        maxFileSize: number;
    }, {
        maxConnections?: number | undefined;
        maxMessageLength?: number | undefined;
        maxFileSize?: number | undefined;
    }>>;
    accounts: z.ZodOptional<z.ZodRecord<z.ZodString, z.ZodObject<{
        enabled: z.ZodDefault<z.ZodBoolean>;
        webhookUrl: z.ZodOptional<z.ZodString>;
        apiKey: z.ZodOptional<z.ZodString>;
    }, "strip", z.ZodTypeAny, {
        enabled: boolean;
        webhookUrl?: string | undefined;
        apiKey?: string | undefined;
    }, {
        enabled?: boolean | undefined;
        webhookUrl?: string | undefined;
        apiKey?: string | undefined;
    }>>>;
}, "strip", z.ZodTypeAny, {
    port: number;
    host: string;
    auth: {
        type: "jwt" | "apikey";
        secret: string;
        expiration: number;
        allowAnonymous: boolean;
    };
    limits: {
        maxConnections: number;
        maxMessageLength: number;
        maxFileSize: number;
    };
    cors?: {
        credentials: boolean;
        origins?: string[] | undefined;
    } | undefined;
    accounts?: Record<string, {
        enabled: boolean;
        webhookUrl?: string | undefined;
        apiKey?: string | undefined;
    }> | undefined;
}, {
    port?: number | undefined;
    host?: string | undefined;
    cors?: {
        origins?: string[] | undefined;
        credentials?: boolean | undefined;
    } | undefined;
    auth?: {
        type?: "jwt" | "apikey" | undefined;
        secret?: string | undefined;
        expiration?: number | undefined;
        allowAnonymous?: boolean | undefined;
    } | undefined;
    limits?: {
        maxConnections?: number | undefined;
        maxMessageLength?: number | undefined;
        maxFileSize?: number | undefined;
    } | undefined;
    accounts?: Record<string, {
        enabled?: boolean | undefined;
        webhookUrl?: string | undefined;
        apiKey?: string | undefined;
    }> | undefined;
}>;
export type PluginConfig = z.infer<typeof pluginConfigSchema>;
