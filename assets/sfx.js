/* 林醫師網站按鍵音效：瀏覽器現場合成短音、沒有音檔。
   2026-11-12 菲菲選 B 毛氈貼紙後上線；2026-11-19 凱菲：「只要有點選就會有聲音」「給我選三個不同的音效」
   → 所有可以點的東西都出聲（連結、按鈕、展開列、表單）；三組音色（11/20 換第二輪）：a 泡泡啵、b 水滴咚、c 音樂盒叮。
   預設用 THEME；網址帶 ?sfx=a／b／c 可以切換試聽（記在這台手機的 localStorage）。選樣頁：pick.html。
   頁面右下 ♪ 開關照舊；手機開「減少動態效果」預設靜音；iPhone 側邊靜音鍵打開時瀏覽器不會出聲。 */
(function(){
  var KEY="drlin-sfx",TKEY="drlin-sfx-theme",THEME="b",ctx=null,out=null;
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var on=(function(){try{var v=localStorage.getItem(KEY);return v===null?!reduce:v==="1"}catch(e){return !reduce}})();
  try{var q=new URLSearchParams(location.search).get("sfx");if(/^[abc]$/.test(q||""))localStorage.setItem(TKEY,q)}catch(e){}
  var theme=(function(){try{var t=localStorage.getItem(TKEY);return /^[abc]$/.test(t||"")?t:THEME}catch(e){return THEME}})();
  function audio(){if(!ctx){var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A();out=ctx.createGain();out.gain.value=.8;out.connect(ctx.destination)}
    if(ctx.state==="suspended")ctx.resume();return ctx}
  function tone(f,d,v,w,t,f2){var c=audio();if(!c)return;var s=c.currentTime+(t||0),o=c.createOscillator(),g=c.createGain();
    o.type=w;o.frequency.setValueAtTime(f,s);if(f2)o.frequency.exponentialRampToValueAtTime(f2,s+d);
    g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.004);g.gain.exponentialRampToValueAtTime(.0001,s+d);
    o.connect(g);g.connect(out);o.start(s);o.stop(s+d+.03)}
  /* 2026-11-20 凱菲：「這三個音效我都不喜歡，不夠清脆可愛，再給我其他選擇」→ 換成更短、更亮的三組（舊三組見 sfx.js.bak-3themes1119） */
  var SETS={
    a:{tap:function(){tone(900,.045,.16,"sine",0,1900)},                                              /* 泡泡啵：很短、往上彈 */
       open:function(){tone(700,.05,.15,"sine",0,1500)},
       reg:function(){tone(900,.045,.15,"sine",0,1900);tone(1200,.05,.14,"sine",.07,2400)}},
    b:{tap:function(){tone(1700,.08,.15,"sine",0,620);tone(2600,.02,.05,"sine")},                     /* 水滴咚：清亮的一滴 */
       open:function(){tone(1400,.09,.14,"sine",0,560)},
       reg:function(){tone(1500,.08,.14,"sine",0,600);tone(2100,.09,.13,"sine",.09,800)}},
    c:{tap:function(){tone(2349,.16,.09,"triangle");tone(4699,.08,.03,"sine")},                       /* 音樂盒叮：亮、可愛的小鈴 */
       open:function(){tone(1976,.16,.08,"triangle");tone(3951,.08,.03,"sine")},
       reg:function(){tone(2093,.14,.09,"triangle");tone(3136,.20,.08,"triangle",.10);tone(6272,.06,.02,"sine",.10)}}};
  function play(kind,t){var S=SETS[t||theme]||SETS[THEME];(S[kind]||S.tap)()}
  window.drlinSfx={play:play,theme:function(){return theme},use:function(t){if(/^[abc]$/.test(t)){theme=t;try{localStorage.setItem(TKEY,t)}catch(e){}}}};
  document.addEventListener("pointerdown",function(e){
    if(!on)return;var el=e.target.closest&&e.target.closest("a,button,summary,label,[role=button],input,select");
    if(!el||el.id==="drlin-snd"||el.hasAttribute("data-nosfx"))return;
    if(el.matches("a.reg,.fab-reg")||/掛號/.test(el.textContent))play("reg");
    else if(el.matches("summary"))play("open");
    else play("tap");
  },true);
  var b=document.createElement("button");b.id="drlin-snd";b.type="button";b.setAttribute("aria-label","按鍵音效開關");
  function paint(){b.textContent=on?"♪":"♪̸";b.style.opacity=on?1:.6}
  b.addEventListener("click",function(){on=!on;try{localStorage.setItem(KEY,on?"1":"0")}catch(e){}paint();if(on)play("tap")});
  paint();document.body.appendChild(b);
})();
