# ClawConnect WebChannel 插件部署与演进指南

**版本**: v1.1  
**更新日期**: 2026-03-04  
**适用项目**: `openclaw-web-channel` + `packages/vue`

---

## 1. 目标与现状

本文档覆盖两件事：

1. 如何在本地/服务器部署并运行 `web-channel` 插件。  
2. 结合 OpenClaw Gateway 源码能力与主流 IM（Telegram/WhatsApp/Slack/Discord/企业微信）体验，给出当前项目可实现的完善方向。

当前插件已经实现：

- 浏览器侧 WebSocket 接入（`ws://<host>:3000/ws`）
- JWT/APIKey 认证
- 消息转发到真实 OpenClaw Gateway
- 响应分块下发（`chunk` + `stream_end`）
- 健康检查与基础上传接口（`/health`、`/config`、`/upload`）

2026-03-04 新增（本轮迭代）：

- 消息投递状态机（`message_status`: accepted/processing/streaming/delivered/failed/aborted）
- 重复消息幂等回放（同一 `messageId` 可重放缓存结果）
- 历史同步接口（`GET /sessions/:sessionId/history?limit=...`）
- Agent 列表接口（`GET /agents`）与前端会话级 agent 选择
- 前端消息状态 UI（发送中/处理中/生成中/已送达/失败/已停止）
- 前端会话历史自动同步（连接后、切会话、顶部上拉补拉历史）

---

## 2. 架构说明（当前实现）

```text
Vue Chat UI  <----ws/http---->  WebChannel Plugin (3000)
                                   |
                                   | openclaw gateway call (CLI)
                                   v
                           OpenClaw Gateway (18789)
```

说明：

- 当前后端插件通过 `openclaw gateway call` 对接网关（真实网关链路）。
- 网关处理后回传结果，插件再转成前端可消费的 `chunk/stream_end` 协议。

---

## 3. 部署前准备

### 3.1 环境要求

- Node.js >= 18
- OpenClaw >= 2026.2（建议 2026.3+）
- `openclaw` 命令可在 PATH 中直接执行

### 3.2 路径约定

- 插件源码：`/Users/pp/Desktop/Code/ClawConnectV2/openclaw-web-channel`
- 前端源码：`/Users/pp/Desktop/Code/ClawConnectV2/packages/vue`
- OpenClaw 全局扩展目录：`~/.openclaw/extensions`

---

## 4. 插件部署（首次）

在插件目录执行：

```bash
cd /Users/pp/Desktop/Code/ClawConnectV2/openclaw-web-channel
npm install
npm run build
openclaw plugins install /Users/pp/Desktop/Code/ClawConnectV2/openclaw-web-channel
```

如果安装成功，可通过以下命令确认：

```bash
openclaw plugins list
```

检查点：列表中应出现 `web-channel`，状态为 `loaded`（或配置启用后可加载）。

---

## 5. 插件升级（已存在时）

若提示 `plugin already exists`，按以下方式覆盖升级：

```bash
cd /Users/pp/Desktop/Code/ClawConnectV2/openclaw-web-channel
npm run build
rsync -a --delete ./dist/ ~/.openclaw/extensions/web-channel/dist/
cp ./openclaw.plugin.json ~/.openclaw/extensions/web-channel/openclaw.plugin.json
```

然后重启 Gateway（见第 7 节）。

---

## 6. OpenClaw 配置

建议在 `~/.openclaw/openclaw.json` 中确保以下配置存在：

```json
{
  "gateway": {
    "port": 18789,
    "mode": "local",
    "bind": "loopback"
  },
  "plugins": {
    "allow": ["web-channel"],
    "entries": {
      "web-channel": {
        "enabled": true,
        "config": {
          "port": 3000,
          "host": "127.0.0.1",
          "cors": {
            "origins": ["http://localhost:5173", "http://127.0.0.1:5173"],
            "credentials": true
          },
          "auth": {
            "type": "jwt",
            "secret": "<replace-with-strong-secret>",
            "expiration": 7200,
            "allowAnonymous": true
          },
          "limits": {
            "maxConnections": 1000,
            "maxMessageLength": 4000,
            "maxFileSize": 52428800
          }
        }
      }
    }
  }
}
```

建议：生产环境将 `allowAnonymous` 设为 `false`，并由前端先调用 `/auth` 获取 token。

---

## 7. 启动与验证

### 7.1 启动 Gateway

```bash
openclaw gateway run --port 18789
```

日志中应看到：

- `Initializing Web Channel on 127.0.0.1:3000`
- `Web Channel server started on 127.0.0.1:3000`

### 7.2 健康检查

```bash
curl http://127.0.0.1:3000/health
curl http://127.0.0.1:3000/config
```

### 7.3 认证检查（JWT）

```bash
curl -X POST http://127.0.0.1:3000/auth \
  -H 'content-type: application/json' \
  -d '{}'
```

