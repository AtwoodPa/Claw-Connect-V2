import { getActivePinia as pt, createPinia as Ye, setActivePinia as vt, defineStore as Te, storeToRefs as yt } from "pinia";
import { computed as x, defineComponent as Se, ref as I, onMounted as Xe, onBeforeUnmount as Ze, openBlock as y, createElementBlock as w, withModifiers as de, normalizeClass as oe, Fragment as ge, renderList as me, createElementVNode as i, toDisplayString as k, createCommentVNode as O, withDirectives as Ee, vModelText as Je, unref as v, withKeys as wt, normalizeStyle as St, watch as ce, nextTick as Fe, createTextVNode as we, createVNode as ve, TransitionGroup as Ct, withCtx as et, createBlock as It, onUnmounted as bt, watchEffect as kt, vModelSelect as Mt, Transition as $t } from "vue";
import { createI18n as At } from "vue-i18n";
import be from "highlight.js";
import { marked as Ae } from "marked";
const Ke = [
  { key: "model", label: "/model", description: "Switch model" },
  { key: "think", label: "/think", description: "Deep thinking mode" },
  { key: "new", label: "/new", description: "Create new session" },
  { key: "clear", label: "/clear", description: "Clear current session" },
  { key: "help", label: "/help", description: "Show help" }
];
function _t(e) {
  const t = e.trim();
  if (!t.startsWith("/"))
    return null;
  const [s = "", ...n] = t.slice(1).split(" ");
  return {
    command: s,
    args: n.join(" ").trim()
  };
}
function Lt(e) {
  if (!e.trim())
    return Ke;
  const t = e.toLowerCase();
  return Ke.filter((s) => s.key.includes(t));
}
const Tt = {
  title: "OpenClaw Chat",
  newSession: "New session",
  agent: "Agent",
  disconnected: "Disconnected",
  reconnect: "Reconnect",
  empty: "Start chatting with OpenClaw"
}, Et = {
  placeholder: "Type your message...",
  thinking: "Thinking...",
  stop: "Stop",
  queued: "Queued: {count}"
}, xt = {
  title: "Sessions",
  empty: "No sessions",
  delete: "Delete",
  clear: "Clear",
  new: "New"
}, Dt = {
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
}, Rt = {
  connected: "Connected",
  reconnecting: "Reconnecting",
  error: "Connection failed"
}, Ut = {
  chat: Tt,
  input: Et,
  session: xt,
  message: Dt,
  status: Rt
}, Nt = {
  title: "OpenClaw 对话",
  newSession: "新建会话",
  agent: "Agent",
  disconnected: "连接已断开",
  reconnect: "重连",
  empty: "开始和 OpenClaw 对话"
}, Ot = {
  placeholder: "输入消息...",
  thinking: "思考中...",
  stop: "停止",
  queued: "等待发送: {count}"
}, qt = {
  title: "会话",
  empty: "暂无会话",
  delete: "删除",
  clear: "清空",
  new: "新建"
}, Wt = {
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
}, Pt = {
  connected: "已连接",
  reconnecting: "重连中",
  error: "连接失败"
}, Vt = {
  chat: Nt,
  input: Ot,
  session: qt,
  message: Wt,
  status: Pt
}, zt = {
  en: Ut,
  "zh-CN": Vt
};
function Bt() {
  return typeof navigator > "u" ? "en" : navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}
