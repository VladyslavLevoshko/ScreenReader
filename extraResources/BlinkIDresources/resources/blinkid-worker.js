/**
 * @license
 * Copyright 2019 Google LLC
 * SPDX-License-Identifier: Apache-2.0
 */
const $ = Symbol("Comlink.proxy"), re = Symbol("Comlink.endpoint"), te = Symbol("Comlink.releaseProxy"), E = Symbol("Comlink.finalizer"), k = Symbol("Comlink.thrown"), V = (r) => typeof r == "object" && r !== null || typeof r == "function", se = {
  canHandle: (r) => V(r) && r[$],
  serialize(r) {
    const { port1: e, port2: t } = new MessageChannel();
    return L(r, e), [t, [t]];
  },
  deserialize(r) {
    return r.start(), ie(r);
  }
}, ne = {
  canHandle: (r) => V(r) && k in r,
  serialize({ value: r }) {
    let e;
    return r instanceof Error ? e = {
      isError: !0,
      value: {
        message: r.message,
        name: r.name,
        stack: r.stack
      }
    } : e = { isError: !1, value: r }, [e, []];
  },
  deserialize(r) {
    throw r.isError ? Object.assign(new Error(r.value.message), r.value) : r.value;
  }
}, _ = /* @__PURE__ */ new Map([
  ["proxy", se],
  ["throw", ne]
]);
function oe(r, e) {
  for (const t of r)
    if (e === t || t === "*" || t instanceof RegExp && t.test(e))
      return !0;
  return !1;
}
function L(r, e = globalThis, t = ["*"]) {
  e.addEventListener("message", function n(a) {
    if (!a || !a.data)
      return;
    if (!oe(t, a.origin)) {
      console.warn(`Invalid origin '${a.origin}' for comlink proxy`);
      return;
    }
    const { id: l, type: s, path: o } = Object.assign({ path: [] }, a.data), d = (a.data.argumentList || []).map(y);
    let c;
    try {
      const i = o.slice(0, -1).reduce((h, m) => h[m], r), f = o.reduce((h, m) => h[m], r);
      switch (s) {
        case "GET":
          c = f;
          break;
        case "SET":
          i[o.slice(-1)[0]] = y(a.data.value), c = !0;
          break;
        case "APPLY":
          c = f.apply(i, d);
          break;
        case "CONSTRUCT":
          {
            const h = new f(...d);
            c = x(h);
          }
          break;
        case "ENDPOINT":
          {
            const { port1: h, port2: m } = new MessageChannel();
            L(r, m), c = G(h, [h]);
          }
          break;
        case "RELEASE":
          c = void 0;
          break;
        default:
          return;
      }
    } catch (i) {
      c = { value: i, [k]: 0 };
    }
    Promise.resolve(c).catch((i) => ({ value: i, [k]: 0 })).then((i) => {
      const [f, h] = T(i);
      e.postMessage(Object.assign(Object.assign({}, f), { id: l }), h), s === "RELEASE" && (e.removeEventListener("message", n), j(e), E in r && typeof r[E] == "function" && r[E]());
    }).catch((i) => {
      const [f, h] = T({
        value: new TypeError("Unserializable return value"),
        [k]: 0
      });
      e.postMessage(Object.assign(Object.assign({}, f), { id: l }), h);
    });
  }), e.start && e.start();
}
function ae(r) {
  return r.constructor.name === "MessagePort";
}
function j(r) {
  ae(r) && r.close();
}
function ie(r, e) {
  const t = /* @__PURE__ */ new Map();
  return r.addEventListener("message", function(a) {
    const { data: l } = a;
    if (!l || !l.id)
      return;
    const s = t.get(l.id);
    if (s)
      try {
        s(l);
      } finally {
        t.delete(l.id);
      }
  }), N(r, t, [], e);
}
function b(r) {
  if (r)
    throw new Error("Proxy has been released and is not useable");
}
function q(r) {
  return w(r, /* @__PURE__ */ new Map(), {
    type: "RELEASE"
  }).then(() => {
    j(r);
  });
}
const S = /* @__PURE__ */ new WeakMap(), R = "FinalizationRegistry" in globalThis && new FinalizationRegistry((r) => {
  const e = (S.get(r) || 0) - 1;
  S.set(r, e), e === 0 && q(r);
});
function ce(r, e) {
  const t = (S.get(e) || 0) + 1;
  S.set(e, t), R && R.register(r, e, r);
}
function le(r) {
  R && R.unregister(r);
}
function N(r, e, t = [], n = function() {
}) {
  let a = !1;
  const l = new Proxy(n, {
    get(s, o) {
      if (b(a), o === te)
        return () => {
          le(l), q(r), e.clear(), a = !0;
        };
      if (o === "then") {
        if (t.length === 0)
          return { then: () => l };
        const d = w(r, e, {
          type: "GET",
          path: t.map((c) => c.toString())
        }).then(y);
        return d.then.bind(d);
      }
      return N(r, e, [...t, o]);
    },
    set(s, o, d) {
      b(a);
      const [c, i] = T(d);
      return w(r, e, {
        type: "SET",
        path: [...t, o].map((f) => f.toString()),
        value: c
      }, i).then(y);
    },
    apply(s, o, d) {
      b(a);
      const c = t[t.length - 1];
      if (c === re)
        return w(r, e, {
          type: "ENDPOINT"
        }).then(y);
      if (c === "bind")
        return N(r, e, t.slice(0, -1));
      const [i, f] = B(d);
      return w(r, e, {
        type: "APPLY",
        path: t.map((h) => h.toString()),
        argumentList: i
      }, f).then(y);
    },
    construct(s, o) {
      b(a);
      const [d, c] = B(o);
      return w(r, e, {
        type: "CONSTRUCT",
        path: t.map((i) => i.toString()),
        argumentList: d
      }, c).then(y);
    }
  });
  return ce(l, r), l;
}
function de(r) {
  return Array.prototype.concat.apply([], r);
}
function B(r) {
  const e = r.map(T);
  return [e.map((t) => t[0]), de(e.map((t) => t[1]))];
}
const H = /* @__PURE__ */ new WeakMap();
function G(r, e) {
  return H.set(r, e), r;
}
function x(r) {
  return Object.assign(r, { [$]: !0 });
}
function T(r) {
  for (const [e, t] of _)
    if (t.canHandle(r)) {
      const [n, a] = t.serialize(r);
      return [
        {
          type: "HANDLER",
          name: e,
          value: n
        },
        a
      ];
    }
  return [
    {
      type: "RAW",
      value: r
    },
    H.get(r) || []
  ];
}
function y(r) {
  switch (r.type) {
    case "HANDLER":
      return _.get(r.name).deserialize(r.value);
    case "RAW":
      return r.value;
  }
}
function w(r, e, t, n) {
  return new Promise((a) => {
    const l = ue();
    e.set(l, a), r.start && r.start(), r.postMessage(Object.assign({ id: l }, t), n);
  });
}
function ue() {
  return new Array(4).fill(0).map(() => Math.floor(Math.random() * Number.MAX_SAFE_INTEGER).toString(16)).join("-");
}
const he = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 3, 1, 0, 1, 10, 14, 1, 12, 0, 65, 0, 65, 0, 65, 0, 252, 10, 0, 0, 11])), fe = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 2, 8, 1, 1, 97, 1, 98, 3, 127, 1, 6, 6, 1, 127, 1, 65, 0, 11, 7, 5, 1, 1, 97, 3, 1])), me = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 7, 1, 5, 0, 208, 112, 26, 11])), ge = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 12, 1, 10, 0, 67, 0, 0, 0, 0, 252, 0, 26, 11])), pe = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 10, 8, 1, 6, 0, 65, 0, 192, 26, 11])), ye = async () => WebAssembly.validate(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 5, 1, 96, 0, 1, 123, 3, 2, 1, 0, 10, 10, 1, 8, 0, 65, 0, 253, 15, 253, 98, 11])), we = () => (async (r) => {
  try {
    return typeof MessageChannel < "u" && new MessageChannel().port1.postMessage(new SharedArrayBuffer(1)), WebAssembly.validate(r);
  } catch {
    return !1;
  }
})(new Uint8Array([0, 97, 115, 109, 1, 0, 0, 0, 1, 4, 1, 96, 0, 0, 3, 2, 1, 0, 5, 4, 1, 3, 1, 1, 10, 11, 1, 9, 0, 65, 0, 254, 16, 2, 0, 26, 11]));
function be() {
  const r = navigator.userAgent.toLowerCase();
  return r.includes("safari") && !r.includes("chrome");
}
async function Pe() {
  if (!await we())
    return !1;
  if (!("importScripts" in self))
    throw Error("Not implemented");
  return be() ? !1 : "Worker" in self;
}
async function Ee() {
  const r = [
    fe(),
    me(),
    he(),
    ge(),
    pe()
  ];
  if (!(await Promise.all(r)).every(Boolean))
    throw new Error("Browser doesn't meet minimum requirements!");
  return await ye() ? await Pe() ? "advanced-threads" : "advanced" : "basic";
}
const ke = { basic: { full: 3454331, lightweight: 3493773 }, advanced: { full: 3464883, lightweight: 3502051 }, "advanced-threads": { full: 3514548, lightweight: 3550604 } }, Se = { basic: { full: 13806438, lightweight: 12173753 }, advanced: { full: 13806438, lightweight: 12173753 }, "advanced-threads": { full: 13806438, lightweight: 12173753 } }, Re = {
  wasm: ke,
  data: Se
};
function P(...r) {
  const e = r.filter((t) => t).join("/").replace(/([^:]\/)\/+/g, "$1");
  try {
    new URL(e, "http://example.com");
  } catch {
    throw new Error(`Invalid URL: ${e}`);
  }
  return e;
}
async function z(r, e) {
  const { url: t, fileType: n, variant: a, buildType: l, progressCallback: s } = r, o = await fetch(t);
  if (!s)
    return o.arrayBuffer();
  const d = o.headers.get("Content-Length"), c = d ? parseInt(d, 10) : e({ fileType: n, variant: a, buildType: l });
  if (isNaN(c) || c <= 0)
    throw new Error(`Invalid content length for ${n} file: ${c}`);
  let i = 0;
  const f = new TransformStream({
    transform(m, g) {
      i += m.length;
      const p = Math.min(Math.round(i / c * 100), 100);
      s({
        loaded: i,
        contentLength: c,
        progress: p,
        finished: !1
      }), g.enqueue(m);
    },
    flush() {
      s({
        loaded: i,
        contentLength: c,
        progress: 100,
        finished: !0
      });
    }
  });
  return new Response(o.body?.pipeThrough(f), o).arrayBuffer();
}
const W = "application/javascript", Te = (r, e = {}) => {
  const t = {
    skipSameOrigin: !0,
    useBlob: !0,
    ...e
  };
  return t.skipSameOrigin && new URL(r).origin === self.location.origin ? Promise.resolve(r) : new Promise((n, a) => void fetch(r).then((l) => l.text()).then((l) => {
    new URL(r).href.split("/").pop();
    let o = "";
    if (t.useBlob) {
      const d = new Blob([l], { type: W });
      o = URL.createObjectURL(d);
    } else
      o = `data:${W},` + encodeURIComponent(l);
    n(o);
  }).catch(a));
};
function ve(r, e) {
  const t = e[r.fileType][r.variant];
  if (typeof t == "number")
    return t;
  if (r.buildType === void 0)
    throw new Error("buildType is required when size manifest entry is build-aware");
  return t[r.buildType];
}
function Ne() {
  const r = self.navigator.userAgent.toLowerCase();
  return /iphone|ipad|ipod/.test(r);
}
function xe(r) {
  return {
    licenseId: r.licenseId,
    licensee: r.licensee,
    applicationIds: r.applicationIds,
    packageName: r.packageName,
    platform: "Browser",
    sdkName: r.sdkName,
    sdkVersion: r.sdkVersion
  };
}
async function F(r, e = "https://baltazar.microblink.com/api/v2/status/check") {
  if (!e || typeof e != "string")
    throw new Error("Invalid baltazarUrl: must be a non-empty string");
  try {
    new URL(e);
  } catch {
    throw new Error(`Invalid baltazarUrl format: ${e}`);
  }
  try {
    const t = await fetch(e, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      cache: "no-cache",
      body: JSON.stringify(xe(r))
    });
    if (!t.ok)
      throw new Error(`Server returned error: ${t.status} ${t.statusText}`);
    return await t.text();
  } catch (t) {
    throw console.error("Server permission request failed:", t), t;
  }
}
function D(r) {
  return Math.ceil(r * 1024 * 1024 / 64 / 1024);
}
class v extends Error {
  code;
  url;
  constructor(e, t, n) {
    super(`Proxy URL validation failed for "${n}": ${t}`), this.code = e, this.url = n, this.name = "ProxyUrlValidationError";
  }
}
function Le(r) {
  const e = r.unlockResult === "requires-server-permission", { allowPingProxy: t, allowBaltazarProxy: n, hasPing: a } = r;
  if (!t && !n)
    throw new Error("Microblink proxy URL is set but your license doesn't permit proxy usage. Check your license.");
  if (!e && !a)
    throw new Error("Microblink proxy URL is set but your license doesn't permit proxy usage. Check your license.");
  if (!e && a && n && !t || e && !a && !n && t)
    throw new Error("Microblink proxy URL is set but your license doesn't permit proxy usage. Check your license.");
}
function Ce(r) {
  let e;
  try {
    e = new URL(r);
  } catch {
    throw new v("INVALID_PROXY_URL", `Failed to create URL instance for provided Microblink proxy URL "${r}". Expected format: https://your-proxy.com or https://your-proxy.com/`, r);
  }
  if (e.protocol !== "https:")
    throw new v("HTTPS_REQUIRED", `Proxy URL validation failed for "${r}": HTTPS protocol must be used. Expected format: https://your-proxy.com or https://your-proxy.com/`, r);
  const t = e.origin;
  try {
    const n = new URL(`${e.pathname}${e.pathname.endsWith("/") ? "" : "/"}api/v2/status/check`, t).toString();
    return {
      ping: t + e.pathname.replace(/\/$/, ""),
      baltazar: n
    };
  } catch {
    throw new v("INVALID_PROXY_URL", "Failed to build baltazar service URL", r);
  }
}
function Me(r, e) {
  const t = !!r, n = e.unlockResult === "requires-server-permission";
  return {
    pingProxyEnabled: t && e.allowPingProxy && e.hasPing,
    baltazarProxyEnabled: n && t && e.allowBaltazarProxy
  };
}
class Ae extends Error {
  code = "SERVER_PERMISSION_ERROR";
  constructor(e) {
    super(e), this.name = "ServerPermissionError";
  }
}
class Ie extends Error {
  code = "LICENSE_ERROR";
  constructor(e) {
    super(e), this.name = "LicenseError";
  }
}
function Ue({ workerScope: r, getSessionNumber: e, onError: t }) {
  const n = r ?? self, a = e ?? (() => 0);
  let l = !1;
  const s = (c, i) => {
    if (!l) {
      l = !0;
      try {
        t({
          origin: c,
          error: i,
          sessionNumber: a()
        });
      } finally {
        l = !1;
      }
    }
  }, o = (c) => {
    const i = c;
    s("worker.onerror", i.error ?? i.message ?? "Unknown worker error");
  }, d = (c) => {
    s("worker.unhandledrejection", c.reason ?? "Unhandled worker rejection");
  };
  return n.addEventListener("error", o), n.addEventListener("unhandledrejection", d), () => {
    n.removeEventListener("error", o), n.removeEventListener("unhandledrejection", d);
  };
}
function Oe(r, e) {
  return {
    ...e,
    redactBarcode: e.redactBarcode ?? r.redactBarcode,
    redactMrz: e.redactMrz ?? r.redactMrz,
    fields: e.fields ?? r.fields,
    mode: e.mode ?? r.mode
  };
}
const K = "FrameTransferError", Be = {
  fields: [],
  mode: "full-result",
  redactBarcode: !1,
  redactMrz: !1
}, ze = (r, e) => {
  const t = e instanceof Error && e.message ? `: ${e.message}` : "", n = new Error(
    `${r}${t}`,
    e instanceof Error ? { cause: e } : void 0
  );
  return n.name = K, n;
};
class We {
  /**
   * The Wasm module.
   */
  #e;
  /**
   * Active scanning session created by this worker.
   */
  #t;
  /**
   * The default session settings.
   *
   * Must be initialized when calling initBlinkId.
   */
  #d;
  /**
   * The progress status callback.
   */
  progressStatusCallback;
  /**
   * Whether the demo overlay is shown.
   */
  #a = !0;
  /**
   * Whether the production overlay is shown.
   */
  #i = !0;
  /**
   * The current session number.
   */
  #r = 0;
  /**
   * Sanitized proxy URLs for Microblink services.
   */
  #s;
  #o;
  #n;
  constructor() {
    this.#n = Ue({
      getSessionNumber: () => this.#r,
      onError: ({ error: e, sessionNumber: t }) => {
        this.#e && (this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: t,
          data: {
            errorType: "Crash",
            errorMessage: e instanceof Error ? e.message : String(e),
            stackTrace: e instanceof Error ? e.stack : void 0
          }
        }), this.sendPinglets());
      }
    });
  }
  /**
   * This method loads the Wasm module.
   */
  async #c({
    resourceUrl: e,
    wasmVariant: t,
    featureVariant: n,
    initialMemory: a
  }) {
    if (this.#e) {
      console.log("Wasm already loaded");
      return;
    }
    const l = "BlinkIdModule", s = P(
      e,
      n,
      t
    ), o = P(s, `${l}.js`), d = P(s, `${l}.wasm`), c = P(s, `${l}.data`), i = await Te(o), h = (await import(
      /* @vite-ignore */
      i
    )).default;
    a || (a = Ne() ? 700 : 200);
    const m = new WebAssembly.Memory({
      initial: D(a),
      maximum: D(2048),
      shared: t === "advanced-threads"
    });
    let g, p, C = 0;
    const Y = 32, M = () => {
      if (!this.progressStatusCallback || !g || !p)
        return;
      const u = g.finished && p.finished, I = g.loaded + p.loaded, U = g.contentLength + p.contentLength, ee = u ? 100 : Math.min(Math.round(I / U * 100), 100), O = performance.now();
      O - C < Y || (C = O, this.progressStatusCallback({
        loaded: I,
        contentLength: U,
        progress: ee,
        finished: u
      }));
    }, X = (u) => {
      g = u, M();
    }, J = (u) => {
      p = u, M();
    }, A = (u) => ve({ ...u, buildType: n }, Re), [Q, Z] = await Promise.all([
      z(
        {
          url: d,
          fileType: "wasm",
          variant: t,
          buildType: n,
          progressCallback: X
        },
        A
      ),
      z(
        {
          url: c,
          fileType: "data",
          variant: t,
          buildType: n,
          progressCallback: J
        },
        A
      )
    ]);
    if (this.progressStatusCallback && g && p) {
      const u = g.contentLength + p.contentLength;
      this.progressStatusCallback({
        loaded: u,
        contentLength: u,
        progress: 100,
        finished: !0
      });
    }
    if (this.#e = await h({
      locateFile: (u) => `${s}/${t}/${u}`,
      onAbort: (u) => {
        this.#e && (this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: this.#r,
          data: {
            errorType: "Crash",
            errorMessage: u instanceof Error ? u.message : String(u),
            stackTrace: u instanceof Error ? u.stack : void 0
          }
        }), this.sendPinglets());
      },
      printErr: (u) => {
        if (console.error(u), /\babort(ed)?\b/i.test(u)) {
          if (!this.#e)
            return;
          this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "Crash",
              errorMessage: String(u),
              stackTrace: void 0
            }
          }), this.sendPinglets();
        }
      },
      // pthreads build breaks without this:
      // "Failed to execute 'createObjectURL' on 'URL': Overload resolution failed."
      mainScriptUrlOrBlob: i,
      wasmBinary: Q,
      getPreloadedPackage() {
        return Z;
      },
      wasmMemory: m,
      noExitRuntime: !0
    }), !this.#e)
      throw new Error("Failed to load Wasm module");
  }
  reportPinglet(e) {
    if (!this.#e)
      throw new Error("Cannot report pinglet: Wasm module not loaded");
    try {
      this.#e.queuePinglet(
        JSON.stringify(e.data),
        e.schemaName,
        e.schemaVersion,
        e.sessionNumber ?? this.#r
      );
    } catch (t) {
      console.warn("Failed to queue pinglet:", t, e);
    }
  }
  sendPinglets() {
    if (!this.#e)
      throw new Error("Cannot send pinglets: Wasm module not loaded");
    try {
      this.#e.sendPinglets();
    } catch (e) {
      console.warn("Failed to send pinglets:", e);
    }
  }
  /**
   * This method initializes everything.
   */
  async initBlinkId(e, t) {
    const n = new URL(
      "resources/",
      e.resourcesLocation
    ).toString();
    this.progressStatusCallback = t, this.#o = e.userId;
    const a = e.wasmVariant ?? await Ee(), l = e.useLightweightBuild ? "lightweight" : "full";
    if (await this.#c({
      resourceUrl: n,
      wasmVariant: a,
      featureVariant: l,
      initialMemory: e.initialMemory
    }), !this.#e)
      throw new Error("Wasm module not loaded");
    const s = this.#e.initializeWithLicenseKey(
      e.licenseKey,
      e.userId,
      !1
    );
    if (this.reportPinglet({
      schemaName: "ping.sdk.init.start",
      schemaVersion: "1.3.0",
      sessionNumber: 0,
      data: {
        packageName: self.location.hostname,
        platform: "Emscripten",
        platformDetails: `${l}-${a}`,
        product: "BlinkID",
        userId: this.#o,
        ...Me(
          e.microblinkProxyUrl,
          s
        )
      }
    }), s.licenseError)
      throw new Ie(
        "License unlock error: " + s.licenseError
      );
    if (e.microblinkProxyUrl && (Le(s), this.#s = Ce(e.microblinkProxyUrl), s.allowPingProxy && s.hasPing && (this.#e.setPingProxyUrl(this.#s.ping), console.debug(`Using ping proxy URL: ${this.#s.ping}`))), s.unlockResult === "requires-server-permission") {
      const d = this.#s?.baltazar && s.allowBaltazarProxy ? this.#s?.baltazar : void 0;
      d && console.debug(`Using Baltazar proxy URL: ${d}`);
      const c = d ? await F(s, d) : await F(s), i = this.#e.submitServerPermission(
        c
      );
      if (i?.error)
        throw new Ae(
          "Server unlock error: " + i.error
        );
    }
    try {
      console.debug(`BlinkID SDK ${s.sdkVersion} unlocked`), this.#a = s.showDemoOverlay, this.#i = s.showProductionOverlay, this.#e.initializeSdk(e.userId);
    } catch (o) {
      throw console.warn("Failed to initialize BlinkID SDK:", o), this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: 0,
        data: {
          errorType: "Crash",
          errorMessage: o instanceof Error ? o.message : String(o),
          stackTrace: o instanceof Error ? o.stack : void 0
        }
      }), this.sendPinglets(), o;
    }
  }
  /**
   * This method creates a BlinkID scanning session.
   *
   * @param sessionSettings - The options for the session.
   * @returns The session.
   */
  createScanningSession(e, t) {
    if (!this.#e)
      throw new Error("Wasm module not loaded");
    try {
      const n = this.#e.createScanningSession(
        e ?? {},
        this.#o
      );
      return this.#r++, this.sendPinglets(), this.#l(
        n,
        t?.redactionSettingsResolver
      );
    } catch (n) {
      throw this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: this.#r,
        data: {
          errorType: "Crash",
          errorMessage: n instanceof Error ? n.message : String(n),
          stackTrace: n instanceof Error ? n.stack : void 0
        }
      }), this.sendPinglets(), n;
    }
  }
  getDefaultRedactionSettings(e) {
    if (!this.#e)
      throw new Error("Wasm module not loaded");
    try {
      return this.#e.getDefaultRedactionSettings(e);
    } catch (t) {
      throw console.warn("Failed to get default redaction settings:", t), this.reportPinglet({
        schemaName: "ping.error",
        schemaVersion: "1.0.0",
        sessionNumber: this.#r,
        data: {
          errorType: "NonFatal",
          errorMessage: t instanceof Error ? t.message : String(t)
        }
      }), this.sendPinglets(), new Error("Failed to get default redaction settings", {
        cause: t
      });
    }
  }
  /**
   * This method creates a proxy session.
   *
   * @param session - The session.
   * @returns The proxy session.
   */
  #l(e, t) {
    this.#t = e;
    let n = null, a = null;
    return x({
      getResult: async () => {
        try {
          if (!t || !n)
            return e.getResult();
          const o = await t(
            n,
            x((d) => Promise.resolve(
              this.getDefaultRedactionSettings({
                country: d.country,
                region: d.region,
                type: d.type,
                countryName: "",
                isoAlpha2CountryCode: "",
                isoAlpha3CountryCode: "",
                isoNumericCountryCode: ""
              })
            ))
          );
          return o ? e.getResult(
            Oe(
              Be,
              o
            )
          ) : e.getResult();
        } catch (s) {
          throw this.#e && (this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: s instanceof Error ? s.message : String(s),
              stackTrace: s instanceof Error ? s.stack : void 0
            }
          }), this.sendPinglets()), s;
        }
      },
      process: (s) => {
        try {
          const o = e.process(s);
          "error" in o ? this.#e && (this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: String(o.error),
              stackTrace: void 0
            }
          }), this.sendPinglets()) : (o.inputImageAnalysisResult.documentClassInfo.type && (n = o.inputImageAnalysisResult.documentClassInfo), o.inputImageAnalysisResult.documentRotation !== "not-available" && (a = o.inputImageAnalysisResult.documentRotation), n && n?.type !== o.inputImageAnalysisResult.documentClassInfo.type && (o.inputImageAnalysisResult.documentClassInfo = n), a && a !== o.inputImageAnalysisResult.documentRotation && (o.inputImageAnalysisResult.documentRotation = a));
          let d;
          try {
            d = G(
              {
                ...o,
                arrayBuffer: s.data.buffer
              },
              [s.data.buffer]
            );
          } catch (c) {
            const i = ze(
              "Failed to transfer frame from worker",
              c
            );
            throw this.#e && (this.reportPinglet({
              schemaName: "ping.error",
              schemaVersion: "1.0.0",
              sessionNumber: this.#r,
              data: {
                errorType: "Crash",
                errorMessage: i.message,
                stackTrace: i.stack
              }
            }), this.sendPinglets()), i;
          }
          return d;
        } catch (o) {
          throw o instanceof Error && o.name === K || !this.#e || (this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: o instanceof Error ? o.message : String(o),
              stackTrace: o instanceof Error ? o.stack : void 0
            }
          }), this.sendPinglets()), o;
        }
      },
      getScanningStatus: () => {
        try {
          return e.getScanningStatus();
        } catch (s) {
          throw this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: s instanceof Error ? s.message : String(s),
              stackTrace: s instanceof Error ? s.stack : void 0
            }
          }), this.sendPinglets(), s;
        }
      },
      ping: (s) => {
        this.reportPinglet({
          ...s,
          sessionNumber: s.sessionNumber ?? this.#r
        });
      },
      sendPinglets: () => this.sendPinglets(),
      getSettings: () => e.getSettings(),
      getResolvedSessionSettings: () => e.getResolvedSessionSettings(),
      getSessionId: () => e.getSessionId(),
      getSessionNumber: () => e.getSessionNumber(),
      resolveCurrentStep: () => {
        try {
          console.debug("BlinkIdWorker: resolveCurrentStep"), e.resolveCurrentStep();
        } catch (s) {
          throw this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: s instanceof Error ? s.message : String(s),
              stackTrace: s instanceof Error ? s.stack : void 0
            }
          }), this.sendPinglets(), s;
        }
      },
      reset: () => {
        try {
          e.reset(), n = null, a = null;
        } catch (s) {
          throw this.#e && (this.reportPinglet({
            schemaName: "ping.error",
            schemaVersion: "1.0.0",
            sessionNumber: this.#r,
            data: {
              errorType: "NonFatal",
              errorMessage: s instanceof Error ? s.message : String(s),
              stackTrace: s instanceof Error ? s.stack : void 0
            }
          }), this.sendPinglets()), s;
        }
      },
      delete: () => {
        e.isDeleted() || e.delete(), this.#t === e && (this.#t = void 0);
      },
      deleteLater: () => {
        e.isDeleted() || e.deleteLater(), this.#t === e && (this.#t = void 0);
      },
      isDeleted: () => e.isDeleted(),
      isAliasOf: (s) => e.isAliasOf(s),
      showDemoOverlay: () => this.#a,
      showProductionOverlay: () => this.#i
    });
  }
  /**
   * This method is called when the worker is terminated.
   */
  [E]() {
  }
  /**
   * Terminates the workers and the Wasm runtime.
   */
  async terminate() {
    if (self.setTimeout(() => self.close, 5e3), this.#t)
      try {
        this.#t.isDeleted() || (console.debug("Deleting BlinkId session during terminate"), this.#t.delete());
      } catch (n) {
        if (console.warn(
          "Failed to delete BlinkId session during terminate:",
          n
        ), !this.#e)
          return;
        this.reportPinglet({
          schemaName: "ping.error",
          schemaVersion: "1.0.0",
          sessionNumber: this.#r,
          data: {
            errorType: "NonFatal",
            errorMessage: n instanceof Error ? n.message : String(n),
            stackTrace: n instanceof Error ? n.stack : void 0
          }
        }), this.sendPinglets();
      } finally {
        this.#t = void 0;
      }
    if (!this.#e) {
      this.#n?.(), this.#n = void 0, console.warn(
        "No Wasm module loaded during worker termination. Skipping cleanup."
      ), self.close();
      return;
    }
    this.#e.terminateSdk(), await new Promise((n) => setTimeout(n, 0)), this.sendPinglets();
    const t = Date.now();
    for (; this.#e.arePingRequestsInProgress() && Date.now() - t < 5e3; )
      await new Promise((n) => setTimeout(n, 100));
    this.#e = void 0, this.#n?.(), this.#n = void 0, console.debug("BlinkIdWorker terminated 🔴"), self.close();
  }
}
const Fe = new We();
L(Fe);
