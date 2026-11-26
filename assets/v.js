/* 林柏霖醫師官網訪客計數 drlin-visit（2026-11-26 凱菲「照這樣做」；收數端點＝go-worker /v，表格見 go-worker/visits_schema.sql）
   算一次的條件：在 drlinheart.tw，這頁看得見的時間累計 5 秒以上，而且有滑動或點擊（含觸控、滾輪、鍵盤）。
   不算：審稿頁（/review-）、粉專素材頁（/pack/）；看過審稿頁或開過 #dl-self 連結的瀏覽器（自己人）；自動化程式（navigator.webdriver、無頭瀏覽器、爬蟲）。
   不寫 cookie、不記 IP：只送「哪一頁、從哪裡來、手機或電腦、是不是這次造訪第一個算數的頁」，日期由伺服器記。
   自己人標記存在這個瀏覽器的 localStorage（dl_self），不會送出去；這次造訪的來源存 sessionStorage（關掉分頁就消失）。
   掛號、粉專連結（go-worker /go/）：自己人與自動化程式點的，網址加 x=1，轉址後台就不計（同一套排除）。 */
(function () {
  try {
    var L = location, S = document.currentScript, EP = S && S.getAttribute("data-ep");
    if (L.hostname !== "drlinheart.tw" || !EP) return;
    var path = L.pathname === "/" ? "/index.html" : L.pathname;
    var hidden = /^\/(review-|pack\/)/.test(path);          // 審稿頁、粉專素材頁：不算
    var self = false;
    try {
      if (/^\/review-/.test(path) || L.hash === "#dl-self") localStorage.setItem("dl_self", "1");   // 看過審稿頁＝自己人
      self = localStorage.getItem("dl_self") === "1";
    } catch (e) {}
    if (L.hash === "#dl-self") try { history.replaceState(null, "", L.pathname + L.search); } catch (e) {}
    var ua = navigator.userAgent || "";
    var bot = navigator.webdriver === true || /bot|crawl|spider|slurp|headless|lighthouse|pagespeed|prerender|playwright|puppeteer|selenium|phantomjs|preview/i.test(ua);
    if (hidden || self || bot) {
      var base = EP.replace(/\/v$/, "/go/"), go = document.querySelectorAll("a[href]");
      for (var i = 0; i < go.length; i++) {
        var h = go[i].href;
        if (h.indexOf(base) === 0 && !/[?&]x=1(&|$)/.test(h)) go[i].href = h + (h.indexOf("?") < 0 ? "?" : "&") + "x=1";
      }
      return;
    }
    // 從哪裡來
    var ref = document.referrer || "", rh = "";
    try { rh = ref ? new URL(ref).hostname.toLowerCase() : ""; } catch (e) {}
    var qs = L.search.toLowerCase(), utm = (qs.match(/[?&]utm_source=([^&]*)/) || [])[1] || "", cat;
    if (/(^|\.)(chatgpt\.com|openai\.com|perplexity\.ai|claude\.ai|poe\.com|you\.com|phind\.com|deepseek\.com|grok\.com|meta\.ai|mistral\.ai|kimi\.com|felo\.ai)$/.test(rh) ||
        rh === "gemini.google.com" || rh === "copilot.microsoft.com" || rh === "edgeservices.bing.com" || /chatgpt|openai|perplexity|gemini|copilot|claude|deepseek|grok/.test(utm)) cat = "ai";
    else if (rh === "drlinheart.tw" || rh === "www.drlinheart.tw") cat = "";            // 站內換頁：沿用這次造訪的來源
    else if (/(^|\.)google\.[a-z.]+$/.test(rh)) cat = "google";
    else if (/(^|\.)bing\.com$/.test(rh)) cat = "bing";
    else if (/(^|\.)yahoo\.[a-z.]+$/.test(rh)) cat = "yahoo";
    else if (/(^|\.)(facebook\.com|fb\.com|fb\.me|messenger\.com)$/.test(rh) || /[?&]fbclid=/.test(qs)) cat = "facebook";
    else if (/(^|\.)instagram\.com$/.test(rh)) cat = "instagram";
    else if (/(^|\.)threads\.(net|com)$/.test(rh)) cat = "threads";
    else if (/(^|\.)line\.me$/.test(rh)) cat = "line";
    else if (!rh) cat = "direct";
    else cat = "other";
    var src = cat;
    try { if (cat) sessionStorage.setItem("dl_src", cat); else src = sessionStorage.getItem("dl_src") || "direct"; } catch (e) { src = src || "direct"; }
    var dev = /Mobi|Android|iPhone|iPad|iPod/i.test(ua) || (navigator.maxTouchPoints > 1 && /Macintosh/.test(ua)) ? "m" : "d";
    // 停留 5 秒（只算看得見的時間）＋有滑動或點擊
    var acc = 0, since = document.visibilityState === "visible" ? Date.now() : 0, acted = false, sent = false, y0 = window.scrollY || 0, t0 = Date.now(), tm;
    var EV = ["pointerdown", "keydown", "touchstart", "wheel"];
    function seen() { return acc + (since ? Date.now() - since : 0); }
    function entry() {   // 這個分頁這次造訪第一個算數的頁＝1（訪客數算這個），之後換頁＝0
      try { if (sessionStorage.getItem("dl_v") === "1") return 0; sessionStorage.setItem("dl_v", "1"); return 1; } catch (e) { return cat ? 1 : 0; }
    }
    function off() {
      EV.forEach(function (n) { removeEventListener(n, act, true); });
      removeEventListener("scroll", onScroll, true);
      document.removeEventListener("visibilitychange", onVis);
      clearInterval(tm);
    }
    function check() {
      if (sent || !acted || seen() < 5000) return;
      sent = true;
      off();
      var body = JSON.stringify({ p: path, s: src, d: dev, e: entry() });
      try { if (!(navigator.sendBeacon && navigator.sendBeacon(EP, body))) fetch(EP, { method: "POST", body: body, keepalive: true, mode: "no-cors" }); } catch (e) {}
    }
    function act() { acted = true; check(); }
    function onScroll() { if (Date.now() - t0 > 500 && Math.abs((window.scrollY || 0) - y0) > 30) act(); }
    function onVis() {
      if (document.visibilityState === "visible") { if (!since) since = Date.now(); }
      else { if (since) { acc += Date.now() - since; since = 0; } check(); }
    }
    EV.forEach(function (n) { addEventListener(n, act, { capture: true, passive: true }); });
    addEventListener("scroll", onScroll, { capture: true, passive: true });
    document.addEventListener("visibilitychange", onVis);
    addEventListener("pagehide", check);
    tm = setInterval(check, 1000);
  } catch (e) {}
})();
