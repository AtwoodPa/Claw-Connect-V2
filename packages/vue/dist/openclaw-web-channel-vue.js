import { getActivePinia as yt, createPinia as Xe, setActivePinia as wt, defineStore as Te, storeToRefs as St } from "pinia";
import { computed as x, defineComponent as Ce, ref as b, onMounted as Ze, onBeforeUnmount as Je, openBlock as v, createElementBlock as y, withModifiers as fe, normalizeClass as te, Fragment as ue, renderList as ce, createElementVNode as i, toDisplayString as k, createCommentVNode as q, withDirectives as Ee, vModelText as et, unref as I, withKeys as Ct, normalizeStyle as It, watch as me, nextTick as Ke, createTextVNode as Se, createVNode as ye, TransitionGroup as bt, withCtx as tt, createBlock as kt, onUnmounted as Mt, watchEffect as $t, vModelSelect as At, Transition as _t } from "vue";
import { createI18n as Lt } from "vue-i18n";
import ke from "highlight.js";
import { marked as Ae } from "marked";
const je = [
  { key: "model", label: "/model", description: "Switch model" },
  { key: "think", label: "/think", description: "Deep thinking mode" },
  { key: "new", label: "/new", description: "Create new session" },
  { key: "clear", label: "/clear", description: "Clear current session" },
  { key: "help", label: "/help", description: "Show help" }
];
function Tt(e) {
  const t = e.trim();
  if (!t.startsWith("/"))
    return null;
  const [s = "", ...n] = t.slice(1).split(" ");
  return {
    command: s,
    args: n.join(" ").trim()
  };
}
function Et(e) {
  if (!e.trim())
    return je;
  const t = e.toLowerCase();
  return je.filter((s) => s.key.includes(t));
}
const xt = {
  title: "OpenClaw Chat",
  newSession: "New session",
  agent: "Agent",
  disconnected: "Disconnected",
  reconnect: "Reconnect",
  empty: "Start chatting with OpenClaw"
}, Dt = {
  placeholder: "Type your message...",
  thinking: "Thinking...",
  send: "Send",
  stop: "Stop",
  queued: "Queued: {count}"
}, Rt = {
  title: "Sessions",
  empty: "No sessions",
  delete: "Delete",
  clear: "Clear",
  new: "New"
}, Ut = {
  you: "You",
  assistant: "Assistant",
  system: "System",
  copy: "Copy",
  copied: "Copied",
  quote: "Quote",
  delete: "Delete",
  regenerate: "Regenerate",
  status: {
    pending: "Queued",
    accepted: "Accepted",
    processing: "Processing",
    streaming: "Streaming",
    delivered: "Delivered",
    failed: "Failed",
    aborted: "Stopped",
    sent: "Sent"
  }
}, Nt = {
  connected: "Connected",
  reconnecting: "Reconnecting",
  error: "Connection failed"
}, Ot = {
  chat: xt,
  input: Dt,
  session: Rt,
  message: Ut,
  status: Nt
}, qt = {
  title: "OpenClaw 对话",
  newSession: "新建会话",
  agent: "Agent",
  disconnected: "连接已断开",
  reconnect: "重连",
  empty: "开始和 OpenClaw 对话"
}, Wt = {
  placeholder: "输入消息...",
  thinking: "思考中...",
  send: "发送",
  stop: "停止",
  queued: "等待发送: {count}"
}, Pt = {
  title: "会话",
  empty: "暂无会话",
  delete: "删除",
  clear: "清空",
  new: "新建"
}, zt = {
  you: "你",
  assistant: "助手",
  system: "系统",
  copy: "复制",
  copied: "已复制",
  quote: "引用",
  delete: "删除",
  regenerate: "重新生成",
  status: {
    pending: "待发送",
    accepted: "已接收",
    processing: "处理中",
    streaming: "生成中",
    delivered: "已送达",
    failed: "发送失败",
    aborted: "已停止",
    sent: "已发送"
  }
}, Vt = {
  connected: "已连接",
  reconnecting: "重连中",
  error: "连接失败"
}, Bt = {
  chat: qt,
  input: Wt,
  session: Pt,
  message: zt,
  status: Vt
}, Ht = {
  en: Ot,
  "zh-CN": Bt
};
function Ft() {
  return typeof navigator > "u" ? "en" : navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}
