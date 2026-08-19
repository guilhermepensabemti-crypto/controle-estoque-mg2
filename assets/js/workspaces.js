const WORKSPACES={mg2:'Workplace MG2',criacao:'Prédio de Criação'};
let stock=[];
let pendingSection=null;
let currentWorkspace=localStorage.getItem('mg2_workspace')||'mg2';

function workspaceName(){return WORKSPACES[currentWorkspace]||currentWorkspace}
function updateWorkspaceUI(){
  const ids={workspaceSelect:currentWorkspace,headerWorkspace:workspaceName(),stockWorkspace:workspaceName(),entryWorkspace:workspaceName(),exitWorkspace:workspaceName()};
  Object.entries(ids).forEach(([id,value])=>{const el=document.getElementById(id);if(!el)return;if(id==='workspaceSelect')el.value=value;else el.textContent=value});
}
function changeWorkspace(){currentWorkspace=document.getElementById('workspaceSelect').value;localStorage.setItem('mg2_workspace',currentWorkspace);updateWorkspaceUI();show('stock')}
