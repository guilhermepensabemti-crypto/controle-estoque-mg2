const LOGIN_API='https://lozqdrqujouvjfflgasl.supabase.co/functions/v1/mg2-login';
const SESSION_KEY='mg2_session_v3';

function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function isLogged(){const s=session();return !!(s&&s.access_token&&s.user&&s.user.active)}
function updateSession(){const el=document.getElementById('session'),u=session();if(!el)return;el.innerHTML=isLogged()?'<span>🔓 '+esc(u.user.username)+' • '+esc(WORKSPACES[u.user.workspace]||u.user.workspace)+'</span><button class="logout" onclick="logout()">Sair</button>':''}
function openLogin(){if(isLogged()){updateSession();alert('A sessão já está ativa neste navegador.');return}pendingSection=null;showLogin()}
function showLogin(){
  document.getElementById('loginModal')?.remove();
  document.body.insertAdjacentHTML('beforeend','<div id="loginModal" style="position:fixed;inset:0;background:rgba(0,0,0,.82);display:flex;align-items:center;justify-content:center;padding:20px;z-index:99"><div class="card loginBox"><h2>🔐 Login</h2><p class="muted">Informe seu usuário e senha para liberar entrada e saída do espaço Workplace.</p><label>Usuário</label><input id="loginUser" autocomplete="username" placeholder="Ex.: ew-mg2"><label>Senha</label><input id="loginPass" type="password" autocomplete="current-password" placeholder="Digite sua senha" onkeydown="if(event.key===\'Enter\')login()"><div id="loginError" class="msg warn"></div><div class="actions"><button class="blue" onclick="login()">Entrar</button><button onclick="document.getElementById(\'loginModal\').remove()">Cancelar</button></div><p class="muted" style="font-size:12px">A sessão permanece neste navegador até sair ou limpar os dados/cache do site.</p></div></div>');
  setTimeout(()=>document.getElementById('loginUser')?.focus(),50)
}
async function login(){
  const u=document.getElementById('loginUser').value.trim().toLowerCase(),p=document.getElementById('loginPass').value,e=document.getElementById('loginError');e.style.display='none';
  if(!u||!p){e.textContent='Informe o usuário e a senha.';e.style.display='block';return}
  try{const r=await fetch(LOGIN_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});let d={};try{d=await r.json()}catch{throw Error('Resposta inválida do servidor de autenticação')}if(!r.ok)throw Error(d.error||'Login inválido');if(!d.access_token||!d.user)throw Error('Autenticação incompleta: sessão não foi criada.');localStorage.setItem(SESSION_KEY,JSON.stringify(d));currentWorkspace=d.user.workspace||'mg2';localStorage.setItem('mg2_workspace',currentWorkspace);document.getElementById('loginModal').remove();updateWorkspaceUI();updateSession();if(pendingSection)show(pendingSection);else show('stock')}catch(err){e.textContent=err.message;e.style.display='block'}
}
function requireLogin(section){if(!isLogged()){pendingSection=section;showLogin();return}const u=session().user;if(u.workspace!==currentWorkspace){alert('Este login pertence ao '+(WORKSPACES[u.workspace]||u.workspace)+'. Selecione esse espaço para registrar movimentações.');currentWorkspace=u.workspace;localStorage.setItem('mg2_workspace',currentWorkspace);updateWorkspaceUI()}show(section)}
function logout(){localStorage.removeItem(SESSION_KEY);updateSession();show('stock')}
