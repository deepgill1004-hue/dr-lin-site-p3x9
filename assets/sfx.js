/* 林醫師網站按鍵音效（2026-11-12 菲菲選 B 毛氈貼紙後上線）：瀏覽器現場合成短音、沒有音檔；只在按鈕／選單／分頁籤出聲，文章內文連結不出聲。
   頁首加 ♪ 開關（記在 localStorage）；手機開「減少動態效果」預設靜音。 */
(function(){
  var KEY="drlin-sfx",ctx=null,out=null;
  var reduce=window.matchMedia&&matchMedia("(prefers-reduced-motion: reduce)").matches;
  var on=(function(){try{var v=localStorage.getItem(KEY);return v===null?!reduce:v==="1"}catch(e){return !reduce}})();
  function audio(){if(!ctx){var A=window.AudioContext||window.webkitAudioContext;if(!A)return null;ctx=new A();out=ctx.createGain();out.gain.value=.8;out.connect(ctx.destination)}
    if(ctx.state==="suspended")ctx.resume();return ctx}
  function tone(f,d,v,w,t,f2){var c=audio();if(!c)return;var s=c.currentTime+(t||0),o=c.createOscillator(),g=c.createGain();
    o.type=w;o.frequency.setValueAtTime(f,s);if(f2)o.frequency.exponentialRampToValueAtTime(f2,s+d);
    g.gain.setValueAtTime(.0001,s);g.gain.exponentialRampToValueAtTime(v,s+.004);g.gain.exponentialRampToValueAtTime(.0001,s+d);
    o.connect(g);g.connect(out);o.start(s);o.stop(s+d+.03)}
  var SFX={tap:function(){tone(1046,.04,.10,"triangle")},pop:function(){tone(500,.10,.14,"sine",0,820)},
    reg:function(){tone(587,.10,.10,"triangle");tone(880,.14,.09,"triangle",.07)},back:function(){tone(620,.09,.09,"sine",0,400)},
    open:function(){tone(420,.09,.11,"sine",0,640)}};
  document.addEventListener("pointerdown",function(e){
    if(!on)return;var el=e.target.closest&&e.target.closest(".btn,a.reg,.chips a,.nav a,.dock a,.menu summary,.menu-panel a,.jcard,.crumb a,button,[role=button]");
    if(!el||el.id==="drlin-snd"||el.closest(".post .body,.post article p"))return;
    if(el.matches("a.reg")||/掛號/.test(el.textContent))SFX.reg();
    else if(el.matches(".menu summary"))SFX.open();
    else if(el.matches(".chips a,.jcard"))SFX.pop();
    else if(/←|回上一頁|返回/.test(el.textContent))SFX.back();
    else SFX.tap();
  },true);
  var b=document.createElement("button");b.id="drlin-snd";b.type="button";b.setAttribute("aria-label","按鍵音效開關");
  function paint(){b.textContent=on?"♪":"♪̸";b.style.opacity=on?1:.6}
  b.addEventListener("click",function(){on=!on;try{localStorage.setItem(KEY,on?"1":"0")}catch(e){}paint();if(on)SFX.pop()});
  paint();document.body.appendChild(b);
})();
