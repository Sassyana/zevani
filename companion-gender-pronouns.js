/* ZEVANI — gender identity + pronouns */
(function(){
'use strict';
const profiles={
 alex:{gender:'Man',pronouns:'he/him'},
 marcus:{gender:'Man',pronouns:'he/him'},
 noah:{gender:'Man',pronouns:'he/him'},
 daniel:{gender:'Man',pronouns:'he/him'},
 luca:{gender:'Man',pronouns:'he/him'},
 sofia:{gender:'Woman',pronouns:'she/her'},
 maya:{gender:'Woman',pronouns:'she/her'},
 emma:{gender:'Woman',pronouns:'she/her'},
 ryan:{gender:'Man',pronouns:'he/him'},
 chloe:{gender:'Woman',pronouns:'she/her'},
 elena:{gender:'Woman',pronouns:'she/her'},
 claire:{gender:'Woman',pronouns:'she/her'},
 lily:{gender:'Woman',pronouns:'she/her'},
 damien:{gender:'Man',pronouns:'he/him'},
 aria:{gender:'Woman',pronouns:'she/her'},
 kael:{gender:'Man',pronouns:'he/him'},
 lyria:{gender:'Woman',pronouns:'she/her'},
 darian:{gender:'Man',pronouns:'he/him'},
 elara:{gender:'Woman',pronouns:'she/her'}
};
/* Keep one existing companion intentionally non-binary so the library demonstrates the full range. */
profiles.lyria={gender:'Non-binary',pronouns:'they/them'};
function applyData(){
 const list=window.zevaniCompanions||[];
 list.forEach(c=>{const p=profiles[c.id];if(p){c.genderIdentity=p.gender;c.pronouns=p.pronouns;c.gender=p.gender==='Man'?'Men':p.gender==='Woman'?'Women':p.gender;}});
}
function injectBuilderFields(){
 const p=document.getElementById('companionPersonality');
 if(!p||document.getElementById('genderPronounFields'))return;
 const box=document.createElement('div');box.id='genderPronounFields';box.className='zgp-fields';
 box.innerHTML='<div class="zgp-title">Identity</div><div class="zgp-grid"><label>Gender<select id="companionGender" class="input"><option value="Woman">Woman</option><option value="Man">Man</option><option value="Non-binary">Non-binary</option><option value="Gender-fluid">Gender-fluid</option><option value="Other">Other</option><option value="Prefer not to specify">Prefer not to specify</option></select></label><label>Pronouns<select id="companionPronouns" class="input"><option value="she/her">She / her</option><option value="he/him">He / him</option><option value="they/them">They / them</option><option value="custom">Other / custom</option><option value="Prefer not to specify">Prefer not to specify</option></select></label></div><input id="customPronouns" class="input hidden" placeholder="Enter pronouns, e.g. ze/zir"><div class="zgp-note">Gender identity and pronouns are separate. Choose what fits your companion.</div>';
 p.parentNode.insertBefore(box,p);
 const pr=document.getElementById('companionPronouns');pr.addEventListener('change',()=>document.getElementById('customPronouns').classList.toggle('hidden',pr.value!=='custom'));
}
function saveBuilderIdentity(){
 const c=window.zevaniCompanions&&window.zevaniCompanions.find(x=>x.name===localStorage.getItem('zevaniCompanionName'));
 if(!c)return;
 const g=document.getElementById('companionGender'),p=document.getElementById('companionPronouns'),custom=document.getElementById('customPronouns');
 const gender=g?.value||c.genderIdentity||'Prefer not to specify';
 const pronouns=p?.value==='custom'?(custom?.value.trim()||'custom'):p?.value||(c.pronouns||'Prefer not to specify');
 localStorage.setItem('zevaniCompanionGender',gender);localStorage.setItem('zevaniCompanionPronouns',pronouns);
}
function addLibraryIdentity(){
 const cards=document.querySelectorAll('#zlGrid .zl-card');
 const list=window.zevaniCompanions||[];
 cards.forEach(card=>{const name=card.querySelector('h3')?.textContent?.trim();const c=list.find(x=>x.name===name);if(!c)return;const body=card.querySelector('.zl-body');if(body&&!body.querySelector('.zgp-card-meta')){const d=document.createElement('div');d.className='zgp-card-meta';d.textContent=c.genderIdentity+' · '+c.pronouns;const title=body.querySelector('h3');if(title)title.insertAdjacentElement('afterend',d);}});
 const toolbar=document.querySelector('#zevaniLibrary .zl-toolbar');
 if(toolbar&&!toolbar.querySelector('[data-zgp-filter]')){
  const filters=[['Non-binary','Non-binary'],['Gender-fluid','Gender-fluid'],['Other','Other']];
  filters.forEach(([value,label])=>{const b=document.createElement('button');b.className='zl-filter';b.dataset.zgpFilter=value;b.textContent=label;b.onclick=function(){document.querySelectorAll('#zevaniLibrary .zl-filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');cards.forEach(card=>{const name=card.querySelector('h3')?.textContent?.trim();const c=list.find(x=>x.name===name);card.style.display=c&&c.genderIdentity===value?'':'none';});};toolbar.appendChild(b);});
 }
 const modal=document.getElementById('zlModal');
 if(modal&&!modal.dataset.zgpBound){modal.dataset.zgpBound='1';const observer=new MutationObserver(()=>{const name=document.getElementById('zlModalName')?.textContent?.trim();const c=list.find(x=>x.name===name);if(!c)return;const meta=document.getElementById('zlModalMeta');if(meta)meta.textContent=c.age+' · '+c.genderIdentity+' · '+c.pronouns+' · '+c.category+' · '+c.type;});observer.observe(modal,{subtree:true,childList:true,characterData:true});}
}
function addStyles(){if(document.getElementById('zgpStyle'))return;const s=document.createElement('style');s.id='zgpStyle';s.textContent='.zgp-fields{margin:20px 0;padding:18px;border:1px solid var(--border,#e4dfd5);border-radius:16px;background:#fbf8f0}.zgp-title{font-weight:700;color:#101a2d;margin-bottom:12px}.zgp-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.zgp-grid label{font-size:12px;font-weight:700;color:#59616e}.zgp-grid .input{margin-top:6px}.zgp-note{font-size:11px;color:#707887;margin-top:8px}.zgp-card-meta{font-size:11px;color:#707887;margin:4px 0 10px}.hidden{display:none!important}@media(max-width:600px){.zgp-grid{grid-template-columns:1fr}}';document.head.appendChild(s)}
function init(){applyData();addStyles();injectBuilderFields();setTimeout(addLibraryIdentity,50);setTimeout(addLibraryIdentity,500);setTimeout(addLibraryIdentity,1200);const save=document.getElementById('saveCompanion');if(save&&!save.dataset.zgpBound){save.dataset.zgpBound='1';save.addEventListener('click',()=>setTimeout(saveBuilderIdentity,50));}}
if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();