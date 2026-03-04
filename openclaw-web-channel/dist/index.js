import { pluginConfigSchema } from './config.js';
import { createWebChannel } from './channel.js';
import { WebChannelServer } from './server.js';
import { setChannelBridge } from './bridge.js';
import { resolveLogger } from './utils/logger.js';
let server = null;
export default function register(api) {
    const logger = resolveLogger(api.logger).child('web-channel');
    const config = pluginConfigSchema.parse(api.pluginConfig);
    logger.info(`Initializing Web Channel on ${config.host}:${config.port}`);
    api.registerChannel({
        plugin: createWebChannel(config, logger)
    });
    api.registerService({
        id: 'web-channel-server',
        start: async () => {
            server = new WebChannelServer(config, api);
            await server.start();
            setChannelBridge(server);
            logger.info('Web Channel service started');
        },
        stop: async () => {
            if (!server) {
                return;
            }
            await server.stop();
            server = null;
            setChannelBridge(null);
            logger.info('Web Channel service stopped');
        }
    });
    if (typeof api.registerHttpRoute === 'function') {
        api.registerHttpRoute({
            method: 'POST',
            path: '/web-channel/send',
            handler: async (req, res) => {
                const body = req.body;
                const sessionId = body.sessionId;
                const message = body.message;
                if (!sessionId || !message) {
                    res.json({ success: false, error: 'sessionId and message are required' });
                    return;
                }
                const sent = server?.sendToSession(sessionId, {
                    type: 'message',
                    role: 'assistant',
                    content: message,
                    timestamp: Date.now()
                });
                res.json({ success: Boolean(sent) });
            }
        });
    }
    if (typeof api.registerCli === 'function') {
        api.registerCli(({ program }) => {
            program
                .command('web-channel:status')
                .description('Show Web Channel connection status')
                .action(() => {
                const status = server?.getStatus() ?? {
                    running: false,
                    connections: 0,
                    port: config.port,
                    host: config.host
                };
                process.stdout.write(`${JSON.stringify(status, null, 2)}\n`);
            });
        });
    }
}
//# sourceMappingURL=index.js.map