const Kt = typeof localStorage < "u" ? localStorage.getItem("openclaw:locale") : null, jt = Kt ?? Ft(), we = Lt({
  legacy: !1,
  locale: jt,
  fallbackLocale: "en",
  messages: Ht
});
function Ie() {
  const e = x({
    get: () => we.global.locale.value,
    set: (n) => {
      we.global.locale.value = n, typeof localStorage < "u" && localStorage.setItem("openclaw:locale", n);
    }
  });
  function t(n) {
    e.value = n;
  }
  function s(n, a) {
    return a ? we.global.t(n, a) : we.global.t(n);
  }
  return {
    t: s,
    locale: e,
    setLocale: t
  };
}
const Qt = {
  key: 0,
  class: "oc-command-panel"
}, Gt = ["onMousedown"], Yt = {
  key: 1,
  class: "oc-image-bar"
}, Xt = ["src"], Zt = ["onClick"], Jt = { class: "oc-input-main" }, es = { class: "oc-text-wrap" }, ts = ["placeholder", "disabled"], ss = ["disabled"], ns = { class: "oc-input-footer" }, as = {
  key: 0,
  class: "oc-queue"
}, os = /* @__PURE__ */ Ce({
  __name: "ChatInput",
  props: {
    modelValue: {},
    disabled: { type: Boolean, default: !1 },
    uploading: { type: Boolean, default: !1 },
    loading: { type: Boolean, default: !1 },
    queuedCount: { default: 0 },
    placeholder: { default: "" },
    maxLength: { default: 4e3 }
  },
  emits: ["update:modelValue", "send", "upload", "command", "stop"],
  setup(e, { emit: t }) {
    const s = e, n = t, { t: a } = Ie(), g = b(null), l = b(null), T = b(null), A = b(!1), h = b(!1), M = b(""), d = b(0), u = b(!1), p = b([]), S = x({
      get: () => s.modelValue,
      set: (c) => n("update:modelValue", c)
    }), P = x(() => Et(M.value)), K = x(() => S.value.trim().length > 0 && S.value.length <= s.maxLength), G = x(() => s.placeholder || a("input.placeholder")), _ = x(() => Math.max(0, s.maxLength - S.value.length));
    function E() {
      const c = l.value;
      c && (c.style.height = "auto", c.style.height = `${Math.min(c.scrollHeight, 200)}px`);
    }
    function Y(c) {
      const m = c.match(/\/(\w*)$/);
      if (!m) {
        h.value = !1, d.value = 0;
        return;
      }
      h.value = !0, M.value = m[1] ?? "", d.value = 0;
    }
    function B(c) {
      const m = c.target.value;
      S.value = m, E(), Y(m);
    }
    function j(c) {
      h.value = !1;
      const m = S.value;
      S.value = m.replace(/\/\w*$/, `/${c} `), n("command", c, ""), requestAnimationFrame(() => {
        var w;
        (w = l.value) == null || w.focus();
      });
    }
    function ie(c) {
      if (h.value && P.value.length > 0) {
        if (c.key === "ArrowDown") {
          c.preventDefault(), d.value = (d.value + 1) % P.value.length;
          return;
        }
        if (c.key === "ArrowUp") {
          c.preventDefault(), d.value = (d.value - 1 + P.value.length) % P.value.length;
          return;
        }
        if (c.key === "Enter" && !c.shiftKey) {
          c.preventDefault(), j(P.value[d.value].key);
          return;
        }
      }
      if (c.key === "Enter" && !c.shiftKey && !A.value) {
        if (c.preventDefault(), s.loading) {
          n("stop");
          return;
        }
        O();
      }
    }
    function ae() {
      p.value.forEach((c) => {
        URL.revokeObjectURL(c.preview);
      });
    }
    function O() {
      const c = S.value.trim();
      if (s.loading) {
        n("stop");
        return;
      }
      if (!c || c.length > s.maxLength)
        return;
      const m = Tt(c);
      if (m) {
        n("command", m.command, m.args), S.value = "", E();
        return;
      }
      n(
        "send",
        c,
        p.value.map((w) => w.file)
      ), S.value = "", ae(), p.value = [], E();
    }
    function N(c) {
      c.slice(0, 5).forEach((m) => {
        !m.type.startsWith("image/") || m.size > 10 * 1024 * 1024 || p.value.push({
          file: m,
          preview: URL.createObjectURL(m)
        });
      });
    }
    function L(c) {
      const m = c.target.files;
      m && (n("upload", m), N(Array.from(m)), T.value && (T.value.value = ""));
    }
    function Q(c) {
      const m = p.value[c];
      m && URL.revokeObjectURL(m.preview), p.value.splice(c, 1);
    }
    function V() {
      u.value = !0;
    }
    function X(c) {
      var w;
      const m = c.relatedTarget;
      (w = g.value) != null && w.contains(m) || (u.value = !1);
    }
    function R(c) {
      var w;
      u.value = !1;
      const m = Array.from(((w = c.dataTransfer) == null ? void 0 : w.files) ?? []);
      m.length !== 0 && N(m);
    }
    function se(c) {
      var w;
      const m = Array.from(((w = c.clipboardData) == null ? void 0 : w.files) ?? []);
      m.length !== 0 && N(m);
    }
    return Ze(() => {
      var c;
      (c = l.value) == null || c.addEventListener("paste", se);
    }), Je(() => {
      var c;
      (c = l.value) == null || c.removeEventListener("paste", se), ae();
    }), (c, m) => (v(), y("div", {
      ref_key: "rootRef",
      ref: g,
      class: te(["oc-input-wrap", { "is-drop-active": u.value }]),
      onDragover: fe(V, ["prevent"]),
      onDragleave: X,
      onDrop: fe(R, ["prevent"])
    }, [
      h.value && P.value.length ? (v(), y("ul", Qt, [
        (v(!0), y(ue, null, ce(P.value, (w, J) => (v(), y("li", {
          key: w.key,
          class: te({ active: J === d.value }),
          onMousedown: fe((de) => j(w.key), ["prevent"])
        }, [
          i("strong", null, k(w.label), 1),
          i("small", null, k(w.description), 1)
        ], 42, Gt))), 128))
      ])) : q("", !0),
      p.value.length ? (v(), y("div", Yt, [
        (v(!0), y(ue, null, ce(p.value, (w, J) => (v(), y("div", {
          key: J,
          class: "oc-image-item"
        }, [
          i("img", {
            src: w.preview,
            alt: "preview"
          }, null, 8, Xt),
          i("button", {
            type: "button",
            onClick: (de) => Q(J)
          }, "×", 8, Zt)
        ]))), 128))
      ])) : q("", !0),
      i("div", Jt, [
        i("button", {
          type: "button",
          class: "oc-attach",
          "aria-label": "Attach image",
          onClick: m[0] || (m[0] = (w) => {
            var J;
            return (J = T.value) == null ? void 0 : J.click();
          })
        }, "＋"),
        i("input", {
          ref_key: "fileInputRef",
          ref: T,
          type: "file",
          multiple: "",
          accept: "image/*",
          hidden: "",
          onChange: L
        }, null, 544),
        i("div", es, [
          Ee(i("textarea", {
            ref_key: "textareaRef",
            ref: l,
            "onUpdate:modelValue": m[1] || (m[1] = (w) => S.value = w),
            placeholder: G.value,
            disabled: e.disabled,
            rows: "1",
            onInput: B,
            onKeydown: ie,
            onCompositionstart: m[2] || (m[2] = (w) => A.value = !0),
            onCompositionend: m[3] || (m[3] = (w) => A.value = !1)
          }, null, 40, ts), [
            [et, S.value]
          ]),
          i("div", {
            class: te(["oc-counter", { warn: _.value < 120 }])
          }, k(_.value), 3)
        ]),
        i("button", {
          type: "button",
          class: "oc-send",
          disabled: !K.value && !e.loading || e.disabled,
          onClick: O
        }, k(e.loading ? I(a)("input.stop") : I(a)("input.send")), 9, ss)
      ]),
      i("div", ns, [
        e.queuedCount > 0 ? (v(), y("span", as, k(I(a)("input.queued", { count: e.queuedCount })), 1)) : q("", !0),
        m[4] || (m[4] = i("span", { class: "oc-hint" }, "Enter to send · Shift+Enter newline · / for commands", -1))
      ])
    ], 34));
  }
}), be = (e, t) => {
  const s = e.__vccOpts || e;
  for (const [n, a] of t)
    s[n] = a;
  return s;
}, st = /* @__PURE__ */ be(os, [["__scopeId", "data-v-230825ba"]]);
function nt(e, t = "zh-CN") {
  const s = new Date(e);
  return new Intl.DateTimeFormat(t, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(s);
}
function is(e, t = "zh-CN") {
  const n = Date.now() - e;
  if (n < 6e4)
    return t.startsWith("zh") ? "刚刚" : "now";
  if (n < 36e5) {
    const a = Math.floor(n / 6e4);
    return t.startsWith("zh") ? `${a}分钟前` : `${a}m ago`;
  }
  return nt(e, t);
}
Ae.setOptions({
  gfm: !0,
  breaks: !0
});
function rs(e, t) {
  return t ? ke.getLanguage(t) ? ke.highlight(e, { language: t }).value : ke.highlightAuto(e).value : ke.highlightAuto(e).value;
}
function ls(e) {
  return e.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<(iframe|object|embed|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, "").replace(/\son\w+=['"][^'"]*['"]/gi, "").replace(/javascript:/gi, "");
}
function Qe(e) {
  const t = e.match(/```[\s\S]*?```/g);
  return t ? t.map((s) => s.replace(/^```\w*\n?/, "").replace(/```$/, "").trim()) : [];
}
function us(e, t = {}) {
  const s = new Ae.Renderer(), n = t.highlight ?? !0;
  s.code = (g, l) => {
    const T = (l == null ? void 0 : l.split(/\s+/)[0]) ?? "", A = n ? rs(g, T) : g;
    return `<pre class="oc-code-block"><code class="hljs language-${T}">${A}</code></pre>`;
  }, s.link = (g, l, T) => {
    const A = g ?? "#", h = l ? ` title="${l}"` : "";
    return `<a href="${A}" target="_blank" rel="noopener noreferrer"${h}>${T}</a>`;
  };
  const a = Ae.parse(e, { renderer: s });
  return ls(a);
}
const cs = {
  key: 0,
  class: "oc-message-avatar"
}, ds = { class: "oc-message-content" }, gs = { class: "oc-message-header" }, ms = { class: "oc-message-body" }, fs = {
  key: 0,
  class: "oc-message-images"
}, hs = ["src", "onClick"], ps = ["innerHTML"], vs = {
  key: 2,
  class: "oc-cursor"
}, ys = { class: "oc-message-actions" }, ws = /* @__PURE__ */ Ce({
  __name: "MessageItem",
  props: {
    message: {},
    isStreaming: { type: Boolean, default: !1 }
  },
  emits: ["copy", "preview-image", "regenerate", "quote", "delete"],
  setup(e, { emit: t }) {
    const s = e, n = t, { t: a, locale: g } = Ie(), l = b(!1), T = b(0), A = b(0), h = b(!1);
    let M = null;
    const d = x(() => us(s.message.content, { highlight: !0 })), u = x(() => Qe(s.message.content).length > 0), p = x(() => h.value ? a("message.copied") : a("message.copy")), S = x(() => s.message.role === "user" && !!s.message.status), P = x(() => `is-${s.message.status ?? "sent"}`), K = x(() => {
      switch (s.message.status) {
        case "pending":
          return a("message.status.pending");
        case "accepted":
          return a("message.status.accepted");
        case "processing":
          return a("message.status.processing");
        case "streaming":
          return a("message.status.streaming");
        case "delivered":
          return a("message.status.delivered");
        case "failed":
          return a("message.status.failed");
        case "aborted":
          return a("message.status.aborted");
        default:
          return a("message.status.sent");
      }
    }), G = x(() => s.message.role === "user" ? a("message.you") : s.message.role === "assistant" ? a("message.assistant") : a("message.system")), _ = x(() => s.message.role === "assistant" ? "AI" : s.message.role === "user" ? "U" : "S"), E = x(() => ({
      left: `${T.value}px`,
      top: `${A.value}px`
    }));
    function Y(N, L) {
      const X = Math.max(10, window.innerWidth - 160 - 10), R = Math.max(10, window.innerHeight - 180 - 10);
      T.value = Math.min(Math.max(10, N), X), A.value = Math.min(Math.max(10, L), R);
    }
    function B(N) {
      Y(N.clientX, N.clientY), l.value = !0;
    }
    function j(N) {
      M = window.setTimeout(() => {
        const L = N.touches[0];
        Y(L.clientX, L.clientY), l.value = !0;
      }, 500);
    }
    function ie() {
      M && (window.clearTimeout(M), M = null);
    }
    async function ae() {
      await navigator.clipboard.writeText(s.message.content), h.value = !0, n("copy", s.message.content), window.setTimeout(() => {
        h.value = !1;
      }, 2e3);
    }
    async function O(N) {
      if (N === "copy" && await ae(), N === "copy-code") {
        const L = Qe(s.message.content);
        await navigator.clipboard.writeText(L.join(`

`));
      }
      N === "quote" && n("quote", s.message), N === "delete" && n("delete", s.message.id), l.value = !1;
    }
    return (N, L) => {
      var Q;
      return v(), y("article", {
        class: te(["oc-message-item", [e.message.role, { streaming: e.isStreaming }]]),
        onContextmenu: fe(B, ["prevent"]),
        onTouchstart: j,
        onTouchend: ie
      }, [
        e.message.role !== "system" ? (v(), y("div", cs, k(_.value), 1)) : q("", !0),
        i("div", ds, [
          i("header", gs, [
            i("span", null, k(G.value), 1),
            i("time", null, k(I(nt)(e.message.timestamp, I(g))), 1),
            S.value ? (v(), y("span", {
              key: 0,
              class: te(["oc-message-status", P.value])
            }, k(K.value), 3)) : q("", !0)
          ]),
          i("div", ms, [
            (Q = e.message.images) != null && Q.length ? (v(), y("div", fs, [
              (v(!0), y(ue, null, ce(e.message.images, (V, X) => (v(), y("img", {
                key: X,
                src: V.thumbnail || V.url,
                class: "oc-message-image",
                onClick: (R) => N.$emit("preview-image", V.url)
              }, null, 8, hs))), 128))
            ])) : q("", !0),
            e.message.content ? (v(), y("div", {
              key: 1,
              class: "oc-message-text",
              innerHTML: d.value
            }, null, 8, ps)) : q("", !0),
            e.isStreaming ? (v(), y("span", vs, "▋")) : q("", !0)
          ]),
          i("footer", ys, [
            i("button", {
              type: "button",
              onClick: ae
            }, k(p.value), 1),
            e.message.role === "assistant" ? (v(), y("button", {
              key: 0,
              type: "button",
              onClick: L[0] || (L[0] = (V) => N.$emit("regenerate"))
            }, k(I(a)("message.regenerate")), 1)) : q("", !0)
          ])
        ]),
        l.value ? (v(), y("div", {
          key: 1,
          class: "oc-context-mask",
          onClick: L[1] || (L[1] = (V) => l.value = !1),
          onKeyup: L[2] || (L[2] = Ct((V) => l.value = !1, ["esc"]))
        }, null, 32)) : q("", !0),
        l.value ? (v(), y("menu", {
          key: 2,
          class: "oc-context-menu",
          style: It(E.value)
        }, [
          i("button", {
            type: "button",
            onClick: L[3] || (L[3] = (V) => O("copy"))
          }, k(I(a)("message.copy")), 1),
          u.value ? (v(), y("button", {
            key: 0,
            type: "button",
            onClick: L[4] || (L[4] = (V) => O("copy-code"))
          }, "Copy Code")) : q("", !0),
          i("button", {
            type: "button",
            onClick: L[5] || (L[5] = (V) => O("quote"))
          }, k(I(a)("message.quote")), 1),
          e.message.role === "user" ? (v(), y("button", {
            key: 1,
            type: "button",
            class: "danger",
            onClick: L[6] || (L[6] = (V) => O("delete"))
          }, k(I(a)("message.delete")), 1)) : q("", !0)
        ], 4)) : q("", !0)
      ], 34);
    };
  }
}), at = /* @__PURE__ */ be(ws, [["__scopeId", "data-v-2a663581"]]), Ss = {
  key: 0,
  class: "oc-empty-state"
}, Cs = {
  key: 1,
  class: "oc-loading"
}, Is = /* @__PURE__ */ Ce({
  __name: "MessageList",
  props: {
    messages: {},
    streaming: { type: Boolean, default: !1 },
    streamingMessageId: { default: "" },
    loading: { type: Boolean, default: !1 }
  },
  emits: ["scroll-top", "copy", "preview-image", "regenerate", "quote", "delete"],
  setup(e, { expose: t, emit: s }) {
    const n = e, a = s, { t: g } = Ie(), l = b(null), T = b(!1);
    function A() {
      const d = l.value;
      return d ? d.scrollHeight - d.scrollTop - d.clientHeight < 120 : !0;
    }
    function h(d = "auto") {
      const u = l.value;
      u && (u.scrollTo({ top: u.scrollHeight, behavior: d }), T.value = !1);
    }
    function M() {
      const d = l.value;
      d && (d.scrollTop <= 0 && a("scroll-top"), T.value = !A());
    }
    return me(
      () => n.messages.length,
      async () => {
        const d = A();
        await Ke(), d && h();
      }
    ), me(
      () => {
        var d;
        return (d = n.messages.at(-1)) == null ? void 0 : d.content;
      },
      async () => {
        const d = A();
        await Ke(), n.streaming && d && h();
      }
    ), t({
      scrollToBottom: h
    }), (d, u) => (v(), y("section", {
      ref_key: "containerRef",
      ref: l,
      class: "oc-message-list",
      role: "log",
      "aria-live": "polite",
      onScroll: M
    }, [
      e.messages.length === 0 ? (v(), y("div", Ss, [
        i("h3", null, k(I(g)("chat.empty")), 1),
        u[5] || (u[5] = i("p", null, [
          Se("Try: "),
          i("code", null, "/help"),
          Se(" · "),
          i("code", null, "/new"),
          Se(" · "),
          i("code", null, "/think")
        ], -1))
      ])) : q("", !0),
      ye(bt, {
        name: "oc-message",
        tag: "div",
        class: "oc-message-stack",
        appear: ""
      }, {
        default: tt(() => [
          (v(!0), y(ue, null, ce(e.messages, (p) => (v(), kt(at, {
            key: p.id,
            message: p,
            "is-streaming": e.streaming && p.id === e.streamingMessageId,
            onCopy: u[0] || (u[0] = (S) => d.$emit("copy", S)),
            onPreviewImage: u[1] || (u[1] = (S) => d.$emit("preview-image", S)),
            onRegenerate: (S) => d.$emit("regenerate", p.id),
            onQuote: u[2] || (u[2] = (S) => d.$emit("quote", S)),
            onDelete: u[3] || (u[3] = (S) => d.$emit("delete", S))
          }, null, 8, ["message", "is-streaming", "onRegenerate"]))), 128))
        ]),
        _: 1
      }),
      e.loading && !e.streaming ? (v(), y("div", Cs, [...u[6] || (u[6] = [
        i("span", null, null, -1),
        i("span", null, null, -1),
        i("span", null, null, -1)
      ])])) : q("", !0),
      T.value ? (v(), y("button", {
        key: 2,
        type: "button",
        class: "oc-scroll-btn",
        onClick: u[4] || (u[4] = (p) => h("smooth"))
      }, " ↓ New ")) : q("", !0)
    ], 544));
  }
}), ot = /* @__PURE__ */ be(Is, [["__scopeId", "data-v-ea959da0"]]), bs = { class: "oc-session-header" }, ks = { class: "oc-session-heading" }, Ms = { class: "oc-session-header-actions" }, $s = { class: "oc-session-search-wrap" }, As = {
  key: 0,
  class: "oc-session-empty"
}, _s = {
  key: 1,
  class: "oc-session-items"
}, Ls = ["onClick"], Ts = { class: "oc-session-main" }, Es = { class: "oc-session-title" }, xs = {
  key: 0,
  class: "oc-pin"
}, Ds = { class: "oc-session-meta" }, Rs = { class: "oc-session-agent" }, Us = { class: "oc-session-time" }, Ns = { class: "oc-session-sub" }, Os = { class: "oc-session-preview" }, qs = {
  key: 0,
  class: "oc-session-count"
}, Ws = { class: "oc-session-actions" }, Ps = ["onClick"], zs = ["onClick"], Vs = /* @__PURE__ */ Ce({
  __name: "SessionList",
  props: {
    sessions: {},
    currentId: {},
    agentLabels: { default: () => ({}) },
    visible: { type: Boolean, default: !0 }
  },
  emits: ["update:visible", "select", "delete", "reset", "new"],
  setup(e, { emit: t }) {
    const s = e, n = t, { t: a, locale: g } = Ie(), l = b(""), T = x(() => {
      const M = l.value.trim().toLowerCase(), d = [...s.sessions].sort((u, p) => !!u.pinned != !!p.pinned ? u.pinned ? -1 : 1 : p.updatedAt - u.updatedAt);
      return M ? d.filter((u) => u.title.toLowerCase().includes(M) || u.lastMessage.toLowerCase().includes(M)) : d;
    });
    function A(M) {
      n("select", M), window.innerWidth < 900 && n("update:visible", !1);
    }
    function h(M) {
      return s.agentLabels[M] ? s.agentLabels[M] : M;
    }
    return (M, d) => (v(), y("aside", {
      class: te(["oc-session-list", { hidden: !e.visible }])
    }, [
      i("header", bs, [
        i("div", ks, [
          i("strong", null, k(I(a)("session.title")), 1),
          i("p", null, k(T.value.length) + " sessions", 1)
        ]),
        i("div", Ms, [
          i("button", {
            type: "button",
            class: "oc-session-btn",
            onClick: d[0] || (d[0] = (u) => n("new"))
          }, "＋")
        ])
      ]),
      i("div", $s, [
        Ee(i("input", {
          "onUpdate:modelValue": d[1] || (d[1] = (u) => l.value = u),
          type: "text",
          placeholder: "Search sessions...",
          class: "oc-session-search"
        }, null, 512), [
          [et, l.value]
        ])
      ]),
      T.value.length === 0 ? (v(), y("div", As, k(I(a)("session.empty")), 1)) : (v(), y("ul", _s, [
        (v(!0), y(ue, null, ce(T.value, (u) => (v(), y("li", {
          key: u.id,
          class: te(["oc-session-item", { active: u.id === e.currentId }]),
          onClick: (p) => A(u.id)
        }, [
          i("div", Ts, [
            i("span", Es, [
              u.pinned ? (v(), y("span", xs, "📌")) : q("", !0),
              Se(" " + k(u.title), 1)
            ]),
            i("div", Ds, [
              i("span", Rs, k(h(u.agentId)), 1),
              i("span", Us, k(I(is)(u.updatedAt, I(g))), 1)
            ])
          ]),
          i("div", Ns, [
            i("span", Os, k(u.lastMessage || "..."), 1),
            u.messageCount > 0 ? (v(), y("span", qs, k(u.messageCount > 99 ? "99+" : u.messageCount), 1)) : q("", !0)
          ]),
          i("div", Ws, [
            i("button", {
              type: "button",
              title: "Clear",
              onClick: fe((p) => n("reset", u.id), ["stop"])
            }, "↺", 8, Ps),
            i("button", {
              type: "button",
              title: "Delete",
              onClick: fe((p) => n("delete", u.id), ["stop"])
            }, "✕", 8, zs)
          ])
        ], 10, Ls))), 128))
      ]))
    ], 2));
  }
}), it = /* @__PURE__ */ be(Vs, [["__scopeId", "data-v-5472d298"]]);
let Me = null;
function Bs() {
  const e = yt();
  return e || (Me || (Me = Xe()), wt(Me), Me);
}
function Ge(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e) {
    const n = t.get(s.id);
    if (!n) {
      t.set(s.id, { ...s });
      continue;
    }
    const a = s.content.length >= n.content.length ? s.content : n.content, g = Math.max(n.timestamp, s.timestamp);
    t.set(s.id, {
      ...n,
      ...s,
      content: a,
      timestamp: g,
      status: s.status ?? n.status,
      statusReason: s.statusReason ?? n.statusReason,
      images: s.images ?? n.images
    });
  }
  return [...t.values()].sort((s, n) => s.timestamp - n.timestamp);
}
const rt = Te("chat", {
  state: () => ({
    messages: {},
    currentSessionId: "default",
    streamingMessageId: null
  }),
  getters: {
    currentMessages(e) {
      return e.messages[e.currentSessionId] ?? [];
    },
    hasMessages(e) {
      return (e.messages[e.currentSessionId] ?? []).length > 0;
    },
    lastMessage(e) {
      const t = e.messages[e.currentSessionId] ?? [];
      return t[t.length - 1];
    }
  },
  actions: {
    ensureSession(e) {
      this.messages[e] || (this.messages[e] = []);
    },
    setCurrentSession(e) {
      this.ensureSession(e), this.currentSessionId = e;
    },
    addMessage(e, t) {
      this.ensureSession(e), this.messages[e].push(t);
    },
    setSessionMessages(e, t) {
      this.ensureSession(e), this.messages[e] = Ge(t);
    },
    mergeMessages(e, t) {
      this.ensureSession(e), this.messages[e] = Ge([...this.messages[e] ?? [], ...t]);
    },
    updateMessage(e, t, s) {
      const n = (this.messages[e] ?? []).find((a) => a.id === t);
      n && Object.assign(n, s);
    },
    deleteMessage(e, t) {
      this.messages[e] = (this.messages[e] ?? []).filter((s) => s.id !== t);
    },
    clearMessages(e) {
      this.messages[e] = [];
    },
    setStreaming(e, t) {
      this.ensureSession(e), this.streamingMessageId = t;
    },
    appendStreamContent(e, t, s) {
      this.ensureSession(e);
      const n = this.messages[e].find((a) => a.id === t);
      if (!n) {
        this.messages[e].push({
          id: t,
          role: "assistant",
          content: s,
          timestamp: Date.now(),
          status: "delivered"
        });
        return;
      }
      n.content += s;
    },
    getMessage(e, t) {
      return (this.messages[e] ?? []).find((s) => s.id === t);
    }
  }
});
function Ye(e, t, s = "main") {
  var a, g;
  return {
    id: t ?? ((g = (a = globalThis.crypto) == null ? void 0 : a.randomUUID) == null ? void 0 : g.call(a)) ?? `${Date.now()}`,
    title: e,
    updatedAt: Date.now(),
    lastMessage: "",
    messageCount: 0,
    agentId: s,
    pinned: !1
  };
}
const lt = Te("session", {
  state: () => {
    const e = Ye("新会话", "default", "main");
    return {
      sessions: [e],
      currentId: e.id,
      searchQuery: ""
    };
  },
  getters: {
    sortedSessions(e) {
      return [...e.sessions].sort((t, s) => !!t.pinned != !!s.pinned ? t.pinned ? -1 : 1 : s.updatedAt - t.updatedAt);
    },
    currentSession(e) {
      return e.sessions.find((t) => t.id === e.currentId);
    },
    pinnedSessions(e) {
      return e.sessions.filter((t) => t.pinned);
    },
    filteredSessions(e) {
      const t = e.searchQuery.trim().toLowerCase();
      return t ? e.sessions.filter((s) => s.title.toLowerCase().includes(t)) : e.sessions;
    }
  },
  actions: {
    createSession(e = "新会话", t, s = "main") {
      const n = Ye(e, t, s);
      return this.sessions.unshift(n), this.currentId = n.id, n;
    },
    selectSession(e) {
      this.sessions.some((t) => t.id === e) && (this.currentId = e);
    },
    deleteSession(e) {
      if (this.sessions = this.sessions.filter((t) => t.id !== e), this.sessions.length === 0) {
        const t = this.createSession("新会话");
        this.currentId = t.id;
        return;
      }
      this.currentId === e && (this.currentId = this.sessions[0].id);
    },
    updateTitle(e, t) {
      const s = this.sessions.find((n) => n.id === e);
      s && (s.title = t.slice(0, 50), s.updatedAt = Date.now());
    },
    updateAgent(e, t) {
      const s = this.sessions.find((a) => a.id === e);
      if (!s)
        return;
      const n = (t || "main").trim().replace(/[^a-zA-Z0-9_-]/g, "") || "main";
      s.agentId = n, s.updatedAt = Date.now(), this.reorderSessions();
    },
    pinSession(e, t) {
      const s = this.sessions.find((n) => n.id === e);
      s && (s.pinned = t, this.reorderSessions());
    },
    resetSession(e) {
      const t = this.sessions.find((s) => s.id === e);
      t && (t.lastMessage = "", t.messageCount = 0, t.updatedAt = Date.now());
    },
    touchSession(e, t) {
      const s = this.sessions.find((n) => n.id === e);
      s && (s.lastMessage = t, s.messageCount += 1, s.updatedAt = Date.now(), this.reorderSessions());
    },
    syncSessionSnapshot(e, t) {
      const s = this.sessions.find((n) => n.id === e);
      s && (typeof t.lastMessage == "string" && (s.lastMessage = t.lastMessage), typeof t.messageCount == "number" && (s.messageCount = Math.max(0, Math.floor(t.messageCount))), typeof t.updatedAt == "number" && Number.isFinite(t.updatedAt) && (s.updatedAt = t.updatedAt), this.reorderSessions());
    },
    reorderSessions() {
      this.sessions = [...this.sortedSessions];
    }
  }
}), Hs = Te("connection", {
  state: () => ({
    status: "disconnected",
    reconnectCount: 0,
    lastError: null,
    latency: 0
  }),
  actions: {
    setStatus(e, t) {
      this.status = e, this.lastError = t ?? null;
    },
    incrementReconnect() {
      this.reconnectCount += 1;
    },
    resetReconnect() {
      this.reconnectCount = 0;
    },
    setLatency(e) {
      this.latency = e;
    }
  }
});
function Fs(e) {
  const t = b(null), s = b("disconnected"), n = b(0), a = b(null);
  let g = null, l = null, T = !1;
  const A = e.reconnectMax ?? 5, h = e.reconnectDelay ?? 3e3;
  function M() {
    g && (window.clearTimeout(g), g = null), l && (window.clearInterval(l), l = null);
  }
  function d(_) {
    const E = _.trim();
    if (!E)
      throw new Error("Gateway URL is empty");
    const Y = /^wss?:\/\//.test(E) || /^https?:\/\//.test(E) ? E : `http://${E}`, B = new URL(Y);
    B.protocol = B.protocol === "https:" || B.protocol === "wss:" ? "wss:" : "ws:";
    const j = B.pathname.replace(/\/+$/, "");
    return B.pathname = j.endsWith("/ws") ? j || "/ws" : `${j || ""}/ws`, B.search = "", B.hash = "", B.toString().replace(/\/$/, "");
  }
  function u() {
    l = window.setInterval(() => {
      t.value && t.value.readyState === WebSocket.OPEN && G({ type: "ping" });
    }, 3e4);
  }
  function p() {
    if (n.value >= A) {
      s.value = "error";
      return;
    }
    n.value += 1, s.value = "reconnecting";
    const _ = Math.min(h * n.value, 15e3);
    g = window.setTimeout(() => {
      S();
    }, _);
  }
  async function S() {
    T = !1, M();
    try {
      const _ = d(e.gatewayUrl);
      t.value = new WebSocket(_);
    } catch (_) {
      s.value = "error", a.value = _ instanceof Error ? _.message : String(_), p();
      return;
    }
    t.value.onopen = () => {
      var _;
      s.value = "connected", n.value = 0, a.value = null, u(), (_ = e.onConnect) == null || _.call(e), e.token && G({
        type: "auth",
        payload: {
          token: e.token
        }
      });
    }, t.value.onmessage = (_) => {
      var E;
      try {
        const Y = JSON.parse(_.data);
        (E = e.onMessage) == null || E.call(e, Y);
      } catch {
        s.value = "error", a.value = "Failed to parse websocket payload";
      }
    }, t.value.onerror = (_) => {
      var E;
      s.value = "error", (E = e.onError) == null || E.call(e, _);
    }, t.value.onclose = (_) => {
      var E;
      if (M(), (E = e.onDisconnect) == null || E.call(e, _), T) {
        s.value = "disconnected";
        return;
      }
      p();
    };
  }
  function P() {
    T = !0, M(), t.value && (t.value.onclose = null, t.value.close(), t.value = null), s.value = "disconnected";
  }
  function K() {
    M(), t.value && (t.value.onclose = null, t.value.close(), t.value = null), T = !1, S();
  }
  function G(_) {
    if (!t.value || t.value.readyState !== WebSocket.OPEN)
      throw new Error("WebSocket is not connected");
    t.value.send(JSON.stringify(_));
  }
  return Mt(() => {
    P();
  }), {
    ws: t,
    status: s,
    reconnectCount: n,
    lastError: a,
    connect: S,
    disconnect: P,
    reconnect: K,
    send: G
  };
}
function Ks() {
  const e = b([]);
  function t(g) {
    e.value.push(g);
  }
  function s() {
    return e.value.shift();
  }
  function n(g) {
    e.value.splice(g, 1);
  }
  function a() {
    e.value = [];
  }
  return {
    queue: e,
    enqueue: t,
    dequeue: s,
    remove: n,
    clear: a
  };
}
function js() {
  var e, t;
  return ((t = (e = globalThis.crypto) == null ? void 0 : e.randomUUID) == null ? void 0 : t.call(e)) ?? `${Date.now()}-${Math.random()}`;
}
function Qs(e) {
  const t = rt(), s = lt(), n = Hs(), { queue: a, enqueue: g, dequeue: l, remove: T } = Ks(), A = b(!1), h = b(!1), M = b(!1), d = b(null), u = b(null), p = b(null), S = b(null), P = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set(), _ = /* @__PURE__ */ new Map(), E = Math.min(Math.max(e.historyLimit ?? 80, 20), 300), Y = Math.min(Math.max(e.historyStep ?? 50, 20), 150);
  e.sessionId && (s.sessions.some((o) => o.id === e.sessionId) || s.createSession("新会话", e.sessionId, e.defaultAgentId ?? "main"), s.selectSession(e.sessionId)), t.setCurrentSession(s.currentId);
  function B() {
    return e.gatewayUrl.endsWith("/") ? e.gatewayUrl.slice(0, -1) : e.gatewayUrl;
  }
  function j(o) {
    return P.get(o) ?? s.currentId;
  }
  function ie(o) {
    var W;
    return (((W = s.sessions.find((U) => U.id === o)) == null ? void 0 : W.agentId) ?? e.defaultAgentId ?? "main").trim().replace(/[^a-zA-Z0-9_-]/g, "") || "main";
  }
  function ae(o, C) {
    return `${C}::${o}`;
  }
  function O(o, C) {
    const $ = j(o);
    t.updateMessage($, o, C);
  }
  function N(o) {
    const C = j(o.messageId), $ = K.get(o.messageId) ?? `ai-${o.messageId}`;
    K.set(o.messageId, $), S.value = $, t.setStreaming(C, $), t.appendStreamContent(C, $, o.content), O(o.messageId, { status: "streaming" }), h.value = !1, A.value = !0;
  }
  function L(o) {
    const C = o.reason ? String(o.reason).slice(0, 200) : void 0;
    if (O(o.messageId, {
      status: o.status,
      statusReason: C
    }), o.status === "accepted" || o.status === "processing") {
      h.value = !0;
      return;
    }
    if (o.status === "streaming") {
      h.value = !1, A.value = !0;
      return;
    }
    (o.status === "failed" || o.status === "aborted") && p.value === o.messageId && (h.value = !1);
  }
  function Q(o) {
    const C = j(o);
    p.value === o && (p.value = null, S.value = null, h.value = !1, A.value = !1), t.setStreaming(C, null), P.delete(o), K.delete(o);
    const $ = l();
    $ && se($.content, $.images);
  }
  async function V(o = {}) {
    var ne;
    const C = (o.sessionId ?? s.currentId).trim();
    if (!C || M.value)
      return;
    const $ = ie(C), W = ae(C, $), U = _.get(W) ?? E, z = o.limit ?? (o.append ? U + Y : U), H = Math.min(Math.max(z, 20), 300), ee = (t.messages[C] ?? []).length > 0;
    if (!(!o.force && !o.append && G.has(W) && ee)) {
      _.set(W, H), d.value = null, M.value = !0;
      try {
        const F = await fetch(
          `${B()}/sessions/${encodeURIComponent(C)}/history?limit=${H}&agentId=${encodeURIComponent($)}`
        );
        if (!F.ok)
          throw new Error(`HTTP ${F.status}`);
        const oe = (await F.json()).messages.filter((Z) => typeof Z.content == "string" && Z.content.trim().length > 0).map((Z) => ({
          id: Z.id,
          role: Z.role,
          content: Z.content,
          timestamp: Z.timestamp,
          status: Z.role === "user" ? "delivered" : "sent"
        }));
        o.replace ? t.setSessionMessages(C, oe) : t.mergeMessages(C, oe);
        const pe = ((ne = t.messages[C]) == null ? void 0 : ne.length) ?? oe.length, ve = [...oe].reverse().find((Z) => Z.role !== "system") ?? oe[oe.length - 1];
        ve && s.syncSessionSnapshot(C, {
          lastMessage: ve.content,
          messageCount: pe,
          updatedAt: ve.timestamp
        }), G.add(W);
      } catch (F) {
        d.value = F instanceof Error ? F.message : String(F);
      } finally {
        M.value = !1;
      }
    }
  }
  function X(o) {
    var C, $, W, U;
    switch (o.type) {
      case "connected": {
        n.setStatus("connected");
        break;
      }
      case "auth_failed": {
        n.setStatus("error", o.error), h.value = !1, A.value = !1;
        break;
      }
      case "message_received": {
        O(o.messageId, {
          status: o.duplicate ? "processing" : "accepted"
        }), h.value = !0, o.duplicate && (A.value = !0);
        break;
      }
      case "message_status": {
        L(o);
        break;
      }
      case "chunk": {
        N(o);
        break;
      }
      case "stream_end": {
        if (o.error) {
          const z = o.aborted ? "aborted" : "failed";
          O(o.messageId, { status: z });
        } else
          O(o.messageId, { status: "delivered" });
        Q(o.messageId);
        break;
      }
      case "message": {
        const z = s.currentId;
        t.addMessage(z, {
          id: o.id,
          role: "assistant",
          content: o.content,
          timestamp: o.timestamp,
          status: "delivered"
        }), s.touchSession(z, o.content), h.value = !1, A.value = !1;
        break;
      }
      case "stopped": {
        O(o.messageId, {
          status: "aborted",
          statusReason: o.noop ? "noop" : "stopped_by_user"
        }), Q(o.messageId);
        break;
      }
      case "error": {
        const z = (C = o.error) == null ? void 0 : C.details, H = (($ = o.error) == null ? void 0 : $.message) ?? "Unknown websocket error", ee = ((W = o.error) == null ? void 0 : W.reason) ?? (z == null ? void 0 : z.reason) ?? H, ne = ((U = o.error) == null ? void 0 : U.messageId) ?? (z == null ? void 0 : z.messageId);
        n.setStatus("error", H), ne ? (O(ne, {
          status: "failed",
          statusReason: ee
        }), Q(ne)) : p.value && (O(p.value, {
          status: "failed",
          statusReason: ee
        }), Q(p.value)), h.value = !1, A.value = !1;
        break;
      }
      case "server_closing": {
        n.setStatus("disconnected", o.reason);
        break;
      }
    }
  }
  const R = Fs({
    gatewayUrl: e.gatewayUrl,
    token: e.token,
    reconnectMax: e.reconnectMax,
    reconnectDelay: e.reconnectDelay,
    onMessage: X,
    onConnect: () => {
      if (n.setStatus("connected"), n.resetReconnect(), !p.value && !A.value) {
        const o = l();
        o && se(o.content, o.images);
      }
    },
    onDisconnect: () => {
      n.setStatus("disconnected"), p.value && O(p.value, {
        status: "pending",
        statusReason: "connection_lost"
      });
    },
    onError: () => {
      n.setStatus("error", "WebSocket error");
    }
  });
  async function se(o, C) {
    const $ = o.trim();
    if (!$)
      return;
    const W = e.maxMessageLength ?? 4e3;
    if ($.length > W)
      throw new Error(`Message exceeds max length: ${W}`);
    const U = s.currentId, z = ie(U), H = js(), ee = C == null ? void 0 : C.map((F) => ({
      url: URL.createObjectURL(F)
    }));
    t.addMessage(U, {
      id: H,
      role: "user",
      content: u.value ? `> ${u.value.content}

${$}` : $,
      timestamp: Date.now(),
      images: ee,
      status: "pending"
    }), s.touchSession(U, $), p.value = H, S.value = `ai-${H}`, P.set(H, U), K.set(H, S.value), t.setStreaming(U, S.value), h.value = !0, A.value = !1;
    const ne = ee == null ? void 0 : ee.map((F) => F.url);
    try {
      R.send({
        type: "chat",
        payload: {
          content: $,
          sessionId: U,
          messageId: H,
          agentId: z,
          attachments: ne
        }
      });
    } catch (F) {
      const he = F instanceof Error ? F.message : "Failed to send message";
      O(H, {
        status: "failed",
        statusReason: he
      }), Q(H), n.setStatus("error", he);
    }
    u.value = null;
  }
  async function c(o, C) {
    if (h.value || A.value) {
      g({ content: o, images: C });
      return;
    }
    await se(o, C);
  }
  function m() {
    if (!p.value)
      return;
    const o = p.value;
    try {
      R.send({
        type: "stop",
        payload: {
          messageId: o
        }
      });
    } catch {
    }
    O(o, {
      status: "aborted",
      statusReason: "stopped_by_user"
    }), Q(o);
  }
  function w(o) {
    u.value = o;
  }
  function J(o) {
    const C = t.currentMessages, $ = C.findIndex((U) => U.id === o);
    if ($ === -1)
      return;
    let W = C[$];
    if (W.role !== "user") {
      for (let U = $ - 1; U >= 0; U -= 1)
        if (C[U].role === "user") {
          W = C[U];
          break;
        }
    }
    W.role === "user" && c(W.content);
  }
  function de() {
    return R.connect();
  }
  function $e(o) {
    T(o);
  }
  return {
    messages: x(() => t.currentMessages),
    isStreaming: A,
    isLoading: h,
    isConnected: x(() => R.status.value === "connected"),
    status: x(() => R.status.value),
    reconnectCount: x(() => R.reconnectCount.value),
    queue: a,
    quoteMessage: u,
    send: c,
    stop: m,
    quote: w,
    retry: J,
    connect: de,
    loadHistory: V,
    disconnect: R.disconnect,
    reconnect: R.reconnect,
    removeFromQueue: $e,
    isHistoryLoading: M,
    historyError: d
  };
}
function Gs(e) {
  return e || (typeof localStorage > "u" ? "system" : localStorage.getItem("openclaw:theme") ?? "system");
}
function Ys() {
  return typeof window < "u" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function Xs(e) {
  const t = b(Gs(e)), s = x(() => t.value === "system" ? Ys() : t.value === "dark");
  function n(g) {
    t.value = g, typeof localStorage < "u" && localStorage.setItem("openclaw:theme", g);
  }
  function a() {
    n(s.value ? "light" : "dark");
  }
  return $t(() => {
    typeof document > "u" || (document.documentElement.dataset.openclawTheme = s.value ? "dark" : "light");
  }), {
    theme: t,
    isDark: s,
    setTheme: n,
    toggle: a
  };
}
const Zs = {}, le = {
  autoScroll: !0,
  enableTypingIndicator: !0,
  maxFileSize: 10 * 1024 * 1024,
  allowedFileTypes: ["image/*"],
  maxMessageLength: 4e3,
  reconnectMax: 5,
  reconnectDelay: 3e3
}, _e = [
  {
    id: "main",
    name: "main"
  }
], ut = {
  mode: "system"
}, Le = {
  gatewayUrl: "http://127.0.0.1:3000",
  token: "",
  sessionId: "",
  userId: "",
  defaultAgentId: "main",
  agents: _e,
  locale: "auto",
  theme: ut,
  options: le
};
function Js(e) {
  if (typeof e != "string")
    return _e;
  const t = e.split(",").map((s) => s.trim()).filter(Boolean).map((s) => {
    const [n, a] = s.split(":"), g = (n ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "");
    return g ? {
      id: g,
      name: (a ?? "").trim() || g
    } : null;
  }).filter((s) => s !== null);
  return t.length === 0 ? _e : (t.some((s) => s.id === "main") || t.unshift({
    id: "main",
    name: "main"
  }), t);
}
function ct(e = {}) {
  return {
    ...Le,
    ...e,
    theme: {
      ...ut,
      ...e.theme ?? {}
    },
    options: {
      ...le,
      ...e.options ?? {}
    }
  };
}
function Mn(e) {
  const t = e ?? Zs ?? {};
  return ct({
    gatewayUrl: String(t.VITE_OPENCLAW_GATEWAY_URL ?? Le.gatewayUrl),
    token: String(t.VITE_OPENCLAW_TOKEN ?? ""),
    defaultAgentId: String(t.VITE_OPENCLAW_DEFAULT_AGENT_ID ?? Le.defaultAgentId),
    agents: Js(t.VITE_OPENCLAW_AGENTS),
    locale: String(t.VITE_OPENCLAW_LOCALE ?? "auto"),
    theme: {
      mode: t.VITE_OPENCLAW_THEME ?? "system"
    },
    options: {
      maxMessageLength: Number(t.VITE_OPENCLAW_MAX_MESSAGE_LENGTH ?? le.maxMessageLength),
      reconnectDelay: Number(t.VITE_OPENCLAW_RECONNECT_DELAY ?? le.reconnectDelay),
      reconnectMax: Number(t.VITE_OPENCLAW_RECONNECT_MAX ?? le.reconnectMax),
      maxFileSize: Number(t.VITE_OPENCLAW_MAX_FILE_SIZE ?? le.maxFileSize),
      autoScroll: String(t.VITE_OPENCLAW_AUTO_SCROLL ?? "true") !== "false",
      enableTypingIndicator: String(t.VITE_OPENCLAW_TYPING_INDICATOR ?? "true") !== "false",
      allowedFileTypes: le.allowedFileTypes
    }
  });
}
const en = { class: "oc-chat-header" }, tn = { class: "oc-chat-header-main" }, sn = { class: "oc-title-block" }, nn = { class: "oc-chat-header-actions" }, an = { class: "oc-chat-body" }, on = { class: "oc-agent-rail" }, rn = { class: "oc-agent-list" }, ln = ["title", "onClick"], un = { class: "oc-agent-avatar" }, cn = { class: "oc-chat-main" }, dn = { class: "oc-main-topbar" }, gn = { class: "oc-agent-picker" }, mn = ["value"], fn = {
  key: 0,
  class: "oc-offline"
}, hn = ["src"], pn = /* @__PURE__ */ Ce({
  __name: "ChatContainer",
  props: {
    gatewayUrl: { default: "" },
    token: { default: "" },
    sessionId: { default: "" },
    userId: { default: "" },
    defaultAgentId: { default: "main" },
    agents: { default: () => [] },
    theme: {},
    locale: { default: "auto" },
    options: { default: () => ({}) },
    initConfig: { default: () => ({}) }
  },
  emits: ["connect", "disconnect", "error", "message", "session-change"],
  setup(e, { emit: t }) {
    var De, Re, Ue, Ne, Oe, qe, We, Pe, ze, Ve, Be, He;
    Bs();
    const s = e, n = t, a = ct({
      ...s.initConfig,
      gatewayUrl: s.gatewayUrl || ((De = s.initConfig) == null ? void 0 : De.gatewayUrl),
      token: s.token || ((Re = s.initConfig) == null ? void 0 : Re.token),
      sessionId: s.sessionId || ((Ue = s.initConfig) == null ? void 0 : Ue.sessionId),
      userId: s.userId || ((Ne = s.initConfig) == null ? void 0 : Ne.userId),
      defaultAgentId: s.defaultAgentId || ((Oe = s.initConfig) == null ? void 0 : Oe.defaultAgentId),
      agents: (qe = s.agents) != null && qe.length ? s.agents : (We = s.initConfig) == null ? void 0 : We.agents,
      locale: s.locale !== "auto" ? s.locale : (Pe = s.initConfig) == null ? void 0 : Pe.locale,
      theme: s.theme ?? ((ze = s.initConfig) == null ? void 0 : ze.theme),
      options: {
        ...((Ve = s.initConfig) == null ? void 0 : Ve.options) ?? {},
        ...s.options ?? {}
      }
    }), g = rt(), l = lt(), { sortedSessions: T, currentSession: A } = St(l);
    a.sessionId && !l.sessions.some((r) => r.id === a.sessionId) && l.createSession("新会话", a.sessionId, a.defaultAgentId), a.sessionId && l.selectSession(a.sessionId), (Be = l.currentSession) != null && Be.agentId || l.updateAgent(l.currentId, a.defaultAgentId), g.setCurrentSession(l.currentId);
    const { t: h, locale: M, setLocale: d } = Ie(), { isDark: u, toggle: p } = Xs(a.theme.mode), S = b(
      a.agents.length > 0 ? a.agents : [
        {
          id: a.defaultAgentId,
          name: a.defaultAgentId
        }
      ]
    );
    a.locale && a.locale !== "auto" && d(a.locale);
    const {
      messages: P,
      isStreaming: K,
      isLoading: G,
      isConnected: _,
      status: E,
      queue: Y,
      send: B,
      stop: j,
      quote: ie,
      retry: ae,
      connect: O,
      reconnect: N,
      loadHistory: L,
      isHistoryLoading: Q,
      historyError: V
    } = Qs({
      gatewayUrl: a.gatewayUrl,
      token: a.token,
      sessionId: l.currentId,
      defaultAgentId: a.defaultAgentId,
      reconnectDelay: a.options.reconnectDelay,
      reconnectMax: a.options.reconnectMax,
      maxMessageLength: a.options.maxMessageLength
    }), X = b(""), R = b(!0), se = b(!1), c = b(""), m = b(null), w = b(((He = l.currentSession) == null ? void 0 : He.agentId) ?? a.defaultAgentId), J = x(() => l.currentId), de = x(
      () => Object.fromEntries(S.value.map((r) => [r.id, r.name]))
    ), $e = x(() => de.value[w.value] ?? w.value), o = x(() => g.streamingMessageId ?? ""), C = x(() => E.value === "connected" ? h("status.connected") : E.value === "reconnecting" ? `${h("status.reconnecting")} (${Y.value.length})` : h("chat.disconnected"));
    function $(r) {
      return (r ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "") || a.defaultAgentId || "main";
    }
    function W() {
      return a.gatewayUrl.endsWith("/") ? a.gatewayUrl.slice(0, -1) : a.gatewayUrl;
    }
    async function U() {
      try {
        const r = await fetch(`${W()}/agents`);
        if (!r.ok)
          return;
        const f = await r.json();
        if (!Array.isArray(f.agents) || f.agents.length === 0)
          return;
        S.value = f.agents.map((ge) => {
          var Fe;
          return {
            id: $(ge.id),
            name: ((Fe = ge.name) == null ? void 0 : Fe.trim()) || ge.id
          };
        });
        const re = $(f.defaultAgentId), D = w.value;
        S.value.some((ge) => ge.id === D) || (w.value = re, l.updateAgent(l.currentId, re));
      } catch {
      }
    }
    function z(r) {
      if ((r.metaKey || r.ctrlKey) && r.shiftKey && r.key.toLowerCase() === "l") {
        r.preventDefault(), p();
        return;
      }
      (r.metaKey || r.ctrlKey) && r.key.toLowerCase() === "b" && (r.preventDefault(), R.value = !R.value);
    }
    Ze(async () => {
      window.addEventListener("keydown", z);
      try {
        await O(), await U(), await L({ force: !0 }), n("connect");
      } catch (r) {
        n("error", { error: r instanceof Error ? r.message : "connect failed" });
      }
    }), Je(() => {
      window.removeEventListener("keydown", z);
    }), me(
      () => l.currentId,
      (r, f) => {
        var D;
        if (r === f)
          return;
        g.setCurrentSession(r);
        const re = l.currentSession;
        re && !re.agentId && l.updateAgent(r, a.defaultAgentId), w.value = ((D = l.currentSession) == null ? void 0 : D.agentId) ?? a.defaultAgentId, n("session-change", { sessionId: r }), L({ sessionId: r, replace: !0 });
      }
    ), me(
      () => E.value,
      (r) => {
        r === "error" && n("error", { error: "WebSocket connection error" }), r === "disconnected" && n("disconnect", { reason: "socket closed" });
      }
    ), me(
      () => V.value,
      (r) => {
        r && n("error", { error: `History sync failed: ${r}` });
      }
    ), me(
      () => P.value.at(-1),
      (r) => {
        r && n("message", {
          message: r,
          sessionId: l.currentId
        });
      }
    );
    async function H(r, f) {
      await B(r, f), X.value = "";
    }
    function ee(r) {
    }
    function ne(r, f) {
      if (r === "new") {
        pe();
        return;
      }
      if (r === "clear") {
        oe(l.currentId);
        return;
      }
      if (r === "model") {
        X.value = `/model ${f}`.trim();
        return;
      }
      r === "help" && g.addMessage(l.currentId, {
        id: `${Date.now()}`,
        role: "system",
        content: "/model, /think, /new, /clear, /help",
        timestamp: Date.now(),
        status: "sent"
      });
    }
    function F(r) {
      l.selectSession(r), g.setCurrentSession(r);
    }
    function he(r) {
      l.deleteSession(r), g.clearMessages(r);
    }
    function oe(r) {
      g.clearMessages(r), g.addMessage(r, {
        id: `${Date.now()}`,
        role: "system",
        content: "历史已清空",
        timestamp: Date.now(),
        status: "sent"
      }), l.resetSession(r);
    }
    function pe() {
      const r = l.createSession(h("chat.newSession"), void 0, w.value);
      g.setCurrentSession(r.id), window.innerWidth < 900 && (R.value = !1);
    }
    function ve(r) {
    }
    function Z(r) {
      c.value = r, se.value = !0;
    }
    function dt(r) {
      ae(r);
    }
    function gt(r) {
      ie(r), X.value = `> ${r.content}
`;
    }
    function mt(r) {
      g.deleteMessage(l.currentId, r);
    }
    function ft() {
      L({
        sessionId: l.currentId,
        append: !0,
        force: !0
      });
    }
    function xe() {
      const r = $(w.value), f = l.currentSession;
      f && f.agentId !== r && (l.updateAgent(f.id, r), g.clearMessages(f.id), L({
        sessionId: f.id,
        force: !0,
        replace: !0
      }));
    }
    function ht(r) {
      w.value = $(r), xe();
    }
    function pt() {
      d(M.value === "zh-CN" ? "en" : "zh-CN");
    }
    function vt() {
      N();
    }
    return (r, f) => {
      var re;
      return v(), y("section", {
        class: te(["openclaw-chat oc-chat-shell", { "is-dark": I(u) }])
      }, [
        f[11] || (f[11] = i("div", { class: "oc-grid-overlay" }, null, -1)),
        f[12] || (f[12] = i("div", { class: "oc-bg-orb oc-bg-orb-a" }, null, -1)),
        f[13] || (f[13] = i("div", { class: "oc-bg-orb oc-bg-orb-b" }, null, -1)),
        i("header", en, [
          i("div", tn, [
            i("button", {
              type: "button",
              class: "oc-mobile-menu",
              "aria-label": "Toggle sessions",
              onClick: f[0] || (f[0] = (D) => R.value = !R.value)
            }, "☰"),
            i("div", sn, [
              i("strong", null, k(((re = I(A)) == null ? void 0 : re.title) || I(h)("chat.title")), 1),
              i("p", null, k($e.value) + " · Web Channel", 1)
            ])
          ]),
          i("div", nn, [
            i("span", {
              class: te(["oc-connection", I(E)])
            }, [
              f[7] || (f[7] = i("span", { class: "dot" }, null, -1)),
              Se(" " + k(C.value), 1)
            ], 2),
            i("button", {
              type: "button",
              class: "oc-pill-btn",
              onClick: f[1] || (f[1] = //@ts-ignore
              (...D) => I(p) && I(p)(...D))
            }, k(I(u) ? "Light" : "Dark"), 1),
            i("button", {
              type: "button",
              class: "oc-pill-btn",
              onClick: pt
            }, k(I(M) === "zh-CN" ? "EN" : "中文"), 1),
            i("button", {
              type: "button",
              class: "oc-pill-btn primary",
              onClick: pe
            }, k(I(h)("chat.newSession")), 1)
          ])
        ]),
        i("div", an, [
          R.value ? (v(), y("div", {
            key: 0,
            class: "oc-sidebar-mask",
            onClick: f[2] || (f[2] = (D) => R.value = !1)
          })) : q("", !0),
          i("div", {
            class: te(["oc-left-zone", { hidden: !R.value }])
          }, [
            i("aside", on, [
              f[9] || (f[9] = i("div", { class: "oc-agent-rail-head" }, "AG", -1)),
              i("div", rn, [
                (v(!0), y(ue, null, ce(S.value, (D) => (v(), y("button", {
                  key: D.id,
                  type: "button",
                  class: te(["oc-agent-item", { active: w.value === D.id }]),
                  title: D.name,
                  onClick: (ge) => ht(D.id)
                }, [
                  i("span", un, k(D.name.slice(0, 2).toUpperCase()), 1),
                  f[8] || (f[8] = i("span", { class: "oc-agent-dot" }, null, -1))
                ], 10, ln))), 128))
              ])
            ]),
            ye(it, {
              visible: R.value,
              "onUpdate:visible": f[3] || (f[3] = (D) => R.value = D),
              sessions: I(T),
              "current-id": J.value,
              "agent-labels": de.value,
              onSelect: F,
              onDelete: he,
              onReset: oe,
              onNew: pe
            }, null, 8, ["visible", "sessions", "current-id", "agent-labels"])
          ], 2),
          i("main", cn, [
            i("div", dn, [
              i("label", gn, [
                i("span", null, k(I(h)("chat.agent")), 1),
                Ee(i("select", {
                  "onUpdate:modelValue": f[4] || (f[4] = (D) => w.value = D),
                  onChange: xe
                }, [
                  (v(!0), y(ue, null, ce(S.value, (D) => (v(), y("option", {
                    key: D.id,
                    value: D.id
                  }, k(D.name), 9, mn))), 128))
                ], 544), [
                  [At, w.value]
                ])
              ]),
              f[10] || (f[10] = i("p", { class: "oc-shortcuts" }, "⌘/Ctrl+B · ⌘/Ctrl+Shift+L", -1))
            ]),
            ye(ot, {
              ref_key: "messageListRef",
              ref: m,
              messages: I(P),
              streaming: I(K),
              "streaming-message-id": o.value,
              loading: I(G) || I(Q),
              onCopy: ve,
              onPreviewImage: Z,
              onRegenerate: dt,
              onQuote: gt,
              onDelete: mt,
              onScrollTop: ft
            }, null, 8, ["messages", "streaming", "streaming-message-id", "loading"]),
            ye(_t, { name: "oc-fade" }, {
              default: tt(() => [
                I(_) ? q("", !0) : (v(), y("div", fn, [
                  i("span", null, k(I(h)("chat.disconnected")), 1),
                  i("button", {
                    type: "button",
                    onClick: vt
                  }, k(I(h)("chat.reconnect")), 1)
                ]))
              ]),
              _: 1
            }),
            ye(st, {
              modelValue: X.value,
              "onUpdate:modelValue": f[5] || (f[5] = (D) => X.value = D),
              disabled: I(G) && !I(K),
              uploading: !1,
              loading: I(K),
              "queued-count": I(Y).length,
              "max-length": I(a).options.maxMessageLength,
              onSend: H,
              onUpload: ee,
              onCommand: ne,
              onStop: I(j)
            }, null, 8, ["modelValue", "disabled", "loading", "queued-count", "max-length", "onStop"])
          ])
        ]),
        se.value ? (v(), y("dialog", {
          key: 0,
          class: "oc-preview",
          open: "",
          onClick: f[6] || (f[6] = (D) => se.value = !1)
        }, [
          i("img", {
            src: c.value,
            alt: "preview"
          }, null, 8, hn)
        ])) : q("", !0)
      ], 2);
    };
  }
}), vn = /* @__PURE__ */ be(pn, [["__scopeId", "data-v-122cd438"]]), yn = [vn, ot, at, st, it];
function wn(e) {
  var s, n;
  !!((n = (s = e._context) == null ? void 0 : s.provides) != null && n.pinia) || e.use(Xe()), e.use(we);
  for (const a of yn)
    e.component(a.name ?? "OpenClawComponent", a);
}
const $n = {
  install: wn
};
export {
  vn as ChatContainer,
  st as ChatInput,
  at as MessageItem,
  ot as MessageList,
  it as SessionList,
  ct as createChatInitConfig,
  Mn as createChatInitConfigFromEnv,
  $n as default,
  Le as defaultChatInitConfig,
  ut as defaultThemeConfig,
  we as i18n,
  Qs as useChat,
  Ie as useI18n,
  Xs as useTheme,
  Fs as useWebSocket
};
//# sourceMappingURL=openclaw-web-channel-vue.js.map
