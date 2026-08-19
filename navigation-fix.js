// ZEVANI navigation helper — loaded by pages that opt in.
// Keeps normal browser Back behavior and provides a safe Home action.
(function(){
  window.zevaniGoHome=function(){ window.location.href='/zevani/'; };
  window.zevaniGoBack=function(){ if(history.length>1) history.back(); else window.location.href='/zevani/'; };
})();
