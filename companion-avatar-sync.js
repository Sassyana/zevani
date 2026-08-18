/* ZEVANI — persistent selected-companion avatar sync */
(function(){
  'use strict';
  const KEY='zevaniCompanionImage';
  const NAME='zevaniCompanionName';
  function image(){return localStorage.getItem(KEY)||''}
  function name(){return localStorage.getItem(NAME)||'Alex'}
  function paint(el){
    if(!el)return;
    const src=image();
    if(src){
      el.innerHTML='<img src="'+src.replace(/"/g,'&quot;')+'" alt="'+name().replace(/"/g,'&quot;')+'">';
      el.style.backgroundImage='none';
    }else{
      el.textContent=name().charAt(0).toUpperCase();
    }
  }
  function sync(){
    ['zdashAvatar','chatAvatar','profileAvatar'].forEach(id=>paint(document.getElementById(id)));
    const n=name();
    ['zdashName','chatName','profileName'].forEach(id=>{const el=document.getElementById(id);if(el&&id!=='profileName')el.textContent=n});
  }
  window.zevaniSyncCompanionAvatar=sync;
  window.addEventListener('storage',sync);
  document.addEventListener('DOMContentLoaded',function(){sync();setTimeout(sync,250);setTimeout(sync,1000)});
  setInterval(sync,1500);
})();