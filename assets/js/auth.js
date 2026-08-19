const LOGIN_API='https://lozqdrqujouvjfflgasl.supabase.co/functions/v1/mg2-login';
const SESSION_KEY='mg2_session_v3';

function session(){try{return JSON.parse(localStorage.getItem(SESSION_KEY)||'null')}catch{return null}}
function isLogged(){const s=session();return !!(s&&s.access_token&&s.user&&s.user.active)}

function updateSession(){
  const el=document.getElementById('session'),u=session();
  if(!el)return;
  el.innerHTML=isLogged()?'<span>🔓 '+esc(u.user.username)+' • '+esc(WORKSPACES[u.user.workspace]||u.user.workspace)+'</span><button type="button" class="logout" id="logoutButton">Sair</button>':'';
  if(isLogged())document.getElementById('logoutButton')?.addEventListener('click',logout);
}

function openLogin(){
  if(isLogged()){updateSession();alert('A sessão já está ativa neste navegador.');return}
  pendingSection=null;
  showLogin();
}

function showLogin(){
  document.getElementById('loginModal')?.remove();
  document.body.insertAdjacentHTML('beforeend',`
    <div id="loginModal" class="loginModal">
      <div class="card loginBox">
        <h2>🔐 Login</h2>
        <p class="muted">Informe seu usuário e senha para liberar entrada e saída do espaço Workplace.</p>
        <label for="loginUser">Usuário</label>
        <input id="loginUser" autocomplete="username" placeholder="Ex.: ew-mg2">
        <label for="loginPass">Senha</label>
        <input id="loginPass" type="password" autocomplete="current-password" placeholder="Digite sua senha">
        <div id="loginError" class="msg warn"></div>
        <div class="actions">
          <button type="button" class="blue" id="loginButton">Entrar</button>
          <button type="button" id="cancelLoginButton">Cancelar</button>
        </div>
        <p class="muted loginHint">A sessão permanece neste navegador até sair ou limpar os dados/cache do site.</p>
      </div>
    </div>`);

  const modal=document.getElementById('loginModal');
  document.getElementById('loginButton')?.addEventListener('click',login);
  document.getElementById('cancelLoginButton')?.addEventListener('click',()=>modal?.remove());
  document.getElementById('loginPass')?.addEventListener('keydown',e=>{if(e.key==='Enter')login()});
  setTimeout(()=>document.getElementById('loginUser')?.focus(),50);
}

async function login(){
  const userEl=document.getElementById('loginUser'),passEl=document.getElementById('loginPass'),e=document.getElementById('loginError');
  if(!userEl||!passEl||!e)return;
  const u=userEl.value.trim().toLowerCase(),p=passEl.value;
  e.style.display='none';
  if(!u||!p){e.textContent='Informe o usuário e a senha.';e.style.display='block';return}
  try{
    const r=await fetch(LOGIN_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({username:u,password:p})});
    let d={};
    try{d=await r.json()}catch{throw Error('Resposta inválida do servidor de autenticação')}
    if(!r.ok)throw Error(d.error||'Login inválido');
    if(!d.access_token||!d.user)throw Error('Autenticação incompleta: sessão não foi criada.');
    localStorage.setItem(SESSION_KEY,JSON.stringify(d));
    currentWorkspace=d.user.workspace||'mg2';
    localStorage.setItem('mg2_workspace',currentWorkspace);
    document.getElementById('loginModal')?.remove();
    updateWorkspaceUI();
    updateSession();
    if(pendingSection)show(pendingSection);else show('stock');
  }catch(err){e.textContent=err.message;e.style.display='block'}
}

function requireLogin(section){
  if(!isLogged()){pendingSection=section;showLogin();return}
  const u=session().user;
  if(u.workspace!==currentWorkspace){
    alert('Este login pertence ao '+(WORKSPACES[u.workspace]||u.workspace)+'. Selecione esse espaço para registrar movimentações.');
    currentWorkspace=u.workspace;
    localStorage.setItem('mg2_workspace',currentWorkspace);
    updateWorkspaceUI();
  }
  show(section);
}

function logout(){localStorage.removeItem(SESSION_KEY);updateSession();show('stock')}
