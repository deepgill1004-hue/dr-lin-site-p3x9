/* 林醫師網站按鍵音效：瀏覽器現場合成短音、沒有音檔。
   2026-11-12 菲菲選 B 毛氈貼紙後上線；2026-11-19 凱菲：「只要有點選就會有聲音」→ 所有可以點的東西都出聲（連結、按鈕、展開列、表單）。
   2026-11-20 凱菲：「我只要單音節就好了，你不要每次都搞成兩個音節」→ 第三輪：每組只有一個音（一個振盪器、不滑音、不疊第二個音），
   點連結、展開、掛號都是同一聲：a 叮（小鈴）、b 啵（泡泡）、c 嗒（輕敲）。前兩輪見 sfx.js.bak-3themes1119、sfx.js.bak-2nd1120。
   預設用 THEME；網址帶 ?sfx=a／b／c 可以切換試聽（記在這台手機的 localStorage）。
   頁面右下 ♪ 開關照舊；手機開「減少動態效果」預設靜音；iPhone 側邊靜音鍵打開時瀏覽器不會出聲。 */
(function(){
  var KEY="drlin-sfx",TKEY="drlin-sfx-theme",THEME="a",ctx=null,out=null;
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var on=(function(){try{var v=localStorage.getItem(KEY);return v===null?!reduce:v==="1"}catch(e){return !reduce}})();
  try{var q=new URLSearchParams(location.search).get("sfx");if(/^[abc]$/.test(q||""))localStorage.setItem(TKEY,q)}catch(e){}
  var theme=(function(){try{var t=localStorage.getItem(TKEY);return /^[abc]$/.test(t||"")?t:THEME}catch(e){return THEME}})();
  function audio(){if(!ctx){var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A();out=ctx.createGain();out.gain.value=.8;out.connect(ctx.destination)}
    if(ctx.state==="suspended")ctx.resume();return ctx}
  function tone(f,d,v,w){var c=audio();if(!c)return;var s=c.currentTime,o=c.createOscillator(),g=c.createGain();
    o.type=w;o.frequency.setValueAtTime(f,s);
    g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.004);g.gain.exponentialRampToValueAtTime(.0001,s+d);
    o.connect(g);g.connect(out);o.start(s);o.stop(s+d+.03)}
  /* 每組一聲：審核包第 11 章「試聽」用同一組數字（report/review_1120/reply_page.py 的 SND_JS） */
  var SETS={a:function(){tone(2093,.12,.10,"triangle")},   /* 叮：亮亮的小鈴 */
            b:function(){tone(1046,.07,.18,"sine")},       /* 啵：圓圓的泡泡 */
            c:function(){tone(1568,.035,.15,"triangle")}}; /* 嗒：很短的輕敲 */
  function play(x,y){var t=SETS[y]?y:(SETS[x]?x:theme);(SETS[t]||SETS[THEME])()}
  window.drlinSfx={play:play,theme:function(){return theme},use:function(t){if(/^[abc]$/.test(t)){theme=t;try{localStorage.setItem(TKEY,t)}catch(e){}}}};
  document.addEventListener("pointerdown",function(e){
    if(!on)return;var el=e.target.closest&&e.target.closest("a,button,summary,label,[role=button],input,select");
    if(!el||el.id==="drlin-snd"||el.hasAttribute("data-nosfx"))return;
    play();
  },true);
  var b=document.createElement("button");b.id="drlin-snd";b.type="button";b.setAttribute("aria-label","按鍵音效開關");
  function paint(){b.textContent=on?"♪":"♪̸";b.style.opacity=on?1:.6}
  b.addEventListener("click",function(){on=!on;try{localStorage.setItem(KEY,on?"1":"0")}catch(e){}paint();if(on)play()});
  paint();document.body.appendChild(b);
})();
