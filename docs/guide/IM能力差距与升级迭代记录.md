# ClawConnect 对标主流 IM 的能力差距与升级迭代记录

更新时间：2026-03-04

## 1. 能力差距总览（对标 Telegram / Slack / Discord / WhatsApp）

| 维度 | 主流 IM 现状 | 本项目升级前 | 本轮迭代后 |
| --- | --- | --- | --- |
| 发送可靠性 | 发送中/送达/失败状态清晰 | 仅基础发送，无完整状态机 | 已支持 `accepted/processing/streaming/delivered/failed/aborted` |
| 幂等去重 | 重复发送不重复落库 | 重复 `messageId` 行为不完整 | 已支持服务端缓存回放与重复请求幂等 |
| 历史同步 | 会话重开可恢复 | 仅内存会话 | 已支持 `GET /sessions/:sessionId/history` 与前端自动同步 |
| 失败恢复 | 可识别可恢复错误并重试 | 错误语义粗粒度 | 已补 `recoverable/action/reason` 语义并映射前端 |
| 连接体验 | 断线重连、状态可见 | 仅基础重连 | 已增强连接异常时消息状态与重连体验 |
| 上拉加载历史 | 可滚动回看更早消息 | 未接入 | 已接入“顶部触发追加历史拉取（增量提升 limit）” |

## 2. 本轮已落地升级（代码）

### 后端（`openclaw-web-channel`）

1. `message_status` 协议：
- `accepted`
- `processing`
- `streaming`
- `delivered`
- `failed`
- `aborted`

2. 消息幂等回放：
- 针对重复 `messageId` 返回缓存结果（成功/失败/中止）
- 避免重复计算与重复回复

3. 历史同步 API：
- `GET /sessions/:sessionId/history?limit=...`
- 对接 `openclaw gateway call chat.history`

4. 错误语义增强：
- 错误详情包含 `reason/recoverable/action/messageId`

### 前端（`packages/vue`）

1. 协议对齐：
- 新增 `WsMessageStatusEvent`
- 新增 `SessionHistoryResponse`
- 扩展 `WsErrorEvent` 详情结构

2. 聊天状态机升级（`useChat.ts`）：
- 用户消息 ID 与请求 ID 对齐
- 消费 `message_status` 并更新每条消息状态
- 失败/中止状态落盘
- 切会话/初次连接/上拉时自动拉取历史

3. UI/UX 升级：
- 消息头展示发送状态标签（已接收/处理中/已送达/失败等）
- `retry` 支持从 assistant 消息回溯最近一条 user 消息重发

4. 连接健壮性：
- `useWebSocket.ts` 改进 URL 归一化，兼容 `http(s)` / `ws(s)` / 自带 `/ws` 路径

## 3. 下一阶段建议（优先级）

### P0

1. 真流式（Gateway 事件直通，而非最终文本分块）
2. 游标分页历史（cursor/beforeId），替代“增大 limit”
3. 消息持久化与多端同步（Redis/DB）

### P1

1. 输入中状态（typing）与在线状态（presence）
2. 附件元数据链路（缩略图、类型、下载权限）
3. 风控与限流（IP/用户/会话）

### P2

1. 撤回、编辑、表情回应、@ 提及
2. 观测平台（P95 延迟、错误率、重连率）
3. 多实例水平扩展（WS 状态外置）

## 4. 验证清单

1. `GET /config` 含 `messageStatus/historySync/retry`
2. `GET /sessions/default/history?limit=5` 可返回历史
3. WebSocket 发消息可收到：
- `message_received`
- `message_status:accepted`
- `message_status:processing`
- `message_status:streaming`
- `chunk`
- `stream_end`
