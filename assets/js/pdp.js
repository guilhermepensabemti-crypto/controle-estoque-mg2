const PDP={
  items:[],
  statusOptions:['Em preparação','Liberado'],
  render(list){this.items=list||[];const el=document.getElementById('pdpTable');if(!el)return;if(!this.items.length){el.innerHTML='<div class="muted">Nenhuma máquina em preparação.</div>';return}el.innerHTML='<div class="pdpGrid">'+this.items.map(x=>`<div class="pdpRow"><span>${esc(x.chamado||'—')}</span><span>${esc(x.ativo||'—')}</span><span>${esc(x.equipamento||'—')}</span><span>${esc(x.colaborador||'—')}</span><span>${esc(x.tecnico||'—')}</span><strong>${esc(x.status||'Em preparação')}</strong></div>`).join('')+'</div>'},
  add(item){this.items.push(item);this.render(this.items)},
  setStatus(id,status){if(!this.statusOptions.includes(status))return;const item=this.items.find(x=>String(x.id)===String(id));if(item)item.status=status;this.render(this.items)}
};
function showPDP(){document.querySelectorAll('main section').forEach(s=>s.style.display='none');const el=document.getElementById('pdp');if(el)el.style.display='block'}
