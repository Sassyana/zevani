// ZEVANI navigation helper — safe routing for the existing app.
(function(){
  function page(id){
    if(typeof window.show==='function') window.show(id,true);
    else window.location.hash=id;
  }
  window.zevaniGoHome=function(){page('homePage');};
  window.zevaniGoBuilder=function(){page('builderPage');};
  window.zevaniGoBack=function(){
    if(typeof window.goBack==='function') window.goBack();
    else if(history.length>1) history.back();
    else page('homePage');
  };
  window.zevaniMeetThem=function(companion){
    if(!companion)return;
    localStorage.setItem('zevaniPendingCompanion',JSON.stringify(companion));
    if(typeof window.openChat==='function'){
      const id='library-'+String(companion.name||'').toLowerCase().replace(/[^a-z0-9]+/g,'-');
      window.openChat(id);
    }else page('chatPage');
  };
})();
