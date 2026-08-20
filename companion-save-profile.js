(function(){
  'use strict';
  const KEY='zevani.savedCompanions';
  const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  const set=v=>localStorage.setItem(KEY,JSON.stringify(v));
  function saved(c){return !!c && get().some(x=>x.id===c.id)}
  function toast(t){let x=document.getElementById('saveToast');if(!x){x=document.createElement('div');x.id='saveToast';x.style='position:fixed;right:20px;bottom:20px;z-index:9999;background:#101a2d;color:#fff;padding:12px 18px;border-radius:22px;box-shadow:0 10px 30px #0003';document.body.appendChild(x)}x.textContent=t;x.style.display='block';clearTimeout(x._t);x._t=setTimeout(()=>x.style.display='none',1800)}
  function updateButton(){const b=document.getElementById('saveCompanionBtn');const c=window.current;if(!b||!c)return;b.textContent=saved(c)?'✓ Saved to My Companions — Click to Remove':'♡ Save to My Companions'}
  function saveCurrent(){const c=window.current;if(!c)return;const list=get();if(saved(c)){set(list.filter(x=>x.id!==c.id));toast('Removed from My Companions')}else{set(list.concat(c));toast('Saved to My Companions')}updateButton();if(typeof window.renderDashboard==='function')window.renderDashboard();}
  function addButton(){const actions=document.querySelector('.modal-actions');if(!actions)return;let b=document.getElementById('saveCompanionBtn');if(!b){b=document.createElement('button');b.id='saveCompanionBtn';b.type='button';b.style='background:#c7a86b;color:#101a2d;border:0';b.onclick=saveCurrent;actions.insertBefore(b,actions.firstChild)}updateButton()}
  function removeChooseButtons(){document.querySelectorAll('button,a').forEach(el=>{const t=(el.textContent||'').replace(/\s+/g,' ').trim().toLowerCase();if(t==='choose companion'||t==='choose this companion'||t.startsWith('choose companion')||t.includes('choose companion')){el.remove()}})}
  function openForPhoto(photo){if(!photo||typeof window.openProfile!=='function')return;const name=photo.closest('.comp-card,.mini,.saved-card')?.querySelector('.comp-name, b, strong')?.textContent?.trim()||photo.getAttribute('alt')||'';const all=Array.isArray(window.C)?window.C:[];const match=all.find(x=>String(x.name||'').trim()===name);if(match)window.openProfile(match.id);else{const card=photo.closest('.comp-card');const button=card?.querySelector('button[onclick*="openProfile"],button[onclick*="profile"]');if(button)button.click()}}
  function makeImagesClickable(){document.querySelectorAll('.comp-photo img,.comp-photo,.mini img,.saved-card img').forEach(el=>{if(el.dataset.zevaniClickable)return;el.dataset.zevaniClickable='1';el.style.cursor='pointer';el.title='View Profile';el.addEventListener('click',e=>{e.preventDefault();e.stopPropagation();openForPhoto(el.classList.contains('comp-photo')?el:el.closest('.comp-photo')||el)})})}
  function refresh(){removeChooseButtons();makeImagesClickable();addButton()}
  const oldOpen=window.openProfile;
  if(typeof oldOpen==='function'&&!oldOpen.__zevaniWrapped){window.openProfile=function(id){oldOpen.call(this,id);setTimeout(refresh,0);setTimeout(refresh,100)};window.openProfile.__zevaniWrapped=true}
  function init(){refresh();const observer=new MutationObserver(()=>refresh());observer.observe(document.body,{childList:true,subtree:true});setInterval(refresh,1500)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.zevaniSaveCompanion=saveCurrent;
})();
