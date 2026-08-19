const WORKSPACES={mg2:'Workplace MG2',criacao:'Prédio de Criação'};
let stock=[];
let pendingSection=null;
let currentWorkspace=localStorage.getItem('mg2_workspace')||'mg2';
function workspaceName(){return WORKSPACES[currentWorkspace]||currentWorkspace}
function updateWorkspaceUI(){const ids={workspaceSelect:currentWorkspace,headerWorkspace:workspaceName(),stockWorkspace:workspaceName(),entryWorkspace:workspaceName(),exitWorkspace:workspaceName()};Object.entries(ids).forEach(([id,value])=>{const el=document.getElementById(id);if(!el)return;if(id==='workspaceSelect')el.value=value;else el.textContent=value});updateAuthUI?.()}
function changeWorkspace(){const next=document.getElementById('workspaceSelect').value;if(next==='mg2'&&!isMg2Logged()){currentWorkspace='criacao';document.getElementById('workspaceSelect').value='criacao';localStorage.setItem('mg2_workspace','criacao');updateWorkspaceUI();show('stock');showLogin();return}currentWorkspace=next;localStorage.setItem('mg2_workspace',currentWorkspace);updateWorkspaceUI();show('stock')}