const Ht = typeof localStorage < "u" ? localStorage.getItem("openclaw:locale") : null, Ft = Ht ?? Bt(), ye = At({
  legacy: !1,
  locale: Ft,
  fallbackLocale: "en",
  messages: zt
});
function Ce() {
  const e = x({
    get: () => ye.global.locale.value,
    set: (n) => {
      ye.global.locale.value = n, typeof localStorage < "u" && localStorage.setItem("openclaw:locale", n);
    }
  });
  function t(n) {
    e.value = n;
  }
  function s(n, a) {
    return a ? ye.global.t(n, a) : ye.global.t(n);
  }
  return {
    t: s,
    locale: e,
    setLocale: t
  };
}
const Kt = {
  key: 0,
  class: "oc-command-panel"
}, jt = ["onMousedown"], Qt = {
  key: 1,
  class: "oc-image-bar"
}, Gt = ["src"], Yt = ["onClick"], Xt = { class: "oc-input-main" }, Zt = { class: "oc-text-wrap" }, Jt = ["placeholder", "disabled"], es = ["disabled"], ts = { class: "oc-input-footer" }, ss = {
  key: 0,
  class: "oc-queue"
}, ns = /* @__PURE__ */ Se({
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
    const s = e, n = t, { t: a } = Ce(), g = I(null), l = I(null), T = I(null), $ = I(!1), f = I(!1), M = I(""), d = I(0), u = I(!1), h = I([]), C = x({
      get: () => s.modelValue,
      set: (c) => n("update:modelValue", c)
    }), W = x(() => Lt(M.value)), K = x(() => C.value.trim().length > 0 && C.value.length <= s.maxLength), G = x(() => s.placeholder || a("input.placeholder")), A = x(() => Math.max(0, s.maxLength - C.value.length));
    function E() {
      const c = l.value;
      c && (c.style.height = "auto", c.style.height = `${Math.min(c.scrollHeight, 200)}px`);
    }
    function Y(c) {
      const m = c.match(/\/(\w*)$/);
      if (!m) {
        f.value = !1, d.value = 0;
        return;
      }
      f.value = !0, M.value = m[1] ?? "", d.value = 0;
    }
    function B(c) {
      const m = c.target.value;
      C.value = m, E(), Y(m);
    }
    function j(c) {
      f.value = !1;
      const m = C.value;
      C.value = m.replace(/\/\w*$/, `/${c} `), n("command", c, ""), requestAnimationFrame(() => {
        var b;
        (b = l.value) == null || b.focus();
      });
    }
    function re(c) {
      if (f.value && W.value.length > 0) {
        if (c.key === "ArrowDown") {
          c.preventDefault(), d.value = (d.value + 1) % W.value.length;
          return;
        }
        if (c.key === "ArrowUp") {
          c.preventDefault(), d.value = (d.value - 1 + W.value.length) % W.value.length;
          return;
        }
        if (c.key === "Enter" && !c.shiftKey) {
          c.preventDefault(), j(W.value[d.value].key);
          return;
        }
      }
      if (c.key === "Enter" && !c.shiftKey && !$.value) {
        if (c.preventDefault(), s.loading) {
          n("stop");
          return;
        }
        N();
      }
    }
    function ae() {
      h.value.forEach((c) => {
        URL.revokeObjectURL(c.preview);
      });
    }
    function N() {
      const c = C.value.trim();
      if (s.loading) {
        n("stop");
        return;
      }
      if (!c || c.length > s.maxLength)
        return;
      const m = _t(c);
      if (m) {
        n("command", m.command, m.args), C.value = "", E();
        return;
      }
      n(
        "send",
        c,
        h.value.map((b) => b.file)
      ), C.value = "", ae(), h.value = [], E();
    }
    function U(c) {
      c.slice(0, 5).forEach((m) => {
        !m.type.startsWith("image/") || m.size > 10 * 1024 * 1024 || h.value.push({
          file: m,
          preview: URL.createObjectURL(m)
        });
      });
    }
    function _(c) {
      const m = c.target.files;
      m && (n("upload", m), U(Array.from(m)), T.value && (T.value.value = ""));
    }
    function Q(c) {
      const m = h.value[c];
      m && URL.revokeObjectURL(m.preview), h.value.splice(c, 1);
    }
    function V() {
      u.value = !0;
    }
    function X(c) {
      var b;
      const m = c.relatedTarget;
      (b = g.value) != null && b.contains(m) || (u.value = !1);
    }
    function R(c) {
      var b;
      u.value = !1;
      const m = Array.from(((b = c.dataTransfer) == null ? void 0 : b.files) ?? []);
      m.length !== 0 && U(m);
    }
    function te(c) {
      var b;
      const m = Array.from(((b = c.clipboardData) == null ? void 0 : b.files) ?? []);
      m.length !== 0 && U(m);
    }
    return Xe(() => {
      var c;
      (c = l.value) == null || c.addEventListener("paste", te);
    }), Ze(() => {
      var c;
      (c = l.value) == null || c.removeEventListener("paste", te), ae();
    }), (c, m) => (y(), w("div", {
      ref_key: "rootRef",
      ref: g,
      class: oe(["oc-input-wrap", { "is-drop-active": u.value }]),
      onDragover: de(V, ["prevent"]),
      onDragleave: X,
      onDrop: de(R, ["prevent"])
    }, [
      f.value && W.value.length ? (y(), w("ul", Kt, [
        (y(!0), w(ge, null, me(W.value, (b, J) => (y(), w("li", {
          key: b.key,
          class: oe({ active: J === d.value }),
          onMousedown: de((fe) => j(b.key), ["prevent"])
        }, [
          i("strong", null, k(b.label), 1),
          i("small", null, k(b.description), 1)
        ], 42, jt))), 128))
      ])) : O("", !0),
      h.value.length ? (y(), w("div", Qt, [
        (y(!0), w(ge, null, me(h.value, (b, J) => (y(), w("div", {
          key: J,
          class: "oc-image-item"
        }, [
          i("img", {
            src: b.preview,
            alt: "preview"
          }, null, 8, Gt),
          i("button", {
            type: "button",
            onClick: (fe) => Q(J)
          }, "×", 8, Yt)
        ]))), 128))
      ])) : O("", !0),
      i("div", Xt, [
        i("button", {
          type: "button",
          class: "oc-attach",
          "aria-label": "Attach image",
          onClick: m[0] || (m[0] = (b) => {
            var J;
            return (J = T.value) == null ? void 0 : J.click();
          })
        }, "+"),
        i("input", {
          ref_key: "fileInputRef",
          ref: T,
          type: "file",
          multiple: "",
          accept: "image/*",
          hidden: "",
          onChange: _
        }, null, 544),
        i("div", Zt, [
          Ee(i("textarea", {
            ref_key: "textareaRef",
            ref: l,
            "onUpdate:modelValue": m[1] || (m[1] = (b) => C.value = b),
            placeholder: G.value,
            disabled: e.disabled,
            rows: "1",
            onInput: B,
            onKeydown: re,
            onCompositionstart: m[2] || (m[2] = (b) => $.value = !0),
            onCompositionend: m[3] || (m[3] = (b) => $.value = !1)
          }, null, 40, Jt), [
            [Je, C.value]
          ]),
          i("div", {
            class: oe(["oc-counter", { warn: A.value < 120 }])
          }, k(A.value), 3)
        ]),
        i("button", {
          type: "button",
          class: "oc-send",
          disabled: !K.value && !e.loading || e.disabled,
          onClick: N
        }, k(e.loading ? v(a)("input.stop") : "Send"), 9, es)
      ]),
      i("div", ts, [
        e.queuedCount > 0 ? (y(), w("span", ss, k(v(a)("input.queued", { count: e.queuedCount })), 1)) : O("", !0),
        m[4] || (m[4] = i("span", { class: "oc-hint" }, "Enter to send · Shift+Enter newline · / for commands", -1))
      ])
    ], 34));
  }
}), Ie = (e, t) => {
  const s = e.__vccOpts || e;
  for (const [n, a] of t)
    s[n] = a;
  return s;
}, tt = /* @__PURE__ */ Ie(ns, [["__scopeId", "data-v-7e81463e"]]);
function st(e, t = "zh-CN") {
  const s = new Date(e);
  return new Intl.DateTimeFormat(t, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(s);
}
function as(e, t = "zh-CN") {
  const n = Date.now() - e;
  if (n < 6e4)
    return t.startsWith("zh") ? "刚刚" : "now";
  if (n < 36e5) {
    const a = Math.floor(n / 6e4);
    return t.startsWith("zh") ? `${a}分钟前` : `${a}m ago`;
  }
  return st(e, t);
}
Ae.setOptions({
  gfm: !0,
  breaks: !0
});
function os(e, t) {
  return t ? be.getLanguage(t) ? be.highlight(e, { language: t }).value : be.highlightAuto(e).value : be.highlightAuto(e).value;
}
function rs(e) {
  return e.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<(iframe|object|embed|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, "").replace(/\son\w+=['"][^'"]*['"]/gi, "").replace(/javascript:/gi, "");
}
function je(e) {
  const t = e.match(/```[\s\S]*?```/g);
  return t ? t.map((s) => s.replace(/^```\w*\n?/, "").replace(/```$/, "").trim()) : [];
}
function is(e, t = {}) {
  const s = new Ae.Renderer(), n = t.highlight ?? !0;
  s.code = (g, l) => {
    const T = (l == null ? void 0 : l.split(/\s+/)[0]) ?? "", $ = n ? os(g, T) : g;
    return `<pre class="oc-code-block"><code class="hljs language-${T}">${$}</code></pre>`;
  }, s.link = (g, l, T) => {
    const $ = g ?? "#", f = l ? ` title="${l}"` : "";
    return `<a href="${$}" target="_blank" rel="noopener noreferrer"${f}>${T}</a>`;
  };
  const a = Ae.parse(e, { renderer: s });
  return rs(a);
}
const ls = {
  key: 0,
  class: "oc-message-avatar"
}, us = { class: "oc-message-content" }, cs = { class: "oc-message-header" }, ds = { class: "oc-message-body" }, gs = {
  key: 0,
  class: "oc-message-images"
}, ms = ["src", "onClick"], fs = ["innerHTML"], hs = {
  key: 2,
  class: "oc-cursor"
}, ps = { class: "oc-message-actions" }, vs = /* @__PURE__ */ Se({
  __name: "MessageItem",
  props: {
    message: {},
    isStreaming: { type: Boolean, default: !1 }
  },
  emits: ["copy", "preview-image", "regenerate", "quote", "delete"],
  setup(e, { emit: t }) {
    const s = e, n = t, { t: a, locale: g } = Ce(), l = I(!1), T = I(0), $ = I(0), f = I(!1);
    let M = null;
    const d = x(() => is(s.message.content, { highlight: !0 })), u = x(() => je(s.message.content).length > 0), h = x(() => f.value ? a("message.copied") : a("message.copy")), C = x(() => s.message.role === "user" && !!s.message.status), W = x(() => `is-${s.message.status ?? "sent"}`), K = x(() => {
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
    }), G = x(() => s.message.role === "user" ? a("message.you") : s.message.role === "assistant" ? a("message.assistant") : a("message.system")), A = x(() => s.message.role === "assistant" ? "AI" : s.message.role === "user" ? "U" : "S"), E = x(() => ({
      left: `${T.value}px`,
      top: `${$.value}px`
    }));
    function Y(U, _) {
      const X = Math.max(10, window.innerWidth - 160 - 10), R = Math.max(10, window.innerHeight - 180 - 10);
      T.value = Math.min(Math.max(10, U), X), $.value = Math.min(Math.max(10, _), R);
    }
    function B(U) {
      Y(U.clientX, U.clientY), l.value = !0;
    }
    function j(U) {
      M = window.setTimeout(() => {
        const _ = U.touches[0];
        Y(_.clientX, _.clientY), l.value = !0;
      }, 500);
    }
    function re() {
      M && (window.clearTimeout(M), M = null);
    }
    async function ae() {
      await navigator.clipboard.writeText(s.message.content), f.value = !0, n("copy", s.message.content), window.setTimeout(() => {
        f.value = !1;
      }, 2e3);
    }
    async function N(U) {
      if (U === "copy" && await ae(), U === "copy-code") {
        const _ = je(s.message.content);
        await navigator.clipboard.writeText(_.join(`

`));
      }
      U === "quote" && n("quote", s.message), U === "delete" && n("delete", s.message.id), l.value = !1;
    }
    return (U, _) => {
      var Q;
      return y(), w("article", {
        class: oe(["oc-message-item", [e.message.role, { streaming: e.isStreaming }]]),
        onContextmenu: de(B, ["prevent"]),
        onTouchstart: j,
        onTouchend: re
      }, [
        e.message.role !== "system" ? (y(), w("div", ls, k(A.value), 1)) : O("", !0),
        i("div", us, [
          i("header", cs, [
            i("span", null, k(G.value), 1),
            i("time", null, k(v(st)(e.message.timestamp, v(g))), 1),
            C.value ? (y(), w("span", {
              key: 0,
              class: oe(["oc-message-status", W.value])
            }, k(K.value), 3)) : O("", !0)
          ]),
          i("div", ds, [
            (Q = e.message.images) != null && Q.length ? (y(), w("div", gs, [
              (y(!0), w(ge, null, me(e.message.images, (V, X) => (y(), w("img", {
                key: X,
                src: V.thumbnail || V.url,
                class: "oc-message-image",
                onClick: (R) => U.$emit("preview-image", V.url)
              }, null, 8, ms))), 128))
            ])) : O("", !0),
            e.message.content ? (y(), w("div", {
              key: 1,
              class: "oc-message-text",
              innerHTML: d.value
            }, null, 8, fs)) : O("", !0),
            e.isStreaming ? (y(), w("span", hs, "▋")) : O("", !0)
          ]),
          i("footer", ps, [
            i("button", {
              type: "button",
              onClick: ae
            }, k(h.value), 1),
            e.message.role === "assistant" ? (y(), w("button", {
              key: 0,
              type: "button",
              onClick: _[0] || (_[0] = (V) => U.$emit("regenerate"))
            }, k(v(a)("message.regenerate")), 1)) : O("", !0)
          ])
        ]),
        l.value ? (y(), w("div", {
          key: 1,
          class: "oc-context-mask",
          onClick: _[1] || (_[1] = (V) => l.value = !1),
          onKeyup: _[2] || (_[2] = wt((V) => l.value = !1, ["esc"]))
        }, null, 32)) : O("", !0),
        l.value ? (y(), w("menu", {
          key: 2,
          class: "oc-context-menu",
          style: St(E.value)
        }, [
          i("button", {
            type: "button",
            onClick: _[3] || (_[3] = (V) => N("copy"))
          }, k(v(a)("message.copy")), 1),
          u.value ? (y(), w("button", {
            key: 0,
            type: "button",
            onClick: _[4] || (_[4] = (V) => N("copy-code"))
          }, "Copy Code")) : O("", !0),
          i("button", {
            type: "button",
            onClick: _[5] || (_[5] = (V) => N("quote"))
          }, k(v(a)("message.quote")), 1),
          e.message.role === "user" ? (y(), w("button", {
            key: 1,
            type: "button",
            class: "danger",
            onClick: _[6] || (_[6] = (V) => N("delete"))
          }, k(v(a)("message.delete")), 1)) : O("", !0)
        ], 4)) : O("", !0)
      ], 34);
    };
  }
}), nt = /* @__PURE__ */ Ie(vs, [["__scopeId", "data-v-77147782"]]), ys = {
  key: 0,
  class: "oc-empty-state"
}, ws = {
  key: 1,
  class: "oc-loading"
}, Ss = /* @__PURE__ */ Se({
  __name: "MessageList",
  props: {
    messages: {},
    streaming: { type: Boolean, default: !1 },
    streamingMessageId: { default: "" },
    loading: { type: Boolean, default: !1 }
  },
  emits: ["scroll-top", "copy", "preview-image", "regenerate", "quote", "delete"],
  setup(e, { expose: t, emit: s }) {
    const n = e, a = s, { t: g } = Ce(), l = I(null), T = I(!1);
    function $() {
      const d = l.value;
      return d ? d.scrollHeight - d.scrollTop - d.clientHeight < 120 : !0;
    }
    function f(d = "auto") {
      const u = l.value;
      u && (u.scrollTo({ top: u.scrollHeight, behavior: d }), T.value = !1);
    }
    function M() {
      const d = l.value;
      d && (d.scrollTop <= 0 && a("scroll-top"), T.value = !$());
    }
    return ce(
      () => n.messages.length,
      async () => {
        const d = $();
        await Fe(), d && f();
      }
    ), ce(
      () => {
        var d;
        return (d = n.messages.at(-1)) == null ? void 0 : d.content;
      },
      async () => {
        const d = $();
        await Fe(), n.streaming && d && f();
      }
    ), t({
      scrollToBottom: f
    }), (d, u) => (y(), w("section", {
      ref_key: "containerRef",
      ref: l,
      class: "oc-message-list",
      role: "log",
      "aria-live": "polite",
      onScroll: M
    }, [
      e.messages.length === 0 ? (y(), w("div", ys, [
        i("h3", null, k(v(g)("chat.empty")), 1),
        u[5] || (u[5] = i("p", null, [
          we("Try: "),
          i("code", null, "/help"),
          we(" · "),
          i("code", null, "/new"),
          we(" · "),
          i("code", null, "/think")
        ], -1))
      ])) : O("", !0),
      ve(Ct, {
        name: "oc-message",
        tag: "div",
        class: "oc-message-stack",
        appear: ""
      }, {
        default: et(() => [
          (y(!0), w(ge, null, me(e.messages, (h) => (y(), It(nt, {
            key: h.id,
            message: h,
            "is-streaming": e.streaming && h.id === e.streamingMessageId,
            onCopy: u[0] || (u[0] = (C) => d.$emit("copy", C)),
            onPreviewImage: u[1] || (u[1] = (C) => d.$emit("preview-image", C)),
            onRegenerate: (C) => d.$emit("regenerate", h.id),
            onQuote: u[2] || (u[2] = (C) => d.$emit("quote", C)),
            onDelete: u[3] || (u[3] = (C) => d.$emit("delete", C))
          }, null, 8, ["message", "is-streaming", "onRegenerate"]))), 128))
        ]),
        _: 1
      }),
      e.loading && !e.streaming ? (y(), w("div", ws, "...")) : O("", !0),
      T.value ? (y(), w("button", {
        key: 2,
        type: "button",
        class: "oc-scroll-btn",
        onClick: u[4] || (u[4] = (h) => f("smooth"))
      }, " ↓ New ")) : O("", !0)
    ], 544));
  }
}), at = /* @__PURE__ */ Ie(Ss, [["__scopeId", "data-v-0c653ea3"]]), Cs = { class: "oc-session-header" }, Is = { class: "oc-session-header-actions" }, bs = { class: "oc-session-search-wrap" }, ks = {
  key: 0,
  class: "oc-session-empty"
}, Ms = {
  key: 1,
  class: "oc-session-items"
}, $s = ["onClick"], As = { class: "oc-session-main" }, _s = { class: "oc-session-title" }, Ls = {
  key: 0,
  class: "oc-pin"
}, Ts = { class: "oc-session-meta" }, Es = { class: "oc-session-agent" }, xs = { class: "oc-session-time" }, Ds = { class: "oc-session-sub" }, Rs = { class: "oc-session-preview" }, Us = {
  key: 0,
  class: "oc-session-count"
}, Ns = { class: "oc-session-actions" }, Os = ["onClick"], qs = ["onClick"], Ws = /* @__PURE__ */ Se({
  __name: "SessionList",
  props: {
    sessions: {},
    currentId: {},
    agentLabels: { default: () => ({}) },
    visible: { type: Boolean, default: !0 }
  },
  emits: ["update:visible", "select", "delete", "reset", "new"],
  setup(e, { emit: t }) {
    const s = e, n = t, { t: a, locale: g } = Ce(), l = I(""), T = x(() => {
      const M = l.value.trim().toLowerCase(), d = [...s.sessions].sort((u, h) => !!u.pinned != !!h.pinned ? u.pinned ? -1 : 1 : h.updatedAt - u.updatedAt);
      return M ? d.filter((u) => u.title.toLowerCase().includes(M) || u.lastMessage.toLowerCase().includes(M)) : d;
    });
    function $(M) {
      n("select", M), window.innerWidth < 900 && n("update:visible", !1);
    }
    function f(M) {
      return s.agentLabels[M] ? s.agentLabels[M] : M;
    }
    return (M, d) => (y(), w("aside", {
      class: oe(["oc-session-list", { hidden: !e.visible }])
    }, [
      i("header", Cs, [
        i("div", null, [
          i("strong", null, k(v(a)("session.title")), 1),
          d[2] || (d[2] = i("p", null, "Context library", -1))
        ]),
        i("div", Is, [
          i("button", {
            type: "button",
            class: "oc-session-btn",
            onClick: d[0] || (d[0] = (u) => n("new"))
          }, k(v(a)("session.new")), 1)
        ])
      ]),
      i("div", bs, [
        Ee(i("input", {
          "onUpdate:modelValue": d[1] || (d[1] = (u) => l.value = u),
          type: "text",
          placeholder: "Search sessions...",
          class: "oc-session-search"
        }, null, 512), [
          [Je, l.value]
        ])
      ]),
      T.value.length === 0 ? (y(), w("div", ks, k(v(a)("session.empty")), 1)) : (y(), w("ul", Ms, [
        (y(!0), w(ge, null, me(T.value, (u) => (y(), w("li", {
          key: u.id,
          class: oe(["oc-session-item", { active: u.id === e.currentId }]),
          onClick: (h) => $(u.id)
        }, [
          i("div", As, [
            i("span", _s, [
              u.pinned ? (y(), w("span", Ls, "📌")) : O("", !0),
              we(" " + k(u.title), 1)
            ]),
            i("div", Ts, [
              i("span", Es, k(f(u.agentId)), 1),
              i("span", xs, k(v(as)(u.updatedAt, v(g))), 1)
            ])
          ]),
          i("div", Ds, [
            i("span", Rs, k(u.lastMessage || "..."), 1),
            u.messageCount > 0 ? (y(), w("span", Us, k(u.messageCount > 99 ? "99+" : u.messageCount), 1)) : O("", !0)
          ]),
          i("div", Ns, [
            i("button", {
              type: "button",
              onClick: de((h) => n("reset", u.id), ["stop"])
            }, k(v(a)("session.clear")), 9, Os),
            i("button", {
              type: "button",
              onClick: de((h) => n("delete", u.id), ["stop"])
            }, k(v(a)("session.delete")), 9, qs)
          ])
        ], 10, $s))), 128))
      ]))
    ], 2));
  }
}), ot = /* @__PURE__ */ Ie(Ws, [["__scopeId", "data-v-9b3bd263"]]);
let ke = null;
function Ps() {
  const e = pt();
  return e || (ke || (ke = Ye()), vt(ke), ke);
}
function Qe(e) {
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
      this.ensureSession(e), this.messages[e] = Qe(t);
    },
    mergeMessages(e, t) {
      this.ensureSession(e), this.messages[e] = Qe([...this.messages[e] ?? [], ...t]);
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
function Ge(e, t, s = "main") {
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
const it = Te("session", {
  state: () => {
    const e = Ge("新会话", "default", "main");
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
      const n = Ge(e, t, s);
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
}), Vs = Te("connection", {
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
function zs(e) {
  const t = I(null), s = I("disconnected"), n = I(0), a = I(null);
  let g = null, l = null, T = !1;
  const $ = e.reconnectMax ?? 5, f = e.reconnectDelay ?? 3e3;
  function M() {
    g && (window.clearTimeout(g), g = null), l && (window.clearInterval(l), l = null);
  }
  function d(A) {
    const E = A.trim();
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
  function h() {
    if (n.value >= $) {
      s.value = "error";
      return;
    }
    n.value += 1, s.value = "reconnecting";
    const A = Math.min(f * n.value, 15e3);
    g = window.setTimeout(() => {
      C();
    }, A);
  }
  async function C() {
    T = !1, M();
    try {
      const A = d(e.gatewayUrl);
      t.value = new WebSocket(A);
    } catch (A) {
      s.value = "error", a.value = A instanceof Error ? A.message : String(A), h();
      return;
    }
    t.value.onopen = () => {
      var A;
      s.value = "connected", n.value = 0, a.value = null, u(), (A = e.onConnect) == null || A.call(e), e.token && G({
        type: "auth",
        payload: {
          token: e.token
        }
      });
    }, t.value.onmessage = (A) => {
      var E;
      try {
        const Y = JSON.parse(A.data);
        (E = e.onMessage) == null || E.call(e, Y);
      } catch {
        s.value = "error", a.value = "Failed to parse websocket payload";
      }
    }, t.value.onerror = (A) => {
      var E;
      s.value = "error", (E = e.onError) == null || E.call(e, A);
    }, t.value.onclose = (A) => {
      var E;
      if (M(), (E = e.onDisconnect) == null || E.call(e, A), T) {
        s.value = "disconnected";
        return;
      }
      h();
    };
  }
  function W() {
    T = !0, M(), t.value && (t.value.onclose = null, t.value.close(), t.value = null), s.value = "disconnected";
  }
  function K() {
    M(), t.value && (t.value.onclose = null, t.value.close(), t.value = null), T = !1, C();
  }
  function G(A) {
    if (!t.value || t.value.readyState !== WebSocket.OPEN)
      throw new Error("WebSocket is not connected");
    t.value.send(JSON.stringify(A));
  }
  return bt(() => {
    W();
  }), {
    ws: t,
    status: s,
    reconnectCount: n,
    lastError: a,
    connect: C,
    disconnect: W,
    reconnect: K,
    send: G
  };
}
function Bs() {
  const e = I([]);
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
function Hs() {
  var e, t;
  return ((t = (e = globalThis.crypto) == null ? void 0 : e.randomUUID) == null ? void 0 : t.call(e)) ?? `${Date.now()}-${Math.random()}`;
}
function Fs(e) {
  const t = rt(), s = it(), n = Vs(), { queue: a, enqueue: g, dequeue: l, remove: T } = Bs(), $ = I(!1), f = I(!1), M = I(!1), d = I(null), u = I(null), h = I(null), C = I(null), W = /* @__PURE__ */ new Map(), K = /* @__PURE__ */ new Map(), G = /* @__PURE__ */ new Set(), A = /* @__PURE__ */ new Map(), E = Math.min(Math.max(e.historyLimit ?? 80, 20), 300), Y = Math.min(Math.max(e.historyStep ?? 50, 20), 150);
  e.sessionId && (s.sessions.some((o) => o.id === e.sessionId) || s.createSession("新会话", e.sessionId, e.defaultAgentId ?? "main"), s.selectSession(e.sessionId)), t.setCurrentSession(s.currentId);
  function B() {
    return e.gatewayUrl.endsWith("/") ? e.gatewayUrl.slice(0, -1) : e.gatewayUrl;
  }
  function j(o) {
    return W.get(o) ?? s.currentId;
  }
  function re(o) {
    var q;
    return (((q = s.sessions.find((D) => D.id === o)) == null ? void 0 : q.agentId) ?? e.defaultAgentId ?? "main").trim().replace(/[^a-zA-Z0-9_-]/g, "") || "main";
  }
  function ae(o, p) {
    return `${p}::${o}`;
  }
  function N(o, p) {
    const L = j(o);
    t.updateMessage(L, o, p);
  }
  function U(o) {
    const p = j(o.messageId), L = K.get(o.messageId) ?? `ai-${o.messageId}`;
    K.set(o.messageId, L), C.value = L, t.setStreaming(p, L), t.appendStreamContent(p, L, o.content), N(o.messageId, { status: "streaming" }), f.value = !1, $.value = !0;
  }
  function _(o) {
    const p = o.reason ? String(o.reason).slice(0, 200) : void 0;
    if (N(o.messageId, {
      status: o.status,
      statusReason: p
    }), o.status === "accepted" || o.status === "processing") {
      f.value = !0;
      return;
    }
    if (o.status === "streaming") {
      f.value = !1, $.value = !0;
      return;
    }
    (o.status === "failed" || o.status === "aborted") && h.value === o.messageId && (f.value = !1);
  }
  function Q(o) {
    const p = j(o);
    h.value === o && (h.value = null, C.value = null, f.value = !1, $.value = !1), t.setStreaming(p, null), W.delete(o), K.delete(o);
    const L = l();
    L && te(L.content, L.images);
  }
  async function V(o = {}) {
    var se;
    const p = (o.sessionId ?? s.currentId).trim();
    if (!p || M.value)
      return;
    const L = re(p), q = ae(p, L), D = A.get(q) ?? E, z = o.limit ?? (o.append ? D + Y : D), H = Math.min(Math.max(z, 20), 300), ee = (t.messages[p] ?? []).length > 0;
    if (!(!o.force && !o.append && G.has(q) && ee)) {
      A.set(q, H), d.value = null, M.value = !0;
      try {
        const F = await fetch(
          `${B()}/sessions/${encodeURIComponent(p)}/history?limit=${H}&agentId=${encodeURIComponent(L)}`
        );
        if (!F.ok)
          throw new Error(`HTTP ${F.status}`);
        const ne = (await F.json()).messages.filter((Z) => typeof Z.content == "string" && Z.content.trim().length > 0).map((Z) => ({
          id: Z.id,
          role: Z.role,
          content: Z.content,
          timestamp: Z.timestamp,
          status: Z.role === "user" ? "delivered" : "sent"
        }));
        o.replace ? t.setSessionMessages(p, ne) : t.mergeMessages(p, ne);
        const $e = ((se = t.messages[p]) == null ? void 0 : se.length) ?? ne.length, he = [...ne].reverse().find((Z) => Z.role !== "system") ?? ne[ne.length - 1];
        he && s.syncSessionSnapshot(p, {
          lastMessage: he.content,
          messageCount: $e,
          updatedAt: he.timestamp
        }), G.add(q);
      } catch (F) {
        d.value = F instanceof Error ? F.message : String(F);
      } finally {
        M.value = !1;
      }
    }
  }
  function X(o) {
    var p, L, q, D;
    switch (o.type) {
      case "connected": {
        n.setStatus("connected");
        break;
      }
      case "auth_failed": {
        n.setStatus("error", o.error), f.value = !1, $.value = !1;
        break;
      }
      case "message_received": {
        N(o.messageId, {
          status: o.duplicate ? "processing" : "accepted"
        }), f.value = !0, o.duplicate && ($.value = !0);
        break;
      }
      case "message_status": {
        _(o);
        break;
      }
      case "chunk": {
        U(o);
        break;
      }
      case "stream_end": {
        if (o.error) {
          const z = o.aborted ? "aborted" : "failed";
          N(o.messageId, { status: z });
        } else
          N(o.messageId, { status: "delivered" });
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
        }), s.touchSession(z, o.content), f.value = !1, $.value = !1;
        break;
      }
      case "stopped": {
        N(o.messageId, {
          status: "aborted",
          statusReason: o.noop ? "noop" : "stopped_by_user"
        }), Q(o.messageId);
        break;
      }
      case "error": {
        const z = (p = o.error) == null ? void 0 : p.details, H = ((L = o.error) == null ? void 0 : L.message) ?? "Unknown websocket error", ee = ((q = o.error) == null ? void 0 : q.reason) ?? (z == null ? void 0 : z.reason) ?? H, se = ((D = o.error) == null ? void 0 : D.messageId) ?? (z == null ? void 0 : z.messageId);
        n.setStatus("error", H), se ? (N(se, {
          status: "failed",
          statusReason: ee
        }), Q(se)) : h.value && (N(h.value, {
          status: "failed",
          statusReason: ee
        }), Q(h.value)), f.value = !1, $.value = !1;
        break;
      }
      case "server_closing": {
        n.setStatus("disconnected", o.reason);
        break;
      }
    }
  }
  const R = zs({
    gatewayUrl: e.gatewayUrl,
    token: e.token,
    reconnectMax: e.reconnectMax,
    reconnectDelay: e.reconnectDelay,
    onMessage: X,
    onConnect: () => {
      if (n.setStatus("connected"), n.resetReconnect(), !h.value && !$.value) {
        const o = l();
        o && te(o.content, o.images);
      }
    },
    onDisconnect: () => {
      n.setStatus("disconnected"), h.value && N(h.value, {
        status: "pending",
        statusReason: "connection_lost"
      });
    },
    onError: () => {
      n.setStatus("error", "WebSocket error");
    }
  });
  async function te(o, p) {
    const L = o.trim();
    if (!L)
      return;
    const q = e.maxMessageLength ?? 4e3;
    if (L.length > q)
      throw new Error(`Message exceeds max length: ${q}`);
    const D = s.currentId, z = re(D), H = Hs(), ee = p == null ? void 0 : p.map((F) => ({
      url: URL.createObjectURL(F)
    }));
    t.addMessage(D, {
      id: H,
      role: "user",
      content: u.value ? `> ${u.value.content}

${L}` : L,
      timestamp: Date.now(),
      images: ee,
      status: "pending"
    }), s.touchSession(D, L), h.value = H, C.value = `ai-${H}`, W.set(H, D), K.set(H, C.value), t.setStreaming(D, C.value), f.value = !0, $.value = !1;
    const se = ee == null ? void 0 : ee.map((F) => F.url);
    try {
      R.send({
        type: "chat",
        payload: {
          content: L,
          sessionId: D,
          messageId: H,
          agentId: z,
          attachments: se
        }
      });
    } catch (F) {
      const ue = F instanceof Error ? F.message : "Failed to send message";
      N(H, {
        status: "failed",
        statusReason: ue
      }), Q(H), n.setStatus("error", ue);
    }
    u.value = null;
  }
  async function c(o, p) {
    if (f.value || $.value) {
      g({ content: o, images: p });
      return;
    }
    await te(o, p);
  }
  function m() {
    if (!h.value)
      return;
    const o = h.value;
    try {
      R.send({
        type: "stop",
        payload: {
          messageId: o
        }
      });
    } catch {
    }
    N(o, {
      status: "aborted",
      statusReason: "stopped_by_user"
    }), Q(o);
  }
  function b(o) {
    u.value = o;
  }
  function J(o) {
    const p = t.currentMessages, L = p.findIndex((D) => D.id === o);
    if (L === -1)
      return;
    let q = p[L];
    if (q.role !== "user") {
      for (let D = L - 1; D >= 0; D -= 1)
        if (p[D].role === "user") {
          q = p[D];
          break;
        }
    }
    q.role === "user" && c(q.content);
  }
  function fe() {
    return R.connect();
  }
  function Me(o) {
    T(o);
  }
  return {
    messages: x(() => t.currentMessages),
    isStreaming: $,
    isLoading: f,
    isConnected: x(() => R.status.value === "connected"),
    status: x(() => R.status.value),
    reconnectCount: x(() => R.reconnectCount.value),
    queue: a,
    quoteMessage: u,
    send: c,
    stop: m,
    quote: b,
    retry: J,
    connect: fe,
    loadHistory: V,
    disconnect: R.disconnect,
    reconnect: R.reconnect,
    removeFromQueue: Me,
    isHistoryLoading: M,
    historyError: d
  };
}
function Ks(e) {
  return e || (typeof localStorage > "u" ? "system" : localStorage.getItem("openclaw:theme") ?? "system");
}
function js() {
  return typeof window < "u" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function Qs(e) {
  const t = I(Ks(e)), s = x(() => t.value === "system" ? js() : t.value === "dark");
  function n(g) {
    t.value = g, typeof localStorage < "u" && localStorage.setItem("openclaw:theme", g);
  }
  function a() {
    n(s.value ? "light" : "dark");
  }
  return kt(() => {
    typeof document > "u" || (document.documentElement.dataset.openclawTheme = s.value ? "dark" : "light");
  }), {
    theme: t,
    isDark: s,
    setTheme: n,
    toggle: a
  };
}
const Gs = {}, le = {
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
], lt = {
  mode: "system"
}, Le = {
  gatewayUrl: "http://127.0.0.1:3000",
  token: "",
  sessionId: "",
  userId: "",
  defaultAgentId: "main",
  agents: _e,
  locale: "auto",
  theme: lt,
  options: le
};
function Ys(e) {
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
function ut(e = {}) {
  return {
    ...Le,
    ...e,
    theme: {
      ...lt,
      ...e.theme ?? {}
    },
    options: {
      ...le,
      ...e.options ?? {}
    }
  };
}
function vn(e) {
  const t = e ?? Gs ?? {};
  return ut({
    gatewayUrl: String(t.VITE_OPENCLAW_GATEWAY_URL ?? Le.gatewayUrl),
    token: String(t.VITE_OPENCLAW_TOKEN ?? ""),
    defaultAgentId: String(t.VITE_OPENCLAW_DEFAULT_AGENT_ID ?? Le.defaultAgentId),
    agents: Ys(t.VITE_OPENCLAW_AGENTS),
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
const Xs = { class: "oc-chat-header" }, Zs = { class: "oc-chat-header-main" }, Js = { class: "oc-title-block" }, en = { class: "oc-chat-header-actions" }, tn = { class: "oc-agent-picker" }, sn = ["value"], nn = { class: "oc-chat-body" }, an = { class: "oc-chat-main" }, on = {
  key: 0,
  class: "oc-offline"
}, rn = ["src"], ln = /* @__PURE__ */ Se({
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
    var xe, De, Re, Ue, Ne, Oe, qe, We, Pe, Ve, ze, Be;
    Ps();
    const s = e, n = t, a = ut({
      ...s.initConfig,
      gatewayUrl: s.gatewayUrl || ((xe = s.initConfig) == null ? void 0 : xe.gatewayUrl),
      token: s.token || ((De = s.initConfig) == null ? void 0 : De.token),
      sessionId: s.sessionId || ((Re = s.initConfig) == null ? void 0 : Re.sessionId),
      userId: s.userId || ((Ue = s.initConfig) == null ? void 0 : Ue.userId),
      defaultAgentId: s.defaultAgentId || ((Ne = s.initConfig) == null ? void 0 : Ne.defaultAgentId),
      agents: (Oe = s.agents) != null && Oe.length ? s.agents : (qe = s.initConfig) == null ? void 0 : qe.agents,
      locale: s.locale !== "auto" ? s.locale : (We = s.initConfig) == null ? void 0 : We.locale,
      theme: s.theme ?? ((Pe = s.initConfig) == null ? void 0 : Pe.theme),
      options: {
        ...((Ve = s.initConfig) == null ? void 0 : Ve.options) ?? {},
        ...s.options ?? {}
      }
    }), g = rt(), l = it(), { sortedSessions: T, currentSession: $ } = yt(l);
    a.sessionId && !l.sessions.some((r) => r.id === a.sessionId) && l.createSession("新会话", a.sessionId, a.defaultAgentId), a.sessionId && l.selectSession(a.sessionId), (ze = l.currentSession) != null && ze.agentId || l.updateAgent(l.currentId, a.defaultAgentId), g.setCurrentSession(l.currentId);
    const { t: f, locale: M, setLocale: d } = Ce(), { isDark: u, toggle: h } = Qs(a.theme.mode), C = I(
      a.agents.length > 0 ? a.agents : [
        {
          id: a.defaultAgentId,
          name: a.defaultAgentId
        }
      ]
    );
    a.locale && a.locale !== "auto" && d(a.locale);
    const {
      messages: W,
      isStreaming: K,
      isLoading: G,
      isConnected: A,
      status: E,
      queue: Y,
      send: B,
      stop: j,
      quote: re,
      retry: ae,
      connect: N,
      reconnect: U,
      loadHistory: _,
      isHistoryLoading: Q,
      historyError: V
    } = Fs({
      gatewayUrl: a.gatewayUrl,
      token: a.token,
      sessionId: l.currentId,
      defaultAgentId: a.defaultAgentId,
      reconnectDelay: a.options.reconnectDelay,
      reconnectMax: a.options.reconnectMax,
      maxMessageLength: a.options.maxMessageLength
    }), X = I(""), R = I(!0), te = I(!1), c = I(""), m = I(null), b = I(((Be = l.currentSession) == null ? void 0 : Be.agentId) ?? a.defaultAgentId), J = x(() => l.currentId), fe = x(
      () => Object.fromEntries(C.value.map((r) => [r.id, r.name]))
    ), Me = x(() => g.streamingMessageId ?? ""), o = x(() => E.value === "connected" ? f("status.connected") : E.value === "reconnecting" ? `${f("status.reconnecting")} (${Y.value.length})` : f("chat.disconnected"));
    function p(r) {
      return (r ?? "").trim().replace(/[^a-zA-Z0-9_-]/g, "") || a.defaultAgentId || "main";
    }
    function L() {
      return a.gatewayUrl.endsWith("/") ? a.gatewayUrl.slice(0, -1) : a.gatewayUrl;
    }
    async function q() {
      try {
        const r = await fetch(`${L()}/agents`);
        if (!r.ok)
          return;
        const S = await r.json();
        if (!Array.isArray(S.agents) || S.agents.length === 0)
          return;
        C.value = S.agents.map((pe) => {
          var He;
          return {
            id: p(pe.id),
            name: ((He = pe.name) == null ? void 0 : He.trim()) || pe.id
          };
        });
        const ie = p(S.defaultAgentId), P = b.value;
        C.value.some((pe) => pe.id === P) || (b.value = ie, l.updateAgent(l.currentId, ie));
      } catch {
      }
    }
    function D(r) {
      if ((r.metaKey || r.ctrlKey) && r.shiftKey && r.key.toLowerCase() === "l") {
        r.preventDefault(), h();
        return;
      }
      (r.metaKey || r.ctrlKey) && r.key.toLowerCase() === "b" && (r.preventDefault(), R.value = !R.value);
    }
    Xe(async () => {
      window.addEventListener("keydown", D);
      try {
        await N(), await q(), await _({ force: !0 }), n("connect");
      } catch (r) {
        n("error", { error: r instanceof Error ? r.message : "connect failed" });
      }
    }), Ze(() => {
      window.removeEventListener("keydown", D);
    }), ce(
      () => l.currentId,
      (r, S) => {
        var P;
        if (r === S)
          return;
        g.setCurrentSession(r);
        const ie = l.currentSession;
        ie && !ie.agentId && l.updateAgent(r, a.defaultAgentId), b.value = ((P = l.currentSession) == null ? void 0 : P.agentId) ?? a.defaultAgentId, n("session-change", { sessionId: r }), _({ sessionId: r, replace: !0 });
      }
    ), ce(
      () => E.value,
      (r) => {
        r === "error" && n("error", { error: "WebSocket connection error" }), r === "disconnected" && n("disconnect", { reason: "socket closed" });
      }
    ), ce(
      () => V.value,
      (r) => {
        r && n("error", { error: `History sync failed: ${r}` });
      }
    ), ce(
      () => W.value.at(-1),
      (r) => {
        r && n("message", {
          message: r,
          sessionId: l.currentId
        });
      }
    );
    async function z(r, S) {
      await B(r, S), X.value = "";
    }
    function H(r) {
    }
    function ee(r, S) {
      if (r === "new") {
        ne();
        return;
      }
      if (r === "clear") {
        ue(l.currentId);
        return;
      }
      if (r === "model") {
        X.value = `/model ${S}`.trim();
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
    function se(r) {
      l.selectSession(r), g.setCurrentSession(r);
    }
    function F(r) {
      l.deleteSession(r), g.clearMessages(r);
    }
    function ue(r) {
      g.clearMessages(r), g.addMessage(r, {
        id: `${Date.now()}`,
        role: "system",
        content: "历史已清空",
        timestamp: Date.now(),
        status: "sent"
      }), l.resetSession(r);
    }
    function ne() {
      const r = l.createSession(f("chat.newSession"), void 0, b.value);
      g.setCurrentSession(r.id), window.innerWidth < 900 && (R.value = !1);
    }
    function $e(r) {
    }
    function he(r) {
      c.value = r, te.value = !0;
    }
    function Z(r) {
      ae(r);
    }
    function ct(r) {
      re(r), X.value = `> ${r.content}
`;
    }
    function dt(r) {
      g.deleteMessage(l.currentId, r);
    }
    function gt() {
      _({
        sessionId: l.currentId,
        append: !0,
        force: !0
      });
    }
    function mt() {
      const r = p(b.value), S = l.currentSession;
      S && S.agentId !== r && (l.updateAgent(S.id, r), g.clearMessages(S.id), _({
        sessionId: S.id,
        force: !0,
        replace: !0
      }));
    }
    function ft() {
      d(M.value === "zh-CN" ? "en" : "zh-CN");
    }
    function ht() {
      U();
    }
    return (r, S) => {
      var ie;
      return y(), w("section", {
        class: oe(["openclaw-chat oc-chat-shell", { "is-dark": v(u) }])
      }, [
        S[8] || (S[8] = i("div", { class: "oc-bg-orb oc-bg-orb-a" }, null, -1)),
        S[9] || (S[9] = i("div", { class: "oc-bg-orb oc-bg-orb-b" }, null, -1)),
        i("header", Xs, [
          i("div", Zs, [
            i("button", {
              type: "button",
              class: "oc-mobile-menu",
              "aria-label": "Toggle sessions",
              onClick: S[0] || (S[0] = (P) => R.value = !R.value)
            }, "☰"),
            i("div", Js, [
              i("strong", null, k(((ie = v($)) == null ? void 0 : ie.title) || v(f)("chat.title")), 1),
              i("p", null, "Web Channel · " + k(o.value), 1)
            ])
          ]),
          i("div", en, [
            i("label", tn, [
              i("span", null, k(v(f)("chat.agent")), 1),
              Ee(i("select", {
                "onUpdate:modelValue": S[1] || (S[1] = (P) => b.value = P),
                onChange: mt
              }, [
                (y(!0), w(ge, null, me(C.value, (P) => (y(), w("option", {
                  key: P.id,
                  value: P.id
                }, k(P.name), 9, sn))), 128))
              ], 544), [
                [Mt, b.value]
              ])
            ]),
            i("span", {
              class: oe(["oc-connection", v(E)])
            }, [
              S[7] || (S[7] = i("span", { class: "dot" }, null, -1)),
              we(" " + k(o.value), 1)
            ], 2),
            i("button", {
              type: "button",
              onClick: S[2] || (S[2] = //@ts-ignore
              (...P) => v(h) && v(h)(...P))
            }, k(v(u) ? "Light" : "Dark"), 1),
            i("button", {
              type: "button",
              onClick: ft
            }, k(v(M) === "zh-CN" ? "EN" : "中文"), 1),
            i("button", {
              type: "button",
              class: "primary",
              onClick: ne
            }, k(v(f)("chat.newSession")), 1)
          ])
        ]),
        i("div", nn, [
          R.value ? (y(), w("div", {
            key: 0,
            class: "oc-sidebar-mask",
            onClick: S[3] || (S[3] = (P) => R.value = !1)
          })) : O("", !0),
          ve(ot, {
            visible: R.value,
            "onUpdate:visible": S[4] || (S[4] = (P) => R.value = P),
            sessions: v(T),
            "current-id": J.value,
            "agent-labels": fe.value,
            onSelect: se,
            onDelete: F,
            onReset: ue,
            onNew: ne
          }, null, 8, ["visible", "sessions", "current-id", "agent-labels"]),
          i("main", an, [
            ve(at, {
              ref_key: "messageListRef",
              ref: m,
              messages: v(W),
              streaming: v(K),
              "streaming-message-id": Me.value,
              loading: v(G) || v(Q),
              onCopy: $e,
              onPreviewImage: he,
              onRegenerate: Z,
              onQuote: ct,
              onDelete: dt,
              onScrollTop: gt
            }, null, 8, ["messages", "streaming", "streaming-message-id", "loading"]),
            ve($t, { name: "oc-fade" }, {
              default: et(() => [
                v(A) ? O("", !0) : (y(), w("div", on, [
                  i("span", null, k(v(f)("chat.disconnected")), 1),
                  i("button", {
                    type: "button",
                    onClick: ht
                  }, k(v(f)("chat.reconnect")), 1)
                ]))
              ]),
              _: 1
            }),
            ve(tt, {
              modelValue: X.value,
              "onUpdate:modelValue": S[5] || (S[5] = (P) => X.value = P),
              disabled: v(G) && !v(K),
              uploading: !1,
              loading: v(K),
              "queued-count": v(Y).length,
              "max-length": v(a).options.maxMessageLength,
              onSend: z,
              onUpload: H,
              onCommand: ee,
              onStop: v(j)
            }, null, 8, ["modelValue", "disabled", "loading", "queued-count", "max-length", "onStop"])
          ])
        ]),
        te.value ? (y(), w("dialog", {
          key: 0,
          class: "oc-preview",
          open: "",
          onClick: S[6] || (S[6] = (P) => te.value = !1)
        }, [
          i("img", {
            src: c.value,
            alt: "preview"
          }, null, 8, rn)
        ])) : O("", !0)
      ], 2);
    };
  }
}), un = /* @__PURE__ */ Ie(ln, [["__scopeId", "data-v-0506875e"]]), cn = [un, at, nt, tt, ot];
function dn(e) {
  var s, n;
  !!((n = (s = e._context) == null ? void 0 : s.provides) != null && n.pinia) || e.use(Ye()), e.use(ye);
  for (const a of cn)
    e.component(a.name ?? "OpenClawComponent", a);
}
const yn = {
  install: dn
};
export {
  un as ChatContainer,
  tt as ChatInput,
  nt as MessageItem,
  at as MessageList,
  ot as SessionList,
  ut as createChatInitConfig,
  vn as createChatInitConfigFromEnv,
  yn as default,
  Le as defaultChatInitConfig,
  lt as defaultThemeConfig,
  ye as i18n,
  Fs as useChat,
  Ce as useI18n,
  Qs as useTheme,
  zs as useWebSocket
};
//# sourceMappingURL=openclaw-web-channel-vue.js.map