返回中应含 `token` 字段。

### 7.4 前端启动

```bash
cd /Users/pp/Desktop/Code/ClawConnectV2/packages/vue
cp .env.example .env
npm install
npm run dev:preview
```

默认预览地址：

- `http://localhost:5173`

默认前端网关地址：

- `VITE_OPENCLAW_GATEWAY_URL=http://127.0.0.1:3000`

---

## 8. 常见问题排查

### 8.1 浏览器报错：`WebSocket connection to ws://127.0.0.1:3000/ws failed`

排查顺序：

1. 确认 Gateway 进程在运行。
2. 确认 3000 端口有监听：

```bash
lsof -i tcp:3000 -sTCP:LISTEN -n -P
```

3. 确认插件已加载且 `plugins.entries.web-channel.enabled=true`。
4. 检查 CORS origins 是否包含前端地址。

### 8.2 返回 `MSG_004 Failed to process message`

常见原因：

- Gateway 未运行/不可达
- 插件版本未更新（仍是旧实现）
- OpenClaw 配置存在鉴权冲突

建议直接观察 Gateway 前台日志。

### 8.3 `openclaw plugins install` 提示已存在

这是正常行为，按第 5 节执行覆盖升级。

---

## 9. 对照主流 IM 的能力差距与可完善点

下面的建议基于两类输入：

- OpenClaw Gateway 源码中可用方法/事件（如 `agent`、`agent.wait`、`chat.send`、`chat.history`、`chat.abort`，以及 `chat/agent/presence/health/tick` 事件）。
- 主流 IM 产品体验（实时性、可靠性、会话体验、可观测性、安全）。

### 9.1 P0（建议优先完成）

1. 真流式转发（替代当前“最终结果再切块”）
- 目标：接近 Telegram/Slack 的实时打字输出体验。
- 方案：插件内维护到 Gateway 的持久 WS 连接，使用 `chat.send` + 订阅 `chat` 事件 `delta/final`。
- 收益：首字延迟明显下降，停止生成可即时生效。

2. 原生停止生成
- 目标：像 ChatGPT/Claude 的 Stop 按钮。
- 方案：前端 `stop` 映射到 `chat.abort(sessionKey, runId)`，并维护 runId-sessionKey 索引。

3. 消息可靠投递状态机
- 目标：对齐 IM 的“发送中/已送达/失败重试”。
- 方案：扩展前后端协议：`queued`、`accepted`、`delivered`、`failed`、`retrying`。

4. 完整错误码体系
- 目标：前端可区分“鉴权失败/网关超时/模型错误/格式错误”。
- 方案：统一错误映射表，补充 `code + recoverable + actionHint`。

### 9.2 P1（高价值增强）

1. 会话历史同步
- 方案：接入 `chat.history`，支持分页、滚动加载、会话恢复。
- 对标：Slack/Discord 的历史回看体验。

2. 富媒体与附件链路
- 方案：打通上传对象元数据（类型、大小、缩略图、访问控制），并支持图片预览、文件卡片。
- 对标：Telegram/企业微信的附件消息体验。

3. 输入状态与在线状态
- 方案：利用 Gateway 事件扩展 typing/presence 显示。
- 对标：WhatsApp/Discord 的在线与输入中提示。

4. 重连恢复与断点续传
- 方案：断线后根据 runId/sessionKey 恢复状态，避免“重复提问/重复回复”。

5. 速率限制与防滥用
- 方案：按 IP、用户、会话维度限制消息频率与文件大小。

### 9.3 P2（中长期）

1. 多终端消息同步
- 同账号多页面/多设备会话一致性。

2. 消息操作能力
- 撤回、编辑、引用回复、表情反馈、@提及。

3. 可观测性平台化
- 指标（P95 延迟、错误率、重连率）、结构化日志、追踪链路。

4. 横向扩展
- 将 WS 连接状态外置（Redis），支持多实例部署。

5. 合规与审计
- 数据留存策略、敏感字段脱敏、操作审计追踪。

---

## 10. 推荐实施路线（8 周）

### 第 1-2 周

- 持久网关 WS 客户端（替代 CLI 子进程调用）
- 真流式 `chat.send/chat event`
- `chat.abort` 完整支持

### 第 3-4 周

- 历史同步 + 分页
- 错误码体系 + 可恢复策略
- 消息状态机

### 第 5-6 周

- 附件能力增强
- 重连恢复机制
- 速率限制与风控

### 第 7-8 周

- 指标与告警
- 多实例架构准备
- 安全基线与审计

---

## 11. 结论

当前插件已具备“可用”的 Web Chat 接入能力，且已真实接入 OpenClaw Gateway。  
下一阶段最值得投入的是：**真流式、停止控制、消息可靠性、历史同步**。这四项完成后，体验可基本对齐主流 IM + AI 助手产品的一线水平。
