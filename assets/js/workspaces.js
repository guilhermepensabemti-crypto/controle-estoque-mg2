const WORKSPACES={mg2:'Workplace MG2',criacao:'Prédio de Criação',pdp:'🛠️ Preparação de Máquinas (PDP)'};
let stock=[];
let pendingSection=null;
let currentWorkspace=localStorage.getItem('mg2_workspace')||'mg2';
function workspaceName(){return WORKSPACES[currentWorkspace]||currentWorkspace}
function updateWorkspaceUI(){const ids={workspaceSelect:currentWorkspace,headerWorkspace:workspaceName(),stockWorkspace:workspaceName(),entryWorkspace:workspaceName(),exitWorkspace:workspaceName()};Object.entries(ids).forEach(([id,value])=>{const el=document.getElementById(id);if(!el)return;if(id==='workspaceSelect')el.value=value;else el.textContent=value});updateAuthUI?.()}
function changeWorkspace(){const select=document.getElementById('workspaceSelect');const next=select?.value;if(!WORKSPACES[next]||next===currentWorkspace){show(currentWorkspace==='pdp'?'pdp':'stock');return}currentWorkspace=next;localStorage.setItem('mg2_workspace',currentWorkspace);updateWorkspaceUI();if(currentWorkspace==='pdp'){show('pdp');return}show('stock');load()}
