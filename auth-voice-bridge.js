(function(){
  'use strict';
  const SUPABASE_URL='https://hfdembdqzsedjbgemtdp.supabase.co';
  const SUPABASE_KEY='sb_publishable_NZAxQrtZ-sssoeIGVySf3w_1c0Io_xu';
  const supabaseClient=window.supabase.createClient(SUPABASE_URL,SUPABASE_KEY);
  const $=id=>document.getElementById(id);
  const showMessage=(text,type)=>{if($('authMsg'))$('authMsg').innerHTML='<div class="message '+type+'">'+String(text).replace(/[<>]/g,'')+'</div>'};

  function updateMemberUI(user){
    if(!user)return;
    localStorage.setItem('zevaniMember',JSON.stringify({email:user.email||'',name:(user.user_metadata&&((user.user_metadata.first_name||user.user_metadata.name)))||''}));
    if($('memberEmail'))$('memberEmail').textContent=user.email||'';
    if($('guestButtons'))$('guestButtons').classList.add('hidden');
    if($('memberButtons'))$('memberButtons').classList.remove('hidden');
  }

  async function restoreSession(){
    try{
      const {data}=await supabaseClient.auth.getSession();
      if(data&&data.session&&data.session.user){
        updateMemberUI(data.session.user);
        if(typeof renderDashboard==='function')renderDashboard();
      }
    }catch(e){console.warn('ZEVANI session restore failed',e)}
  }

  const form=$('authForm');
  if(form){
    form.addEventListener('submit',async function(e){
      e.preventDefault();
      e.stopImmediatePropagation();
      const loginMode=$('confirmInput')&&$('confirmInput').classList.contains('hidden');
      const email=($('emailInput').value||'').trim().toLowerCase();
      const password=$('passwordInput').value||'';
      const name=($('nameInput').value||'').trim();
      if(!email||!password){showMessage('Please enter your email and password.','error');return}
      if(!loginMode){
        if(!name){showMessage('Please enter your first name.','error');return}
        if(password.length<6){showMessage('Your password must be at least 6 characters.','error');return}
        if(password!==$('confirmInput').value){showMessage('The passwords do not match.','error');return}
      }
      const submit=$('authSubmit');if(submit){submit.disabled=true;submit.textContent=loginMode?'Logging in...':'Creating account...'}
      try{
        const result=loginMode
          ? await supabaseClient.auth.signInWithPassword({email,password})
          : await supabaseClient.auth.signUp({email,password,options:{data:{name,first_name:name},emailRedirectTo:window.location.origin+window.location.pathname}});
        if(result.error)throw result.error;
        if(loginMode){
          updateMemberUI(result.data.user);
          if(typeof renderDashboard==='function')renderDashboard();
          if(typeof show==='function')show('dashboardPage');
        }else if(result.data.session){
          updateMemberUI(result.data.user);
          if(typeof renderDashboard==='function')renderDashboard();
          if(typeof show==='function')show('dashboardPage');
        }else{
          showMessage('Your account was created. Please check your email and verify it, then log in.','success');
        }
      }catch(err){
        let text=err&&err.message?err.message:'Something went wrong. Please try again.';
        if(/invalid login credentials/i.test(text))text='Email or password is incorrect.';
        if(/email not confirmed/i.test(text))text='Please verify your email first, then log in again.';
        showMessage(text,'error');
      }finally{if(submit){submit.disabled=false;submit.textContent=loginMode?'Log In':'Create Account'}}
    },true);
  }

  function chooseVoice(name){
    const voices=window.speechSynthesis?window.speechSynthesis.getVoices():[];
    if(!voices.length)return null;
    const english=voices.filter(v=>/^en[-_]/i.test(v.lang));
    const pool=english.length?english:voices;
    const female=/Alex|Sophie/i.test(name);
    const male=/Eric|James/i.test(name);
    const preferred=female
      ? pool.find(v=>/zira|samantha|ava|aria|jenny|female/i.test(v.name))
      : male
        ? pool.find(v=>/david|guy|mark|daniel|male/i.test(v.name))
        : null;
    return preferred||pool[(['Eric','Alex','Sophie','James'].indexOf(name)+1)%pool.length]||pool[0];
  }

  function speakCompanion(){
    const name=$('chatName')&&$('chatName').textContent?$('chatName').textContent:'Companion';
    if(!window.speechSynthesis){alert('Voice playback is not supported by this browser.');return}
    const u=new SpeechSynthesisUtterance('I am '+name+'. I am here with you.');
    const v=chooseVoice(name);if(v){u.voice=v;u.lang=v.lang}
    window.speechSynthesis.cancel();window.speechSynthesis.speak(u);
  }

  const voiceButton=$('voiceBack');
  if(voiceButton)voiceButton.addEventListener('click',e=>{e.preventDefault();e.stopImmediatePropagation();speakCompanion()},true);
  if(window.speechSynthesis)window.speechSynthesis.onvoiceschanged=()=>{};
  restoreSession();
})();
