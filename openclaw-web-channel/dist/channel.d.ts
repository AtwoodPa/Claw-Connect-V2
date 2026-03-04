import type { ChannelPlugin, Logger } from 'openclaw/plugin-sdk';
import type { PluginConfig } from './config.js';
export declare function createWebChannel(config: PluginConfig, logger: Logger): ChannelPlugin;
