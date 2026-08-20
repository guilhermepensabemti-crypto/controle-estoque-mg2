const WEBPUSH_API='https://lozqdrqujouvjfflgasl.supabase.co/functions/v1/mg2-workplace';
function pushB64ToUint8Array(base64){const pad='='.repeat((4-base64.length%4)%4);const raw=atob((base64+pad).replace(/-/g,'+').replace(/_/g,'/'));return Uint8Array.from([...raw].map(c=>c.charCodeAt(0)))}
async function setupWebPush(){
  if(!('serviceWorker' in navigator)||!('PushManager' in window)||!('Notification' in window))return;
  try{const reg=await navigator.serviceWorker.register('./sw.js',{scope:'./'});const r=await fetch(`${WEBPUSH_API}?action=push-config`);const cfg=await r.json();if(!cfg.publicKey)return;let permission=Notification.permission;if(permission==='default')permission=await Notification.requestPermission();if(permission!=='granted')return;let sub=await reg.pushManager.getSubscription();if(!sub)sub=await reg.pushManager.subscribe({userVisibleOnly:true,applicationServerKey:pushB64ToUint8Array(cfg.publicKey)});const techId=localStorage.getItem('push-tecnico-id');if(!techId)return;await fetch(WEBPUSH_API,{method:'POST',headers:{'Content-Type':'application/json'},body:JSON.stringify({action:'subscribe_push',tecnico_id:techId,subscription:sub.toJSON()})});
  }catch(e){console.error('Web Push:',e)}
}
async function choosePushTechnician(){
  try{const r=await fetch(`${WEBPUSH_API}?action=technicians`);const d=await r.json();const list=d.data||[];const modal=document.getElementById('pushTechnicianModal');const select=document.getElementById('pushTechnicianSelect');if(!modal||!select)return;select.innerHTML='<option value="">Selecione seu nome</option>'+list.map(t=>`<option value="${t.id}">${esc(t.nome)}</option>`).join('');modal.classList.remove('hidden');document.getElementById('pushTechnicianConfirm').onclick=async()=>{const id=select.value;if(!id){document.getElementById('pushTechnicianMsg').textContent='Selecione seu nome.';return}localStorage.setItem('push-tecnico-id',id);modal.classList.add('hidden');await setupWebPush()};
  }catch(e){console.error('Técnicos:',e)}
}
document.addEventListener('DOMContentLoaded',()=>setTimeout(choosePushTechnician,150));
