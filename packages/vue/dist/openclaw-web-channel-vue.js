import { getActivePinia as tt, createPinia as Ue, setActivePinia as st, defineStore as ke, storeToRefs as nt } from "pinia";
import { computed as N, defineComponent as he, ref as C, onMounted as qe, onBeforeUnmount as Oe, openBlock as p, createElementBlock as v, withModifiers as le, normalizeClass as ne, Fragment as ge, renderList as fe, createElementVNode as i, toDisplayString as M, createCommentVNode as U, withDirectives as We, vModelText as Pe, unref as h, withKeys as ot, normalizeStyle as at, watch as ie, nextTick as xe, createTextVNode as me, createVNode as ue, TransitionGroup as rt, withCtx as Ve, createBlock as it, onUnmounted as lt, watchEffect as ct, Transition as ut } from "vue";
import { createI18n as dt } from "vue-i18n";
import ye from "highlight.js";
import { marked as Ce } from "marked";
const De = [
  { key: "model", label: "/model", description: "Switch model" },
  { key: "think", label: "/think", description: "Deep thinking mode" },
  { key: "new", label: "/new", description: "Create new session" },
  { key: "clear", label: "/clear", description: "Clear current session" },
  { key: "help", label: "/help", description: "Show help" }
];
function mt(e) {
  const t = e.trim();
  if (!t.startsWith("/"))
    return null;
  const [s = "", ...n] = t.slice(1).split(" ");
  return {
    command: s,
    args: n.join(" ").trim()
  };
}
function gt(e) {
  if (!e.trim())
    return De;
  const t = e.toLowerCase();
  return De.filter((s) => s.key.includes(t));
}
const ft = {
  title: "OpenClaw Chat",
  newSession: "New session",
  disconnected: "Disconnected",
  reconnect: "Reconnect",
  empty: "Start chatting with OpenClaw"
}, ht = {
  placeholder: "Type your message...",
  thinking: "Thinking...",
  stop: "Stop",
  queued: "Queued: {count}"
}, pt = {
  title: "Sessions",
  empty: "No sessions",
  delete: "Delete",
  clear: "Clear",
  new: "New"
}, vt = {
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
}, yt = {
  connected: "Connected",
  reconnecting: "Reconnecting",
  error: "Connection failed"
}, wt = {
  chat: ft,
  input: ht,
  session: pt,
  message: vt,
  status: yt
}, St = {
  title: "OpenClaw 对话",
  newSession: "新建会话",
  disconnected: "连接已断开",
  reconnect: "重连",
  empty: "开始和 OpenClaw 对话"
}, Ct = {
  placeholder: "输入消息...",
  thinking: "思考中...",
  stop: "停止",
  queued: "等待发送: {count}"
}, kt = {
  title: "会话",
  empty: "暂无会话",
  delete: "删除",
  clear: "清空",
  new: "新建"
}, bt = {
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
}, It = {
  connected: "已连接",
  reconnecting: "重连中",
  error: "连接失败"
}, Mt = {
  chat: St,
  input: Ct,
  session: kt,
  message: bt,
  status: It
}, $t = {
  en: wt,
  "zh-CN": Mt
};
function Lt() {
  return typeof navigator > "u" ? "en" : navigator.language.toLowerCase().startsWith("zh") ? "zh-CN" : "en";
}
const _t = typeof localStorage < "u" ? localStorage.getItem("openclaw:locale") : null, Tt = _t ?? Lt(), de = dt({
  legacy: !1,
  locale: Tt,
  fallbackLocale: "en",
  messages: $t
});
function pe() {
  const e = N({
    get: () => de.global.locale.value,
    set: (n) => {
      de.global.locale.value = n, typeof localStorage < "u" && localStorage.setItem("openclaw:locale", n);
    }
  });
  function t(n) {
    e.value = n;
  }
  function s(n, a) {
    return a ? de.global.t(n, a) : de.global.t(n);
  }
  return {
    t: s,
    locale: e,
    setLocale: t
  };
}
const Et = {
  key: 0,
  class: "oc-command-panel"
}, xt = ["onMousedown"], Dt = {
  key: 1,
  class: "oc-image-bar"
}, Rt = ["src"], At = ["onClick"], Nt = { class: "oc-input-main" }, Ut = { class: "oc-text-wrap" }, qt = ["placeholder", "disabled"], Ot = ["disabled"], Wt = { class: "oc-input-footer" }, Pt = {
  key: 0,
  class: "oc-queue"
}, Vt = /* @__PURE__ */ he({
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
    const s = e, n = t, { t: a } = pe(), f = C(null), c = C(null), T = C(null), b = C(!1), d = C(!1), I = C(""), r = C(0), g = C(!1), y = C([]), S = N({
      get: () => s.modelValue,
      set: (u) => n("update:modelValue", u)
    }), q = N(() => gt(I.value)), F = N(() => S.value.trim().length > 0 && S.value.length <= s.maxLength), j = N(() => s.placeholder || a("input.placeholder")), k = N(() => Math.max(0, s.maxLength - S.value.length));
    function D() {
      const u = c.value;
      u && (u.style.height = "auto", u.style.height = `${Math.min(u.scrollHeight, 200)}px`);
    }
    function Y(u) {
      const m = u.match(/\/(\w*)$/);
      if (!m) {
        d.value = !1, r.value = 0;
        return;
      }
      d.value = !0, I.value = m[1] ?? "", r.value = 0;
    }
    function V(u) {
      const m = u.target.value;
      S.value = m, D(), Y(m);
    }
    function H(u) {
      d.value = !1;
      const m = S.value;
      S.value = m.replace(/\/\w*$/, `/${u} `), n("command", u, ""), requestAnimationFrame(() => {
        var L;
        (L = c.value) == null || L.focus();
      });
    }
    function P(u) {
      if (d.value && q.value.length > 0) {
        if (u.key === "ArrowDown") {
          u.preventDefault(), r.value = (r.value + 1) % q.value.length;
          return;
        }
        if (u.key === "ArrowUp") {
          u.preventDefault(), r.value = (r.value - 1 + q.value.length) % q.value.length;
          return;
        }
        if (u.key === "Enter" && !u.shiftKey) {
          u.preventDefault(), H(q.value[r.value].key);
          return;
        }
      }
      if (u.key === "Enter" && !u.shiftKey && !b.value) {
        if (u.preventDefault(), s.loading) {
          n("stop");
          return;
        }
        J();
      }
    }
    function te() {
      y.value.forEach((u) => {
        URL.revokeObjectURL(u.preview);
      });
    }
    function J() {
      const u = S.value.trim();
      if (s.loading) {
        n("stop");
        return;
      }
      if (!u || u.length > s.maxLength)
        return;
      const m = mt(u);
      if (m) {
        n("command", m.command, m.args), S.value = "", D();
        return;
      }
      n(
        "send",
        u,
        y.value.map((L) => L.file)
      ), S.value = "", te(), y.value = [], D();
    }
    function $(u) {
      u.slice(0, 5).forEach((m) => {
        !m.type.startsWith("image/") || m.size > 10 * 1024 * 1024 || y.value.push({
          file: m,
          preview: URL.createObjectURL(m)
        });
      });
    }
    function x(u) {
      const m = u.target.files;
      m && (n("upload", m), $(Array.from(m)), T.value && (T.value.value = ""));
    }
    function se(u) {
      const m = y.value[u];
      m && URL.revokeObjectURL(m.preview), y.value.splice(u, 1);
    }
    function E() {
      g.value = !0;
    }
    function W(u) {
      var L;
      const m = u.relatedTarget;
      (L = f.value) != null && L.contains(m) || (g.value = !1);
    }
    function Z(u) {
      var L;
      g.value = !1;
      const m = Array.from(((L = u.dataTransfer) == null ? void 0 : L.files) ?? []);
      m.length !== 0 && $(m);
    }
    function ae(u) {
      var L;
      const m = Array.from(((L = u.clipboardData) == null ? void 0 : L.files) ?? []);
      m.length !== 0 && $(m);
    }
    return qe(() => {
      var u;
      (u = c.value) == null || u.addEventListener("paste", ae);
    }), Oe(() => {
      var u;
      (u = c.value) == null || u.removeEventListener("paste", ae), te();
    }), (u, m) => (p(), v("div", {
      ref_key: "rootRef",
      ref: f,
      class: ne(["oc-input-wrap", { "is-drop-active": g.value }]),
      onDragover: le(E, ["prevent"]),
      onDragleave: W,
      onDrop: le(Z, ["prevent"])
    }, [
      d.value && q.value.length ? (p(), v("ul", Et, [
        (p(!0), v(ge, null, fe(q.value, (L, X) => (p(), v("li", {
          key: L.key,
          class: ne({ active: X === r.value }),
          onMousedown: le((o) => H(L.key), ["prevent"])
        }, [
          i("strong", null, M(L.label), 1),
          i("small", null, M(L.description), 1)
        ], 42, xt))), 128))
      ])) : U("", !0),
      y.value.length ? (p(), v("div", Dt, [
        (p(!0), v(ge, null, fe(y.value, (L, X) => (p(), v("div", {
          key: X,
          class: "oc-image-item"
        }, [
          i("img", {
            src: L.preview,
            alt: "preview"
          }, null, 8, Rt),
          i("button", {
            type: "button",
            onClick: (o) => se(X)
          }, "×", 8, At)
        ]))), 128))
      ])) : U("", !0),
      i("div", Nt, [
        i("button", {
          type: "button",
          class: "oc-attach",
          "aria-label": "Attach image",
          onClick: m[0] || (m[0] = (L) => {
            var X;
            return (X = T.value) == null ? void 0 : X.click();
          })
        }, "+"),
        i("input", {
          ref_key: "fileInputRef",
          ref: T,
          type: "file",
          multiple: "",
          accept: "image/*",
          hidden: "",
          onChange: x
        }, null, 544),
        i("div", Ut, [
          We(i("textarea", {
            ref_key: "textareaRef",
            ref: c,
            "onUpdate:modelValue": m[1] || (m[1] = (L) => S.value = L),
            placeholder: j.value,
            disabled: e.disabled,
            rows: "1",
            onInput: V,
            onKeydown: P,
            onCompositionstart: m[2] || (m[2] = (L) => b.value = !0),
            onCompositionend: m[3] || (m[3] = (L) => b.value = !1)
          }, null, 40, qt), [
            [Pe, S.value]
          ]),
          i("div", {
            class: ne(["oc-counter", { warn: k.value < 120 }])
          }, M(k.value), 3)
        ]),
        i("button", {
          type: "button",
          class: "oc-send",
          disabled: !F.value && !e.loading || e.disabled,
          onClick: J
        }, M(e.loading ? h(a)("input.stop") : "Send"), 9, Ot)
      ]),
      i("div", Wt, [
        e.queuedCount > 0 ? (p(), v("span", Pt, M(h(a)("input.queued", { count: e.queuedCount })), 1)) : U("", !0),
        m[4] || (m[4] = i("span", { class: "oc-hint" }, "Enter to send · Shift+Enter newline · / for commands", -1))
      ])
    ], 34));
  }
}), ve = (e, t) => {
  const s = e.__vccOpts || e;
  for (const [n, a] of t)
    s[n] = a;
  return s;
}, Be = /* @__PURE__ */ ve(Vt, [["__scopeId", "data-v-7e81463e"]]);
function He(e, t = "zh-CN") {
  const s = new Date(e);
  return new Intl.DateTimeFormat(t, {
    hour: "2-digit",
    minute: "2-digit"
  }).format(s);
}
function Bt(e, t = "zh-CN") {
  const n = Date.now() - e;
  if (n < 6e4)
    return t.startsWith("zh") ? "刚刚" : "now";
  if (n < 36e5) {
    const a = Math.floor(n / 6e4);
    return t.startsWith("zh") ? `${a}分钟前` : `${a}m ago`;
  }
  return He(e, t);
}
Ce.setOptions({
  gfm: !0,
  breaks: !0
});
function Ht(e, t) {
  return t ? ye.getLanguage(t) ? ye.highlight(e, { language: t }).value : ye.highlightAuto(e).value : ye.highlightAuto(e).value;
}
function zt(e) {
  return e.replace(/<script[\s\S]*?>[\s\S]*?<\/script>/gi, "").replace(/<(iframe|object|embed|style)[\s\S]*?>[\s\S]*?<\/\1>/gi, "").replace(/\son\w+=['"][^'"]*['"]/gi, "").replace(/javascript:/gi, "");
}
function Re(e) {
  const t = e.match(/```[\s\S]*?```/g);
  return t ? t.map((s) => s.replace(/^```\w*\n?/, "").replace(/```$/, "").trim()) : [];
}
function Ft(e, t = {}) {
  const s = new Ce.Renderer(), n = t.highlight ?? !0;
  s.code = (f, c) => {
    const T = (c == null ? void 0 : c.split(/\s+/)[0]) ?? "", b = n ? Ht(f, T) : f;
    return `<pre class="oc-code-block"><code class="hljs language-${T}">${b}</code></pre>`;
  }, s.link = (f, c, T) => {
    const b = f ?? "#", d = c ? ` title="${c}"` : "";
    return `<a href="${b}" target="_blank" rel="noopener noreferrer"${d}>${T}</a>`;
  };
  const a = Ce.parse(e, { renderer: s });
  return zt(a);
}
const Kt = {
  key: 0,
  class: "oc-message-avatar"
}, Qt = { class: "oc-message-content" }, jt = { class: "oc-message-header" }, Yt = { class: "oc-message-body" }, Xt = {
  key: 0,
  class: "oc-message-images"
}, Gt = ["src", "onClick"], Jt = ["innerHTML"], Zt = {
  key: 2,
  class: "oc-cursor"
}, es = { class: "oc-message-actions" }, ts = /* @__PURE__ */ he({
  __name: "MessageItem",
  props: {
    message: {},
    isStreaming: { type: Boolean, default: !1 }
  },
  emits: ["copy", "preview-image", "regenerate", "quote", "delete"],
  setup(e, { emit: t }) {
    const s = e, n = t, { t: a, locale: f } = pe(), c = C(!1), T = C(0), b = C(0), d = C(!1);
    let I = null;
    const r = N(() => Ft(s.message.content, { highlight: !0 })), g = N(() => Re(s.message.content).length > 0), y = N(() => d.value ? a("message.copied") : a("message.copy")), S = N(() => s.message.role === "user" && !!s.message.status), q = N(() => `is-${s.message.status ?? "sent"}`), F = N(() => {
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
    }), j = N(() => s.message.role === "user" ? a("message.you") : s.message.role === "assistant" ? a("message.assistant") : a("message.system")), k = N(() => s.message.role === "assistant" ? "AI" : s.message.role === "user" ? "U" : "S"), D = N(() => ({
      left: `${T.value}px`,
      top: `${b.value}px`
    }));
    function Y($, x) {
      const W = Math.max(10, window.innerWidth - 160 - 10), Z = Math.max(10, window.innerHeight - 180 - 10);
      T.value = Math.min(Math.max(10, $), W), b.value = Math.min(Math.max(10, x), Z);
    }
    function V($) {
      Y($.clientX, $.clientY), c.value = !0;
    }
    function H($) {
      I = window.setTimeout(() => {
        const x = $.touches[0];
        Y(x.clientX, x.clientY), c.value = !0;
      }, 500);
    }
    function P() {
      I && (window.clearTimeout(I), I = null);
    }
    async function te() {
      await navigator.clipboard.writeText(s.message.content), d.value = !0, n("copy", s.message.content), window.setTimeout(() => {
        d.value = !1;
      }, 2e3);
    }
    async function J($) {
      if ($ === "copy" && await te(), $ === "copy-code") {
        const x = Re(s.message.content);
        await navigator.clipboard.writeText(x.join(`

`));
      }
      $ === "quote" && n("quote", s.message), $ === "delete" && n("delete", s.message.id), c.value = !1;
    }
    return ($, x) => {
      var se;
      return p(), v("article", {
        class: ne(["oc-message-item", [e.message.role, { streaming: e.isStreaming }]]),
        onContextmenu: le(V, ["prevent"]),
        onTouchstart: H,
        onTouchend: P
      }, [
        e.message.role !== "system" ? (p(), v("div", Kt, M(k.value), 1)) : U("", !0),
        i("div", Qt, [
          i("header", jt, [
            i("span", null, M(j.value), 1),
            i("time", null, M(h(He)(e.message.timestamp, h(f))), 1),
            S.value ? (p(), v("span", {
              key: 0,
              class: ne(["oc-message-status", q.value])
            }, M(F.value), 3)) : U("", !0)
          ]),
          i("div", Yt, [
            (se = e.message.images) != null && se.length ? (p(), v("div", Xt, [
              (p(!0), v(ge, null, fe(e.message.images, (E, W) => (p(), v("img", {
                key: W,
                src: E.thumbnail || E.url,
                class: "oc-message-image",
                onClick: (Z) => $.$emit("preview-image", E.url)
              }, null, 8, Gt))), 128))
            ])) : U("", !0),
            e.message.content ? (p(), v("div", {
              key: 1,
              class: "oc-message-text",
              innerHTML: r.value
            }, null, 8, Jt)) : U("", !0),
            e.isStreaming ? (p(), v("span", Zt, "▋")) : U("", !0)
          ]),
          i("footer", es, [
            i("button", {
              type: "button",
              onClick: te
            }, M(y.value), 1),
            e.message.role === "assistant" ? (p(), v("button", {
              key: 0,
              type: "button",
              onClick: x[0] || (x[0] = (E) => $.$emit("regenerate"))
            }, M(h(a)("message.regenerate")), 1)) : U("", !0)
          ])
        ]),
        c.value ? (p(), v("div", {
          key: 1,
          class: "oc-context-mask",
          onClick: x[1] || (x[1] = (E) => c.value = !1),
          onKeyup: x[2] || (x[2] = ot((E) => c.value = !1, ["esc"]))
        }, null, 32)) : U("", !0),
        c.value ? (p(), v("menu", {
          key: 2,
          class: "oc-context-menu",
          style: at(D.value)
        }, [
          i("button", {
            type: "button",
            onClick: x[3] || (x[3] = (E) => J("copy"))
          }, M(h(a)("message.copy")), 1),
          g.value ? (p(), v("button", {
            key: 0,
            type: "button",
            onClick: x[4] || (x[4] = (E) => J("copy-code"))
          }, "Copy Code")) : U("", !0),
          i("button", {
            type: "button",
            onClick: x[5] || (x[5] = (E) => J("quote"))
          }, M(h(a)("message.quote")), 1),
          e.message.role === "user" ? (p(), v("button", {
            key: 1,
            type: "button",
            class: "danger",
            onClick: x[6] || (x[6] = (E) => J("delete"))
          }, M(h(a)("message.delete")), 1)) : U("", !0)
        ], 4)) : U("", !0)
      ], 34);
    };
  }
}), ze = /* @__PURE__ */ ve(ts, [["__scopeId", "data-v-77147782"]]), ss = {
  key: 0,
  class: "oc-empty-state"
}, ns = {
  key: 1,
  class: "oc-loading"
}, os = /* @__PURE__ */ he({
  __name: "MessageList",
  props: {
    messages: {},
    streaming: { type: Boolean, default: !1 },
    streamingMessageId: { default: "" },
    loading: { type: Boolean, default: !1 }
  },
  emits: ["scroll-top", "copy", "preview-image", "regenerate", "quote", "delete"],
  setup(e, { expose: t, emit: s }) {
    const n = e, a = s, { t: f } = pe(), c = C(null), T = C(!1);
    function b() {
      const r = c.value;
      return r ? r.scrollHeight - r.scrollTop - r.clientHeight < 120 : !0;
    }
    function d(r = "auto") {
      const g = c.value;
      g && (g.scrollTo({ top: g.scrollHeight, behavior: r }), T.value = !1);
    }
    function I() {
      const r = c.value;
      r && (r.scrollTop <= 0 && a("scroll-top"), T.value = !b());
    }
    return ie(
      () => n.messages.length,
      async () => {
        const r = b();
        await xe(), r && d();
      }
    ), ie(
      () => {
        var r;
        return (r = n.messages.at(-1)) == null ? void 0 : r.content;
      },
      async () => {
        const r = b();
        await xe(), n.streaming && r && d();
      }
    ), t({
      scrollToBottom: d
    }), (r, g) => (p(), v("section", {
      ref_key: "containerRef",
      ref: c,
      class: "oc-message-list",
      role: "log",
      "aria-live": "polite",
      onScroll: I
    }, [
      e.messages.length === 0 ? (p(), v("div", ss, [
        i("h3", null, M(h(f)("chat.empty")), 1),
        g[5] || (g[5] = i("p", null, [
          me("Try: "),
          i("code", null, "/help"),
          me(" · "),
          i("code", null, "/new"),
          me(" · "),
          i("code", null, "/think")
        ], -1))
      ])) : U("", !0),
      ue(rt, {
        name: "oc-message",
        tag: "div",
        class: "oc-message-stack",
        appear: ""
      }, {
        default: Ve(() => [
          (p(!0), v(ge, null, fe(e.messages, (y) => (p(), it(ze, {
            key: y.id,
            message: y,
            "is-streaming": e.streaming && y.id === e.streamingMessageId,
            onCopy: g[0] || (g[0] = (S) => r.$emit("copy", S)),
            onPreviewImage: g[1] || (g[1] = (S) => r.$emit("preview-image", S)),
            onRegenerate: (S) => r.$emit("regenerate", y.id),
            onQuote: g[2] || (g[2] = (S) => r.$emit("quote", S)),
            onDelete: g[3] || (g[3] = (S) => r.$emit("delete", S))
          }, null, 8, ["message", "is-streaming", "onRegenerate"]))), 128))
        ]),
        _: 1
      }),
      e.loading && !e.streaming ? (p(), v("div", ns, "...")) : U("", !0),
      T.value ? (p(), v("button", {
        key: 2,
        type: "button",
        class: "oc-scroll-btn",
        onClick: g[4] || (g[4] = (y) => d("smooth"))
      }, " ↓ New ")) : U("", !0)
    ], 544));
  }
}), Fe = /* @__PURE__ */ ve(os, [["__scopeId", "data-v-0c653ea3"]]), as = { class: "oc-session-header" }, rs = { class: "oc-session-header-actions" }, is = { class: "oc-session-search-wrap" }, ls = {
  key: 0,
  class: "oc-session-empty"
}, cs = {
  key: 1,
  class: "oc-session-items"
}, us = ["onClick"], ds = { class: "oc-session-main" }, ms = { class: "oc-session-title" }, gs = {
  key: 0,
  class: "oc-pin"
}, fs = { class: "oc-session-time" }, hs = { class: "oc-session-sub" }, ps = { class: "oc-session-preview" }, vs = {
  key: 0,
  class: "oc-session-count"
}, ys = { class: "oc-session-actions" }, ws = ["onClick"], Ss = ["onClick"], Cs = /* @__PURE__ */ he({
  __name: "SessionList",
  props: {
    sessions: {},
    currentId: {},
    visible: { type: Boolean, default: !0 }
  },
  emits: ["update:visible", "select", "delete", "reset", "new"],
  setup(e, { emit: t }) {
    const s = e, n = t, { t: a, locale: f } = pe(), c = C(""), T = N(() => {
      const d = c.value.trim().toLowerCase(), I = [...s.sessions].sort((r, g) => !!r.pinned != !!g.pinned ? r.pinned ? -1 : 1 : g.updatedAt - r.updatedAt);
      return d ? I.filter((r) => r.title.toLowerCase().includes(d) || r.lastMessage.toLowerCase().includes(d)) : I;
    });
    function b(d) {
      n("select", d), window.innerWidth < 900 && n("update:visible", !1);
    }
    return (d, I) => (p(), v("aside", {
      class: ne(["oc-session-list", { hidden: !e.visible }])
    }, [
      i("header", as, [
        i("div", null, [
          i("strong", null, M(h(a)("session.title")), 1),
          I[2] || (I[2] = i("p", null, "Context library", -1))
        ]),
        i("div", rs, [
          i("button", {
            type: "button",
            class: "oc-session-btn",
            onClick: I[0] || (I[0] = (r) => n("new"))
          }, M(h(a)("session.new")), 1)
        ])
      ]),
      i("div", is, [
        We(i("input", {
          "onUpdate:modelValue": I[1] || (I[1] = (r) => c.value = r),
          type: "text",
          placeholder: "Search sessions...",
          class: "oc-session-search"
        }, null, 512), [
          [Pe, c.value]
        ])
      ]),
      T.value.length === 0 ? (p(), v("div", ls, M(h(a)("session.empty")), 1)) : (p(), v("ul", cs, [
        (p(!0), v(ge, null, fe(T.value, (r) => (p(), v("li", {
          key: r.id,
          class: ne(["oc-session-item", { active: r.id === e.currentId }]),
          onClick: (g) => b(r.id)
        }, [
          i("div", ds, [
            i("span", ms, [
              r.pinned ? (p(), v("span", gs, "📌")) : U("", !0),
              me(" " + M(r.title), 1)
            ]),
            i("span", fs, M(h(Bt)(r.updatedAt, h(f))), 1)
          ]),
          i("div", hs, [
            i("span", ps, M(r.lastMessage || "..."), 1),
            r.messageCount > 0 ? (p(), v("span", vs, M(r.messageCount > 99 ? "99+" : r.messageCount), 1)) : U("", !0)
          ]),
          i("div", ys, [
            i("button", {
              type: "button",
              onClick: le((g) => n("reset", r.id), ["stop"])
            }, M(h(a)("session.clear")), 9, ws),
            i("button", {
              type: "button",
              onClick: le((g) => n("delete", r.id), ["stop"])
            }, M(h(a)("session.delete")), 9, Ss)
          ])
        ], 10, us))), 128))
      ]))
    ], 2));
  }
}), Ke = /* @__PURE__ */ ve(Cs, [["__scopeId", "data-v-c7185ef6"]]);
let we = null;
function ks() {
  const e = tt();
  return e || (we || (we = Ue()), st(we), we);
}
function Ae(e) {
  const t = /* @__PURE__ */ new Map();
  for (const s of e) {
    const n = t.get(s.id);
    if (!n) {
      t.set(s.id, { ...s });
      continue;
    }
    const a = s.content.length >= n.content.length ? s.content : n.content, f = Math.max(n.timestamp, s.timestamp);
    t.set(s.id, {
      ...n,
      ...s,
      content: a,
      timestamp: f,
      status: s.status ?? n.status,
      statusReason: s.statusReason ?? n.statusReason,
      images: s.images ?? n.images
    });
  }
  return [...t.values()].sort((s, n) => s.timestamp - n.timestamp);
}
const Qe = ke("chat", {
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
      this.ensureSession(e), this.messages[e] = Ae(t);
    },
    mergeMessages(e, t) {
      this.ensureSession(e), this.messages[e] = Ae([...this.messages[e] ?? [], ...t]);
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
function Ne(e, t) {
  var n, a;
  return {
    id: t ?? ((a = (n = globalThis.crypto) == null ? void 0 : n.randomUUID) == null ? void 0 : a.call(n)) ?? `${Date.now()}`,
    title: e,
    updatedAt: Date.now(),
    lastMessage: "",
    messageCount: 0,
    pinned: !1
  };
}
const je = ke("session", {
  state: () => {
    const e = Ne("新会话", "default");
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
    createSession(e = "新会话", t) {
      const s = Ne(e, t);
      return this.sessions.unshift(s), this.currentId = s.id, s;
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
}), bs = ke("connection", {
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
function Is(e) {
  const t = C(null), s = C("disconnected"), n = C(0), a = C(null);
  let f = null, c = null, T = !1;
  const b = e.reconnectMax ?? 5, d = e.reconnectDelay ?? 3e3;
  function I() {
    f && (window.clearTimeout(f), f = null), c && (window.clearInterval(c), c = null);
  }
  function r(k) {
    const D = k.trim();
    if (!D)
      throw new Error("Gateway URL is empty");
    const Y = /^wss?:\/\//.test(D) || /^https?:\/\//.test(D) ? D : `http://${D}`, V = new URL(Y);
    V.protocol = V.protocol === "https:" || V.protocol === "wss:" ? "wss:" : "ws:";
    const H = V.pathname.replace(/\/+$/, "");
    return V.pathname = H.endsWith("/ws") ? H || "/ws" : `${H || ""}/ws`, V.search = "", V.hash = "", V.toString().replace(/\/$/, "");
  }
  function g() {
    c = window.setInterval(() => {
      t.value && t.value.readyState === WebSocket.OPEN && j({ type: "ping" });
    }, 3e4);
  }
  function y() {
    if (n.value >= b) {
      s.value = "error";
      return;
    }
    n.value += 1, s.value = "reconnecting";
    const k = Math.min(d * n.value, 15e3);
    f = window.setTimeout(() => {
      S();
    }, k);
  }
  async function S() {
    T = !1, I();
    try {
      const k = r(e.gatewayUrl);
      t.value = new WebSocket(k);
    } catch (k) {
      s.value = "error", a.value = k instanceof Error ? k.message : String(k), y();
      return;
    }
    t.value.onopen = () => {
      var k;
      s.value = "connected", n.value = 0, a.value = null, g(), (k = e.onConnect) == null || k.call(e), e.token && j({
        type: "auth",
        payload: {
          token: e.token
        }
      });
    }, t.value.onmessage = (k) => {
      var D;
      try {
        const Y = JSON.parse(k.data);
        (D = e.onMessage) == null || D.call(e, Y);
      } catch {
        s.value = "error", a.value = "Failed to parse websocket payload";
      }
    }, t.value.onerror = (k) => {
      var D;
      s.value = "error", (D = e.onError) == null || D.call(e, k);
    }, t.value.onclose = (k) => {
      var D;
      if (I(), (D = e.onDisconnect) == null || D.call(e, k), T) {
        s.value = "disconnected";
        return;
      }
      y();
    };
  }
  function q() {
    T = !0, I(), t.value && (t.value.onclose = null, t.value.close(), t.value = null), s.value = "disconnected";
  }
  function F() {
    I(), t.value && (t.value.onclose = null, t.value.close(), t.value = null), T = !1, S();
  }
  function j(k) {
    if (!t.value || t.value.readyState !== WebSocket.OPEN)
      throw new Error("WebSocket is not connected");
    t.value.send(JSON.stringify(k));
  }
  return lt(() => {
    q();
  }), {
    ws: t,
    status: s,
    reconnectCount: n,
    lastError: a,
    connect: S,
    disconnect: q,
    reconnect: F,
    send: j
  };
}
function Ms() {
  const e = C([]);
  function t(f) {
    e.value.push(f);
  }
  function s() {
    return e.value.shift();
  }
  function n(f) {
    e.value.splice(f, 1);
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
function $s() {
  var e, t;
  return ((t = (e = globalThis.crypto) == null ? void 0 : e.randomUUID) == null ? void 0 : t.call(e)) ?? `${Date.now()}-${Math.random()}`;
}
function Ls(e) {
  const t = Qe(), s = je(), n = bs(), { queue: a, enqueue: f, dequeue: c, remove: T } = Ms(), b = C(!1), d = C(!1), I = C(!1), r = C(null), g = C(null), y = C(null), S = C(null), q = /* @__PURE__ */ new Map(), F = /* @__PURE__ */ new Map(), j = /* @__PURE__ */ new Set(), k = /* @__PURE__ */ new Map(), D = Math.min(Math.max(e.historyLimit ?? 80, 20), 300), Y = Math.min(Math.max(e.historyStep ?? 50, 20), 150);
  e.sessionId && (s.sessions.some((o) => o.id === e.sessionId) || s.createSession("新会话", e.sessionId), s.selectSession(e.sessionId)), t.setCurrentSession(s.currentId);
  function V() {
    return e.gatewayUrl.endsWith("/") ? e.gatewayUrl.slice(0, -1) : e.gatewayUrl;
  }
  function H(o) {
    return q.get(o) ?? s.currentId;
  }
  function P(o, w) {
    const _ = H(o);
    t.updateMessage(_, o, w);
  }
  function te(o) {
    const w = H(o.messageId), _ = F.get(o.messageId) ?? `ai-${o.messageId}`;
    F.set(o.messageId, _), S.value = _, t.setStreaming(w, _), t.appendStreamContent(w, _, o.content), P(o.messageId, { status: "streaming" }), d.value = !1, b.value = !0;
  }
  function J(o) {
    const w = o.reason ? String(o.reason).slice(0, 200) : void 0;
    if (P(o.messageId, {
      status: o.status,
      statusReason: w
    }), o.status === "accepted" || o.status === "processing") {
      d.value = !0;
      return;
    }
    if (o.status === "streaming") {
      d.value = !1, b.value = !0;
      return;
    }
    (o.status === "failed" || o.status === "aborted") && y.value === o.messageId && (d.value = !1);
  }
  function $(o) {
    const w = H(o);
    y.value === o && (y.value = null, S.value = null, d.value = !1, b.value = !1), t.setStreaming(w, null), q.delete(o), F.delete(o);
    const _ = c();
    _ && W(_.content, _.images);
  }
  async function x(o = {}) {
    var K;
    const w = (o.sessionId ?? s.currentId).trim();
    if (!w || I.value)
      return;
    const _ = k.get(w) ?? D, z = o.limit ?? (o.append ? _ + Y : _), O = Math.min(Math.max(z, 20), 300), R = (t.messages[w] ?? []).length > 0;
    if (!(!o.force && !o.append && j.has(w) && R)) {
      k.set(w, O), r.value = null, I.value = !0;
      try {
        const B = await fetch(`${V()}/sessions/${encodeURIComponent(w)}/history?limit=${O}`);
        if (!B.ok)
          throw new Error(`HTTP ${B.status}`);
        const ee = (await B.json()).messages.filter((G) => typeof G.content == "string" && G.content.trim().length > 0).map((G) => ({
          id: G.id,
          role: G.role,
          content: G.content,
          timestamp: G.timestamp,
          status: G.role === "user" ? "delivered" : "sent"
        }));
        t.mergeMessages(w, ee);
        const Se = ((K = t.messages[w]) == null ? void 0 : K.length) ?? ee.length, ce = [...ee].reverse().find((G) => G.role !== "system") ?? ee[ee.length - 1];
        ce && s.syncSessionSnapshot(w, {
          lastMessage: ce.content,
          messageCount: Se,
          updatedAt: ce.timestamp
        }), j.add(w);
      } catch (B) {
        r.value = B instanceof Error ? B.message : String(B);
      } finally {
        I.value = !1;
      }
    }
  }
  function se(o) {
    var w, _, z, O;
    switch (o.type) {
      case "connected": {
        n.setStatus("connected");
        break;
      }
      case "auth_failed": {
        n.setStatus("error", o.error), d.value = !1, b.value = !1;
        break;
      }
      case "message_received": {
        P(o.messageId, {
          status: o.duplicate ? "processing" : "accepted"
        }), d.value = !0, o.duplicate && (b.value = !0);
        break;
      }
      case "message_status": {
        J(o);
        break;
      }
      case "chunk": {
        te(o);
        break;
      }
      case "stream_end": {
        if (o.error) {
          const R = o.aborted ? "aborted" : "failed";
          P(o.messageId, { status: R });
        } else
          P(o.messageId, { status: "delivered" });
        $(o.messageId);
        break;
      }
      case "message": {
        const R = s.currentId;
        t.addMessage(R, {
          id: o.id,
          role: "assistant",
          content: o.content,
          timestamp: o.timestamp,
          status: "delivered"
        }), s.touchSession(R, o.content), d.value = !1, b.value = !1;
        break;
      }
      case "stopped": {
        P(o.messageId, {
          status: "aborted",
          statusReason: o.noop ? "noop" : "stopped_by_user"
        }), $(o.messageId);
        break;
      }
      case "error": {
        const R = (w = o.error) == null ? void 0 : w.details, K = ((_ = o.error) == null ? void 0 : _.message) ?? "Unknown websocket error", B = ((z = o.error) == null ? void 0 : z.reason) ?? (R == null ? void 0 : R.reason) ?? K, Q = ((O = o.error) == null ? void 0 : O.messageId) ?? (R == null ? void 0 : R.messageId);
        n.setStatus("error", K), Q ? (P(Q, {
          status: "failed",
          statusReason: B
        }), $(Q)) : y.value && (P(y.value, {
          status: "failed",
          statusReason: B
        }), $(y.value)), d.value = !1, b.value = !1;
        break;
      }
      case "server_closing": {
        n.setStatus("disconnected", o.reason);
        break;
      }
    }
  }
  const E = Is({
    gatewayUrl: e.gatewayUrl,
    token: e.token,
    reconnectMax: e.reconnectMax,
    reconnectDelay: e.reconnectDelay,
    onMessage: se,
    onConnect: () => {
      if (n.setStatus("connected"), n.resetReconnect(), !y.value && !b.value) {
        const o = c();
        o && W(o.content, o.images);
      }
    },
    onDisconnect: () => {
      n.setStatus("disconnected"), y.value && P(y.value, {
        status: "pending",
        statusReason: "connection_lost"
      });
    },
    onError: () => {
      n.setStatus("error", "WebSocket error");
    }
  });
  async function W(o, w) {
    const _ = o.trim();
    if (!_)
      return;
    const z = e.maxMessageLength ?? 4e3;
    if (_.length > z)
      throw new Error(`Message exceeds max length: ${z}`);
    const O = s.currentId, R = $s(), K = w == null ? void 0 : w.map((Q) => ({
      url: URL.createObjectURL(Q)
    }));
    t.addMessage(O, {
      id: R,
      role: "user",
      content: g.value ? `> ${g.value.content}

${_}` : _,
      timestamp: Date.now(),
      images: K,
      status: "pending"
    }), s.touchSession(O, _), y.value = R, S.value = `ai-${R}`, q.set(R, O), F.set(R, S.value), t.setStreaming(O, S.value), d.value = !0, b.value = !1;
    const B = K == null ? void 0 : K.map((Q) => Q.url);
    try {
      E.send({
        type: "chat",
        payload: {
          content: _,
          sessionId: O,
          messageId: R,
          attachments: B
        }
      });
    } catch (Q) {
      const ee = Q instanceof Error ? Q.message : "Failed to send message";
      P(R, {
        status: "failed",
        statusReason: ee
      }), $(R), n.setStatus("error", ee);
    }
    g.value = null;
  }
  async function Z(o, w) {
    if (d.value || b.value) {
      f({ content: o, images: w });
      return;
    }
    await W(o, w);
  }
  function ae() {
    if (!y.value)
      return;
    const o = y.value;
    try {
      E.send({
        type: "stop",
        payload: {
          messageId: o
        }
      });
    } catch {
    }
    P(o, {
      status: "aborted",
      statusReason: "stopped_by_user"
    }), $(o);
  }
  function u(o) {
    g.value = o;
  }
  function m(o) {
    const w = t.currentMessages, _ = w.findIndex((O) => O.id === o);
    if (_ === -1)
      return;
    let z = w[_];
    if (z.role !== "user") {
      for (let O = _ - 1; O >= 0; O -= 1)
        if (w[O].role === "user") {
          z = w[O];
          break;
        }
    }
    z.role === "user" && Z(z.content);
  }
  function L() {
    return E.connect();
  }
  function X(o) {
    T(o);
  }
  return {
    messages: N(() => t.currentMessages),
    isStreaming: b,
    isLoading: d,
    isConnected: N(() => E.status.value === "connected"),
    status: N(() => E.status.value),
    reconnectCount: N(() => E.reconnectCount.value),
    queue: a,
    quoteMessage: g,
    send: Z,
    stop: ae,
    quote: u,
    retry: m,
    connect: L,
    loadHistory: x,
    disconnect: E.disconnect,
    reconnect: E.reconnect,
    removeFromQueue: X,
    isHistoryLoading: I,
    historyError: r
  };
}
function _s(e) {
  return e || (typeof localStorage > "u" ? "system" : localStorage.getItem("openclaw:theme") ?? "system");
}
function Ts() {
  return typeof window < "u" && window.matchMedia("(prefers-color-scheme: dark)").matches;
}
function Es(e) {
  const t = C(_s(e)), s = N(() => t.value === "system" ? Ts() : t.value === "dark");
  function n(f) {
    t.value = f, typeof localStorage < "u" && localStorage.setItem("openclaw:theme", f);
  }
  function a() {
    n(s.value ? "light" : "dark");
  }
  return ct(() => {
    typeof document > "u" || (document.documentElement.dataset.openclawTheme = s.value ? "dark" : "light");
  }), {
    theme: t,
    isDark: s,
    setTheme: n,
    toggle: a
  };
}
const xs = {}, re = {
  autoScroll: !0,
  enableTypingIndicator: !0,
  maxFileSize: 10 * 1024 * 1024,
  allowedFileTypes: ["image/*"],
  maxMessageLength: 4e3,
  reconnectMax: 5,
  reconnectDelay: 3e3
}, Ye = {
  mode: "system"
}, Xe = {
  gatewayUrl: "http://127.0.0.1:3000",
  token: "",
  sessionId: "",
  userId: "",
  locale: "auto",
  theme: Ye,
  options: re
};
function Ge(e = {}) {
  return {
    ...Xe,
    ...e,
    theme: {
      ...Ye,
      ...e.theme ?? {}
    },
    options: {
      ...re,
      ...e.options ?? {}
    }
  };
}
function Ys(e) {
  const t = e ?? xs ?? {};
  return Ge({
    gatewayUrl: String(t.VITE_OPENCLAW_GATEWAY_URL ?? Xe.gatewayUrl),
    token: String(t.VITE_OPENCLAW_TOKEN ?? ""),
    locale: String(t.VITE_OPENCLAW_LOCALE ?? "auto"),
    theme: {
      mode: t.VITE_OPENCLAW_THEME ?? "system"
    },
    options: {
      maxMessageLength: Number(t.VITE_OPENCLAW_MAX_MESSAGE_LENGTH ?? re.maxMessageLength),
      reconnectDelay: Number(t.VITE_OPENCLAW_RECONNECT_DELAY ?? re.reconnectDelay),
      reconnectMax: Number(t.VITE_OPENCLAW_RECONNECT_MAX ?? re.reconnectMax),
      maxFileSize: Number(t.VITE_OPENCLAW_MAX_FILE_SIZE ?? re.maxFileSize),
      autoScroll: String(t.VITE_OPENCLAW_AUTO_SCROLL ?? "true") !== "false",
      enableTypingIndicator: String(t.VITE_OPENCLAW_TYPING_INDICATOR ?? "true") !== "false",
      allowedFileTypes: re.allowedFileTypes
    }
  });
}
const Ds = { class: "oc-chat-header" }, Rs = { class: "oc-chat-header-main" }, As = { class: "oc-title-block" }, Ns = { class: "oc-chat-header-actions" }, Us = { class: "oc-chat-body" }, qs = { class: "oc-chat-main" }, Os = {
  key: 0,
  class: "oc-offline"
}, Ws = ["src"], Ps = /* @__PURE__ */ he({
  __name: "ChatContainer",
  props: {
    gatewayUrl: { default: "" },
    token: { default: "" },
    sessionId: { default: "" },
    userId: { default: "" },
    theme: {},
    locale: { default: "auto" },
    options: { default: () => ({}) },
    initConfig: { default: () => ({}) }
  },
  emits: ["connect", "disconnect", "error", "message", "session-change"],
  setup(e, { emit: t }) {
    var be, Ie, Me, $e, Le, _e, Te;
    ks();
    const s = e, n = t, a = Ge({
      ...s.initConfig,
      gatewayUrl: s.gatewayUrl || ((be = s.initConfig) == null ? void 0 : be.gatewayUrl),
      token: s.token || ((Ie = s.initConfig) == null ? void 0 : Ie.token),
      sessionId: s.sessionId || ((Me = s.initConfig) == null ? void 0 : Me.sessionId),
      userId: s.userId || (($e = s.initConfig) == null ? void 0 : $e.userId),
      locale: s.locale !== "auto" ? s.locale : (Le = s.initConfig) == null ? void 0 : Le.locale,
      theme: s.theme ?? ((_e = s.initConfig) == null ? void 0 : _e.theme),
      options: {
        ...((Te = s.initConfig) == null ? void 0 : Te.options) ?? {},
        ...s.options ?? {}
      }
    }), f = Qe(), c = je(), { sortedSessions: T, currentSession: b } = nt(c);
    a.sessionId && !c.sessions.some((l) => l.id === a.sessionId) && c.createSession("新会话", a.sessionId), a.sessionId && c.selectSession(a.sessionId), f.setCurrentSession(c.currentId);
    const { t: d, locale: I, setLocale: r } = pe(), { isDark: g, toggle: y } = Es(a.theme.mode);
    a.locale && a.locale !== "auto" && r(a.locale);
    const {
      messages: S,
      isStreaming: q,
      isLoading: F,
      isConnected: j,
      status: k,
      queue: D,
      send: Y,
      stop: V,
      quote: H,
      retry: P,
      connect: te,
      reconnect: J,
      loadHistory: $,
      isHistoryLoading: x,
      historyError: se
    } = Ls({
      gatewayUrl: a.gatewayUrl,
      token: a.token,
      sessionId: c.currentId,
      reconnectDelay: a.options.reconnectDelay,
      reconnectMax: a.options.reconnectMax,
      maxMessageLength: a.options.maxMessageLength
    }), E = C(""), W = C(!0), Z = C(!1), ae = C(""), u = C(null), m = N(() => c.currentId), L = N(() => f.streamingMessageId ?? ""), X = N(() => k.value === "connected" ? d("status.connected") : k.value === "reconnecting" ? `${d("status.reconnecting")} (${D.value.length})` : d("chat.disconnected"));
    function o(l) {
      if ((l.metaKey || l.ctrlKey) && l.shiftKey && l.key.toLowerCase() === "l") {
        l.preventDefault(), y();
        return;
      }
      (l.metaKey || l.ctrlKey) && l.key.toLowerCase() === "b" && (l.preventDefault(), W.value = !W.value);
    }
    qe(async () => {
      window.addEventListener("keydown", o);
      try {
        await te(), await $({ force: !0 }), n("connect");
      } catch (l) {
        n("error", { error: l instanceof Error ? l.message : "connect failed" });
      }
    }), Oe(() => {
      window.removeEventListener("keydown", o);
    }), ie(
      () => c.currentId,
      (l, A) => {
        l !== A && (f.setCurrentSession(l), n("session-change", { sessionId: l }), $({ sessionId: l }));
      }
    ), ie(
      () => k.value,
      (l) => {
        l === "error" && n("error", { error: "WebSocket connection error" }), l === "disconnected" && n("disconnect", { reason: "socket closed" });
      }
    ), ie(
      () => se.value,
      (l) => {
        l && n("error", { error: `History sync failed: ${l}` });
      }
    ), ie(
      () => S.value.at(-1),
      (l) => {
        l && n("message", {
          message: l,
          sessionId: c.currentId
        });
      }
    );
    async function w(l, A) {
      await Y(l, A), E.value = "";
    }
    function _(l) {
    }
    function z(l, A) {
      if (l === "new") {
        B();
        return;
      }
      if (l === "clear") {
        K(c.currentId);
        return;
      }
      if (l === "model") {
        E.value = `/model ${A}`.trim();
        return;
      }
      l === "help" && f.addMessage(c.currentId, {
        id: `${Date.now()}`,
        role: "system",
        content: "/model, /think, /new, /clear, /help",
        timestamp: Date.now(),
        status: "sent"
      });
    }
    function O(l) {
      c.selectSession(l), f.setCurrentSession(l);
    }
    function R(l) {
      c.deleteSession(l), f.clearMessages(l);
    }
    function K(l) {
      f.clearMessages(l), f.addMessage(l, {
        id: `${Date.now()}`,
        role: "system",
        content: "历史已清空",
        timestamp: Date.now(),
        status: "sent"
      }), c.resetSession(l);
    }
    function B() {
      const l = c.createSession(d("chat.newSession"));
      f.setCurrentSession(l.id), window.innerWidth < 900 && (W.value = !1);
    }
    function Q(l) {
    }
    function ee(l) {
      ae.value = l, Z.value = !0;
    }
    function Se(l) {
      P(l);
    }
    function ce(l) {
      H(l), E.value = `> ${l.content}
`;
    }
    function G(l) {
      f.deleteMessage(c.currentId, l);
    }
    function Je() {
      $({
        sessionId: c.currentId,
        append: !0,
        force: !0
      });
    }
    function Ze() {
      r(I.value === "zh-CN" ? "en" : "zh-CN");
    }
    function et() {
      J();
    }
    return (l, A) => {
      var Ee;
      return p(), v("section", {
        class: ne(["openclaw-chat oc-chat-shell", { "is-dark": h(g) }])
      }, [
        A[7] || (A[7] = i("div", { class: "oc-bg-orb oc-bg-orb-a" }, null, -1)),
        A[8] || (A[8] = i("div", { class: "oc-bg-orb oc-bg-orb-b" }, null, -1)),
        i("header", Ds, [
          i("div", Rs, [
            i("button", {
              type: "button",
              class: "oc-mobile-menu",
              "aria-label": "Toggle sessions",
              onClick: A[0] || (A[0] = (oe) => W.value = !W.value)
            }, "☰"),
            i("div", As, [
              i("strong", null, M(((Ee = h(b)) == null ? void 0 : Ee.title) || h(d)("chat.title")), 1),
              i("p", null, "Web Channel · " + M(X.value), 1)
            ])
          ]),
          i("div", Ns, [
            i("span", {
              class: ne(["oc-connection", h(k)])
            }, [
              A[6] || (A[6] = i("span", { class: "dot" }, null, -1)),
              me(" " + M(X.value), 1)
            ], 2),
            i("button", {
              type: "button",
              onClick: A[1] || (A[1] = //@ts-ignore
              (...oe) => h(y) && h(y)(...oe))
            }, M(h(g) ? "Light" : "Dark"), 1),
            i("button", {
              type: "button",
              onClick: Ze
            }, M(h(I) === "zh-CN" ? "EN" : "中文"), 1),
            i("button", {
              type: "button",
              class: "primary",
              onClick: B
            }, M(h(d)("chat.newSession")), 1)
          ])
        ]),
        i("div", Us, [
          W.value ? (p(), v("div", {
            key: 0,
            class: "oc-sidebar-mask",
            onClick: A[2] || (A[2] = (oe) => W.value = !1)
          })) : U("", !0),
          ue(Ke, {
            visible: W.value,
            "onUpdate:visible": A[3] || (A[3] = (oe) => W.value = oe),
            sessions: h(T),
            "current-id": m.value,
            onSelect: O,
            onDelete: R,
            onReset: K,
            onNew: B
          }, null, 8, ["visible", "sessions", "current-id"]),
          i("main", qs, [
            ue(Fe, {
              ref_key: "messageListRef",
              ref: u,
              messages: h(S),
              streaming: h(q),
              "streaming-message-id": L.value,
              loading: h(F) || h(x),
              onCopy: Q,
              onPreviewImage: ee,
              onRegenerate: Se,
              onQuote: ce,
              onDelete: G,
              onScrollTop: Je
            }, null, 8, ["messages", "streaming", "streaming-message-id", "loading"]),
            ue(ut, { name: "oc-fade" }, {
              default: Ve(() => [
                h(j) ? U("", !0) : (p(), v("div", Os, [
                  i("span", null, M(h(d)("chat.disconnected")), 1),
                  i("button", {
                    type: "button",
                    onClick: et
                  }, M(h(d)("chat.reconnect")), 1)
                ]))
              ]),
              _: 1
            }),
            ue(Be, {
              modelValue: E.value,
              "onUpdate:modelValue": A[4] || (A[4] = (oe) => E.value = oe),
              disabled: h(F) && !h(q),
              uploading: !1,
              loading: h(q),
              "queued-count": h(D).length,
              "max-length": h(a).options.maxMessageLength,
              onSend: w,
              onUpload: _,
              onCommand: z,
              onStop: h(V)
            }, null, 8, ["modelValue", "disabled", "loading", "queued-count", "max-length", "onStop"])
          ])
        ]),
        Z.value ? (p(), v("dialog", {
          key: 0,
          class: "oc-preview",
          open: "",
          onClick: A[5] || (A[5] = (oe) => Z.value = !1)
        }, [
          i("img", {
            src: ae.value,
            alt: "preview"
          }, null, 8, Ws)
        ])) : U("", !0)
      ], 2);
    };
  }
}), Vs = /* @__PURE__ */ ve(Ps, [["__scopeId", "data-v-7a558c3a"]]), Bs = [Vs, Fe, ze, Be, Ke];
function Hs(e) {
  var s, n;
  !!((n = (s = e._context) == null ? void 0 : s.provides) != null && n.pinia) || e.use(Ue()), e.use(de);
  for (const a of Bs)
    e.component(a.name ?? "OpenClawComponent", a);
}
const Xs = {
  install: Hs
};
export {
  Vs as ChatContainer,
  Be as ChatInput,
  ze as MessageItem,
  Fe as MessageList,
  Ke as SessionList,
  Ge as createChatInitConfig,
  Ys as createChatInitConfigFromEnv,
  Xs as default,
  Xe as defaultChatInitConfig,
  Ye as defaultThemeConfig,
  de as i18n,
  Ls as useChat,
  pe as useI18n,
  Es as useTheme,
  Is as useWebSocket
};
//# sourceMappingURL=openclaw-web-channel-vue.js.map
