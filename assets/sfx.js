/* 林醫師網站按鍵音效：瀏覽器現場合成短音、沒有音檔。
   2026-11-12 菲菲選 B 毛氈貼紙後上線；2026-11-19 凱菲：「只要有點選就會有聲音」「給我選三個不同的音效」
   → 所有可以點的東西都出聲（連結、按鈕、展開列、表單）；三組音色：a 木琴輕敲、b 毛氈泡泡、c 清脆鈴聲。
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
  var SETS={
    a:{tap:function(){tone(784,.07,.14,"triangle");tone(1568,.045,.05,"sine")},                      /* 木琴輕敲：短、木頭感 */
       open:function(){tone(523,.08,.12,"triangle");tone(784,.08,.10,"triangle",.05)},
       reg:function(){tone(659,.08,.13,"triangle");tone(988,.12,.11,"triangle",.08)}},
    b:{tap:function(){tone(420,.09,.15,"sine",0,700)},                                                /* 毛氈泡泡：軟、往上彈 */
       open:function(){tone(360,.10,.13,"sine",0,560)},
       reg:function(){tone(440,.10,.14,"sine",0,660);tone(660,.12,.12,"sine",.08,990)}},
    c:{tap:function(){tone(1760,.22,.06,"sine");tone(2637,.16,.03,"sine")},                           /* 清脆鈴聲：亮、尾音長一點 */
       open:function(){tone(1568,.20,.06,"sine");tone(2093,.18,.04,"sine",.04)},
       reg:function(){tone(1319,.25,.07,"sine");tone(1976,.30,.06,"sine",.09)}}};
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
