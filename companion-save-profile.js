(function(){
  'use strict';
  const KEY='zevani.savedCompanions';
  const get=()=>{try{return JSON.parse(localStorage.getItem(KEY)||'[]')}catch{return[]}};
  const set=v=>localStorage.setItem(KEY,JSON.stringify(v));
  const esc=s=>String(s??'').replace(/[&<>"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m]));
  function saved(c){return get().some(x=>x.id===c.id)}
  function saveCurrent(){
    if(!window.current)return;
    const c=window.current;
    const list=get();
    if(saved(c)) set(list.filter(x=>x.id!==c.id)); else set(list.concat(c));
    updateButton();
    if(typeof window.renderDashboard==='function') window.renderDashboard();
    toast(saved(c)?'Saved to My Companions':'Removed from My Companions');
  }
  function toast(t){let x=document.getElementById('saveToast');if(!x){x=document.createElement('div');x.id='saveToast';x.style='position:fixed;right:20px;bottom:20px;z-index:9999;background:#101a2d;color:#fff;padding:12px 18px;border-radius:22px;box-shadow:0 10px 30px #0003';document.body.appendChild(x)}x.textContent=t;x.style.display='block';clearTimeout(x._t);x._t=setTimeout(()=>x.style.display='none',1800)}
  function updateButton(){const old=document.getElementById('saveCompanionBtn');if(!old)return;const c=window.current;old.textContent=saved(c)?'✓ Saved to My Companions — Click to Remove':'♡ Save to My Companions';}
  function addButton(){const actions=document.querySelector('.modal-actions');if(!actions||document.getElementById('saveCompanionBtn'))return;const b=document.createElement('button');b.id='saveCompanionBtn';b.type='button';b.style='background:#c7a86b;color:#101a2d;border:0';b.textContent='♡ Save to My Companions';b.onclick=saveCurrent;actions.insertBefore(b,actions.firstChild);}
  function hideOldChoose(){document.querySelectorAll('button,a').forEach(el=>{const t=(el.textContent||'').trim().toLowerCase();if(t==='choose companion'||t==='choose this companion'||t.includes('choose companion'))el.remove()})}
  function makePhotosClickable(){document.querySelectorAll('.comp-photo').forEach(photo=>{if(photo.dataset.saveProfileBound)return;photo.dataset.saveProfileBound='1';photo.style.cursor='pointer';photo.title='View Profile';photo.addEventListener('click',()=>{const img=photo.querySelector('img');const name=photo.querySelector('.comp-name')?.textContent?.trim();const all=window.C||[];const c=all.find(x=>x.name===name);if(c&&typeof window.openProfile==='function')window.openProfile(c.id)})})}
  const oldOpen=window.openProfile;
  if(typeof oldOpen==='function')window.openProfile=function(id){oldOpen(id);setTimeout(()=>{addButton();updateButton()},0)};
  function init(){addButton();hideOldChoose();makePhotosClickable();setTimeout(()=>{addButton();hideOldChoose();makePhotosClickable()},400);setTimeout(()=>{addButton();hideOldChoose();makePhotosClickable()},1200)}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
  window.zevaniSaveCompanion=saveCurrent;
})();
