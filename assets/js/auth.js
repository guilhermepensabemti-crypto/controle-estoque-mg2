const MG2_SESSION_KEY='mg2_session';
function mg2Session(){try{return JSON.parse(localStorage.getItem(MG2_SESSION_KEY)||'null')}catch{return null}}
function isMg2Logged(){const s=mg2Session();return !!(s?.access_token&&s?.user?.workspace==='mg2')}
function mg2AuthHeaders(){const s=mg2Session();return s?.access_token?{Authorization:'Bearer '+s.access_token}:{} }
function updateAuthUI(){const b=document.getElementById('mg2Logout');if(b)b.style.display=isMg2Logged()?'inline-flex':'none';const s=document.getElementById('mg2AuthStatus');if(s)s.textContent=isMg2Logged()?'MG2 autenticado':'Acesso protegido'}
function showLogin(){const modal=document.getElementById('mg2LoginModal');if(modal)modal.classList.remove('hidden');setTimeout(()=>document.getElementById('mg2User')?.focus(),50)}
function hideLogin(){document.getElementById('mg2LoginModal')?.classList.add('hidden')}
function logoutMg2(){localStorage.removeItem(MG2_SESSION_KEY);updateAuthUI();if(currentWorkspace==='mg2')showLogin()}
async function loginMg2(){const u=document.getElementById('mg2User')?.value.trim().toLowerCase(),p=document.getElementById('mg2Pass')?.value||'',box=document.getElementById('mg2LoginMsg');if(!u||!p){msg(box,'Informe usuário e senha.','warn');return}try{const r=await fetch(API+'?action=login',{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});const d=await r.json();if(!r.ok)throw Error(d.error||'Login inválido');localStorage.setItem(MG2_SESSION_KEY,JSON.stringify(d));currentWorkspace='mg2';localStorage.setItem('mg2_workspace','mg2');hideLogin();updateAuthUI();updateWorkspaceUI();load()}catch(e){msg(box,e.message,'warn')}}
function requireMg2Access(){if(currentWorkspace!=='mg2')return true;if(isMg2Logged())return true;showLogin();return false}
document.addEventListener('DOMContentLoaded',updateAuthUI);
