function show(id){['stock','entry','exit'].forEach(x=>document.getElementById(x).style.display=x===id?'block':'none');updateWorkspaceUI();if(id==='entry')clearEntry();if(id==='exit'){clearExit();buildAssetList()}if(id==='stock')load()}
function msg(e,t,c){e.textContent=t;e.className='msg '+c;e.style.display='block';setTimeout(()=>e.style.display='none',4000)}
function esc(s){return String(s??'').replace(/[&<>\"']/g,m=>({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',"'":'&#039;'}[m]))}

document.getElementById('ee').addEventListener('input',equipmentChanged);

updateWorkspaceUI();
updateSession();
load();
