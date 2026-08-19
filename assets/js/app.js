function show(id){
  ['stock','entry','exit'].forEach(x=>{
    const el=document.getElementById(x);
    if(el)el.style.display=x===id?'block':'none';
  });
  updateWorkspaceUI();
  if(id==='entry')clearEntry();
  if(id==='exit'){clearExit();buildAssetList()}
  if(id==='stock')load();
}

function msg(e,t,c){
  if(!e)return;
  e.textContent=t;
  e.className='msg '+c;
  e.style.display='block';
  setTimeout(()=>{e.style.display='none'},4000);
}

function esc(s){
  return String(s??'').replace(/[&<>\"']/g,m=>({
    '&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'
  }[m]));
}

function bindEvents(){
  const workspace=document.getElementById('workspaceSelect');
  workspace?.addEventListener('change',changeWorkspace);

  document.querySelectorAll('[data-action]').forEach(button=>{
    button.addEventListener('click',()=>{
      const action=button.dataset.action;
      if(action==='stock')show('stock');
      if(action==='entry')requireLogin('entry');
      if(action==='exit')requireLogin('exit');
      if(action==='login')openLogin();
      if(action==='move-entry')move('entrada');
      if(action==='move-exit')move('saida');
    });
  });

  document.getElementById('search')?.addEventListener('input',render);
  document.getElementById('filter')?.addEventListener('change',render);

  document.getElementById('ec')?.addEventListener('input',e=>{
    e.target.value=e.target.value.toUpperCase();
  });
  document.getElementById('ea')?.addEventListener('input',e=>{
    e.target.value=e.target.value.toUpperCase();
  });
  document.getElementById('ee')?.addEventListener('input',equipmentChanged);
  document.getElementById('echip')?.addEventListener('change',chipChanged);
  document.getElementById('sa')?.addEventListener('input',e=>{
    e.target.value=e.target.value.toUpperCase();
    fillExitFromAsset();
  });
}

document.addEventListener('DOMContentLoaded',()=>{
  bindEvents();
  updateWorkspaceUI();
  updateSession();
  load();
});
