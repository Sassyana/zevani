/* ZEVANI — companion catalog layer
   Keeps the existing 20 pre-created companions and adds a single, visible
   categorization layer without replacing the library's original data. */
(function(){
  'use strict';
  const identity={
    Alex:['Man','he/him'], Marcus:['Man','he/him'], Noah:['Man','he/him'], Daniel:['Man','he/him'], Luca:['Man','he/him'],
    Sofia:['Woman','she/her'], Maya:['Woman','she/her'], Emma:['Woman','she/her'], Ryan:['Man','he/him'], Chloe:['Woman','she/her'],
    Elena:['Woman','she/her'], Claire:['Woman','she/her'], Lily:['Woman','she/her'], Damien:['Man','he/him'], Aria:['Woman','she/her'],
    Kael:['Man','he/him'], Lyria:['Non-binary','they/them'], Darian:['Man','he/him'], Elara:['Woman','she/her']
  };
  const fantasy=new Set(['Kael','Lyria','Darian','Elara']);
  const labels=['Everyone','Men','Women','Non-binary','Gender-fluid','Other','Fantasy'];
  function nameOf(card){return card.querySelector('.zl-photo-name')?.textContent.trim() || card.querySelector('h3')?.textContent.trim() || '';}
  function decorateCards(){
    document.querySelectorAll('#zlGrid .zl-card').forEach(card=>{
      const name=nameOf(card), data=identity[name];
      if(!data)return;
      const body=card.querySelector('.zl-body');
      if(body && !body.querySelector('.z-companion-identity')){
        const d=document.createElement('div'); d.className='z-companion-identity'; d.textContent=data[0]+' · '+data[1];
        const title=body.querySelector('h3'); if(title) title.insertAdjacentElement('afterend',d);
      }
      card.dataset.gender=data[0];
      card.dataset.pronouns=data[1];
      card.dataset.fantasy=fantasy.has(name)?'true':'false';
    });
  }
  function showFilter(value){
    const cards=[...document.querySelectorAll('#zlGrid .zl-card')];
    cards.forEach(card=>{
      const gender=card.dataset.gender||'';
      const visible=value==='Everyone' || (value==='Men'&&gender==='Man') || (value==='Women'&&gender==='Woman') || gender===value || (value==='Fantasy'&&card.dataset.fantasy==='true');
      card.style.display=visible?'':'none';
    });
  }
  function installFilters(){
    const toolbar=document.querySelector('#zevaniLibrary .zl-toolbar'); if(!toolbar)return;
    toolbar.innerHTML='';
    labels.forEach((label,i)=>{
      const b=document.createElement('button'); b.type='button'; b.className='zl-filter'+(i===0?' active':''); b.textContent=label;
      b.dataset.catalogFilter=label;
      b.addEventListener('click',function(){toolbar.querySelectorAll('.zl-filter').forEach(x=>x.classList.remove('active'));b.classList.add('active');decorateCards();showFilter(label);});
      toolbar.appendChild(b);
    });
    decorateCards(); showFilter('Everyone');
  }
  function decorateModal(){
    const modal=document.getElementById('zlModal'); if(!modal || modal.dataset.catalogBound)return;
    modal.dataset.catalogBound='1';
    const observer=new MutationObserver(function(){
      const name=document.getElementById('zlModalName')?.textContent.trim(); const data=identity[name];
      if(!data)return;
      const meta=document.getElementById('zlModalMeta');
      if(meta && !meta.dataset.catalogMeta){
        const text=meta.textContent.trim(); meta.textContent=text.replace(/\s*·\s*[^·]+\s*·\s*[^·]+(?=\s*·|$)/,'')+' · '+data[0]+' · '+data[1]; meta.dataset.catalogMeta='1';
      }
    });
    observer.observe(modal,{subtree:true,childList:true,characterData:true});
  }
  function addBuilderFields(){
    const host=document.getElementById('companionPersonality'); if(!host || document.getElementById('zIdentityFields'))return;
    const wrap=document.createElement('div'); wrap.id='zIdentityFields'; wrap.className='z-identity-fields';
    wrap.innerHTML='<h3>Companion identity</h3><p>Gender identity and pronouns are separate choices.</p><div class="z-identity-grid"><label>Gender<select id="zGender"><option>Woman</option><option>Man</option><option>Non-binary</option><option>Gender-fluid</option><option>Other</option><option>Prefer not to specify</option></select></label><label>Pronouns<select id="zPronouns"><option value="she/her">She / her</option><option value="he/him">He / him</option><option value="they/them">They / them</option><option value="custom">Other / custom</option><option value="Prefer not to specify">Prefer not to specify</option></select></label></div><input id="zCustomPronouns" class="hidden" placeholder="Enter custom pronouns">';
    host.parentNode.insertBefore(wrap,host);
    document.getElementById('zPronouns').addEventListener('change',function(){document.getElementById('zCustomPronouns').classList.toggle('hidden',this.value!=='custom');});
  }
  function addStyles(){if(document.getElementById('zCatalogStyle'))return;const s=document.createElement('style');s.id='zCatalogStyle';s.textContent='.z-companion-identity{font-size:.78rem;color:#7a7f89;margin:3px 0 8px}.z-identity-fields{margin:18px 0;padding:18px;border:1px solid #e5dfd4;border-radius:16px;background:#fbf8f0}.z-identity-fields h3{margin:0 0 5px;color:#101a2d}.z-identity-fields p{margin:0 0 14px;color:#6d7480;font-size:.9rem}.z-identity-grid{display:grid;grid-template-columns:1fr 1fr;gap:12px}.z-identity-grid label{font-size:.8rem;font-weight:700;color:#59616e}.z-identity-grid select,.z-identity-fields input{display:block;width:100%;box-sizing:border-box;margin-top:6px;padding:10px;border:1px solid #ddd6ca;border-radius:10px;background:white}.hidden{display:none!important}@media(max-width:600px){.z-identity-grid{grid-template-columns:1fr}}';document.head.appendChild(s)}
  function init(){addStyles();addBuilderFields();decorateModal();let tries=0;const timer=setInterval(function(){tries++;if(document.getElementById('zlGrid')){decorateCards();installFilters();clearInterval(timer)}if(tries>30)clearInterval(timer)},300);}
  if(document.readyState==='loading')document.addEventListener('DOMContentLoaded',init);else init();
})();