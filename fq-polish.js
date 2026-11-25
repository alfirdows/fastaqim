/* Fastaqim finishing layer (25 Nov 2026): profile rows show the person's first letter instead of a drawn person icon. */
(function(){
 function mono(i){
  if(i.dataset.fqx)return;i.dataset.fqx=1;
  var row=i.closest('button,.adfr,.fambar');if(!row)return;
  var n=row.querySelector('b[dir=auto],span[dir=auto]');var t=n&&n.textContent.trim();if(!t)return;
  var ch=Array.from(t)[0];if(!ch||/[\d\s@]/.test(ch))return;
  var s=document.createElement('span');s.className='fqx-mono';s.setAttribute('aria-hidden','true');s.textContent=ch.toLocaleUpperCase();
  i.replaceWith(s);
 }
 function fix(root){
  (root.querySelectorAll?root:document).querySelectorAll('i.ph-user').forEach(mono);
  (root.querySelectorAll?root:document).querySelectorAll('i.ph-users-three').forEach(function(i){
   var p=i.parentElement;if(p&&/Kahf|الكهف/.test(p.parentElement?p.parentElement.textContent:p.textContent)){i.classList.remove('ph-users-three');i.classList.add('ph-book-open-text')}
  });
 }
 function start(){fix(document);var q=0;new MutationObserver(function(){if(q)return;q=1;requestAnimationFrame(function(){q=0;fix(document)})}).observe(document.body,{childList:true,subtree:true})}
 if(document.body)start();else document.addEventListener('DOMContentLoaded',start);
})();
