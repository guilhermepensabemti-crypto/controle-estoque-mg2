const WORKSPACES={mg2:'Workplace MG2',criacao:'Prédio de Criação',pdp:'🛠️ Preparação de Máquinas (PDP)'};
let stock=[];
let pendingSection=null;
let currentWorkspace=localStorage.getItem('mg2_workspace')||'mg2';
function workspaceName(){return WORKSPACES[currentWorkspace]||currentWorkspace}
function updateWorkspaceUI(){const ids={workspaceSelect:currentWorkspace,headerWorkspace:workspaceName(),stockWorkspace:workspaceName(),entryWorkspace:workspaceName(),exitWorkspace:workspaceName()};Object.entries(ids).forEach(([id,value])=>{const el=document.getElementById(id);if(!el)return;if(id==='workspaceSelect')el.value=value;else el.textContent=value});updateAuthUI?.()}
async function changeWorkspace(){const select=document.getElementById('workspaceSelect');const next=select?.value;if(!WORKSPACES[next])return;if(next===currentWorkspace){if(currentWorkspace==='pdp')await loadPDPData();else{show('stock');await load()}return}currentWorkspace=next;localStorage.setItem('mg2_workspace',currentWorkspace);updateWorkspaceUI();if(currentWorkspace==='pdp')await loadPDPData();else{show('stock');await load()}}
async function loadPDPData(){try{const d=await api(API+'?action=stock&workspace=pdp');stock=d.data||[];show('pdp');PDP.render(stock);if(typeof loadMovements==='function')await loadMovements()}catch(e){show('pdp');const el=document.getElementById('pdpTable');if(el)el.innerHTML='<div class="muted">Não foi possível carregar o PDP: '+esc(e.message)+'</div>'}}
