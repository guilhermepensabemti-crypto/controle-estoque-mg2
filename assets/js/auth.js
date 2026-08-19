const AUTH_KEY='workplace_session';
function session(){try{return JSON.parse(localStorage.getItem(AUTH_KEY)||'null')}catch{return null}}
function isLogged(workspace=currentWorkspace){const s=session();return !!(s?.access_token&&s?.user?.workspace===workspace)}
function authHeaders(){const s=session();return s?.access_token?{Authorization:'Bearer '+s.access_token}:{} }
function updateAuthUI(){const s=session(),status=document.getElementById('mg2AuthStatus'),logout=document.getElementById('mg2Logout');if(status)status.textContent=s?.user?.workspace===currentWorkspace?'Autenticado para movimentações':'Visualização pública';if(logout){logout.style.display=s?.user?.workspace===currentWorkspace?'inline-flex':'none';logout.textContent='Sair '+(currentWorkspace==='mg2'?'MG2':'Criação')}}
function showLogin(){const modal=document.getElementById('mg2LoginModal');if(!modal)return;const title=modal.querySelector('h2'),desc=modal.querySelector('p');const name=currentWorkspace==='mg2'?'Workplace MG2':'Prédio de Criação';if(title)title.textContent='🔐 Acesso '+name;if(desc)desc.textContent='O estoque é público. Login necessário somente para Entrada e Saída.';modal.classList.remove('hidden');setTimeout(()=>document.getElementById('mg2User')?.focus(),50)}
function hideLogin(){document.getElementById('mg2LoginModal')?.classList.add('hidden')}
function logoutMg2(){localStorage.removeItem(AUTH_KEY);updateAuthUI()}
async function loginMg2(){const u=document.getElementById('mg2User')?.value.trim().toLowerCase(),p=document.getElementById('mg2Pass')?.value||'',box=document.getElementById('mg2LoginMsg');if(!u||!p){msg(box,'Informe usuário e senha.','warn');return}try{const r=await fetch(API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'login',username:u,password:p,workspace:currentWorkspace})});const d=await r.json();if(!r.ok)throw Error(d.error||'Login inválido');localStorage.setItem(AUTH_KEY,JSON.stringify(d));hideLogin();updateAuthUI()}catch(e){msg(box,e.message,'warn')}}
function requireAccess(){return isLogged(currentWorkspace)}
document.addEventListener('DOMContentLoaded',updateAuthUI);
