# OpenClaw Web Channel Plugin

Web 端接入 OpenClaw Gateway 的 Channel 插件（WebSocket/HTTP）。

## 功能

- WebSocket 服务（`/ws`）
- JWT / APIKey 认证（`auth` 消息、`/auth`）
- 消息转发到真实 OpenClaw Gateway（当前通过 `openclaw gateway call`）
- 分块输出协议（`chunk` / `stream_end`）
- 消息状态协议（`message_status`）
- 会话历史同步（`GET /sessions/:sessionId/history`）
- Agent 列表接口（`GET /agents`）
- 健康检查与配置检查（`/health`、`/config`）
- 基础文件上传接口（`/upload`）

## 本地开发

```bash
npm install
npm run build
npm test
```

## 目录

- 插件入口：`src/index.ts`
- Channel 实现：`src/channel.ts`
- WebSocket/HTTP 服务：`src/server.ts`
- Gateway 调用层：`src/gateway-client.ts`

## 部署与演进文档

详细部署、升级、验证、排障与能力完善路线见：

- `/Users/pp/Desktop/Code/ClawConnectV2/docs/guide/WebChannel_部署与演进指南.md`
