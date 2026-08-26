const PDP = {
  items: [],
  statusOptions: ['Em preparação', 'Liberado'],
  tecnicos: [],

  render(list) {
    this.items = list || [];
    const el = document.getElementById('pdpTable');
    if (!el) return;
    if (!this.items.length) {
      el.innerHTML = '<div class="muted">Nenhuma máquina em preparação.</div>';
      return;
    }

    const canEdit = typeof isLogged === 'function' && isLogged('pdp') &&
      String(session()?.user?.role || '').toLowerCase() === 'admin';

    el.innerHTML = '<div class="pdpGrid">' + this.items.map(x => {
      const status = x.status || 'Em preparação';
      const id = String(x.id).replace(/'/g, "\\'");
      const statusHtml = canEdit
        ? `<button type="button" class="pdpStatusButton" onclick="PDP.toggleStatus('${id}')">${esc(status)}</button>`
        : `<strong>${esc(status)}</strong>`;

      const contact = status === 'Liberado' && canEdit ? `
        <div class="pdpContact">
          <label class="pdpContactCheck">
            <input type="checkbox" ${x.contatar_tecnico ? 'checked' : ''} onchange="PDP.toggleContact('${id}',this.checked)">
            <span>Contatar Técnico</span>
          </label>
          ${x.contatar_tecnico ? `
            <div class="pdpContactFields">
              <select onchange="PDP.selectTechnician('${id}',this.value)">
                <option value="">Técnico</option>
                ${this.tecnicos.map(t => `<option value="${t.id}" ${String(x.tecnico_contato_id) === String(t.id) ? 'selected' : ''}>${esc(t.nome)}</option>`).join('')}
              </select>
              <button type="button" class="pdpContactOk" onclick="PDP.confirmContact('${id}')">OK</button>
              ${x.tecnico_contato_id ? `<button type="button" class="pdpMoveBtn" onclick="PDP.openMove('${id}')">↗ Movimentar</button>` : ''}
            </div>` : ''}
        </div>` : '';

      return `<div class="pdpRow">
        <span>${esc(x.chamado || '—')}</span>
        <span>${esc(x.ativo || '—')}</span>
        <span>${esc(x.equipamento || '—')}</span>
        <span>${esc(x.colaborador || '—')}</span>
        <span>${esc(x.tecnico || '—')}</span>
        <div class="pdpStatusCell">${statusHtml}${contact}</div>
      </div>`;
    }).join('') + '</div>';
  },

  add(item) { this.items.push(item); this.render(this.items); },

  setStatus(id, status) {
    if (!this.statusOptions.includes(status)) return;
    const item = this.items.find(x => String(x.id) === String(id));
    if (item) item.status = status;
    this.render(this.items);
  },

  async toggleStatus(id) {
    if (!(typeof isLogged === 'function' && isLogged('pdp') && String(session()?.user?.role || '').toLowerCase() === 'admin')) {
      alert('Somente o login do PDP pode alterar o status.');
      return;
    }
    const item = this.items.find(x => String(x.id) === String(id));
    if (!item) return;
    const next = (item.status || 'Em preparação') === 'Liberado' ? 'Em preparação' : 'Liberado';
    try {
      const r = await fetch(typeof API !== 'undefined' ? API : 'https://lozqdrqujouvjfflgasl.supabase.co/functions/v1/mg2-workplace', {
        method: 'POST', headers: {'Content-Type': 'application/json', ...authHeaders()},
        body: JSON.stringify({action: 'status', workspace: 'pdp', id, status: next})
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Não foi possível alterar o status');
      if (d.data) {
        this.items = this.items.map(x => String(x.id) === String(id) ? d.data : x);
        this.render(this.items);
      }
    } catch (e) { alert(e.message); }
  },

  toggleContact(id, checked) {
    const item = this.items.find(x => String(x.id) === String(id));
    if (!item) return;
    item.contatar_tecnico = checked;
    if (!checked) item.tecnico_contato_id = null;
    this.render(this.items);
  },

  selectTechnician(id, technicianId) {
    const item = this.items.find(x => String(x.id) === String(id));
    if (!item) return;
    item.tecnico_contato_id = technicianId || null;
    this.render(this.items);
  },

  async confirmContact(id) {
    const item = this.items.find(x => String(x.id) === String(id));
    if (!item || !item.tecnico_contato_id) {
      alert('Selecione um técnico antes de confirmar.');
      return;
    }
    const technicianId = String(item.tecnico_contato_id);
    try {
      const r = await fetch(typeof API !== 'undefined' ? API : 'https://lozqdrqujouvjfflgasl.supabase.co/functions/v1/mg2-workplace', {
        method: 'POST', headers: {'Content-Type': 'application/json', ...authHeaders()},
        body: JSON.stringify({action: 'contact_technician', workspace: 'pdp', id: item.id, tecnico_contato_id: technicianId, contatar_tecnico: true})
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || `Não foi possível registrar o contato do ativo ${item.ativo}`);

      // Mantém os dados locais mesmo se o backend não devolver todos os campos.
      const updated = {
        ...item,
        ...(d.data || {}),
        contatar_tecnico: true,
        tecnico_contato_id: technicianId
      };
      this.items = this.items.map(x => String(x.id) === String(item.id) ? updated : x);
      this.render(this.items);
    } catch (e) { alert(e.message); }
  },

  openMove(id) {
    const item = this.items.find(x => String(x.id) === String(id));
    if (!item) return;

    let modal = document.getElementById('pdpMoveModal');
    // Cria o modal automaticamente caso uma versão antiga/cache do HTML não o possua.
    if (!modal) {
      modal = document.createElement('div');
      modal.id = 'pdpMoveModal';
      modal.className = 'loginModal hidden';
      modal.innerHTML = `<div class="loginBox card">
        <h2>↗ Movimentar equipamento</h2>
        <p id="pdpMoveInfo" class="muted"></p>
        <label for="pdpMoveDestination">Estoque de destino</label>
        <select id="pdpMoveDestination">
          <option value="">Selecione o estoque</option>
          <option value="mg2">Workplace MG2</option>
          <option value="criacao">Prédio de Criação</option>
        </select>
        <div id="pdpMoveMsg" class="msg"></div>
        <div class="actions">
          <button type="button" class="blue" id="pdpMoveConfirm">Confirmar movimentação</button>
          <button type="button" id="pdpMoveCancel">Cancelar</button>
        </div>
      </div>`;
      document.body.appendChild(modal);
      document.getElementById('pdpMoveCancel').onclick = () => modal.classList.add('hidden');
      document.getElementById('pdpMoveConfirm').onclick = () => this.move(modal.dataset.id, document.getElementById('pdpMoveDestination').value);
    }

    const info = document.getElementById('pdpMoveInfo');
    const dest = document.getElementById('pdpMoveDestination');
    const msg = document.getElementById('pdpMoveMsg');
    modal.dataset.id = item.id;
    if (info) info.innerHTML = `Ativo: <b>${esc(item.ativo)}</b> • ${esc(item.equipamento)} • Chamado: <b>${esc(item.chamado)}</b>`;
    if (dest) dest.value = '';
    if (msg) { msg.textContent = ''; msg.style.display = 'none'; }
    modal.classList.remove('hidden');
  },

  async move(id, destination) {
    if (!['mg2', 'criacao'].includes(destination)) {
      alert('Selecione o estoque de destino.');
      return;
    }
    const item = this.items.find(x => String(x.id) === String(id));
    if (!item) return;
    try {
      const r = await fetch(typeof API !== 'undefined' ? API : 'https://lozqdrqujouvjfflgasl.supabase.co/functions/v1/mg2-workplace', {
        method: 'POST', headers: {'Content-Type': 'application/json', ...authHeaders()},
        body: JSON.stringify({action: 'move_pdp', workspace: 'pdp', id: item.id, destination})
      });
      const d = await r.json();
      if (!r.ok) throw new Error(d.error || 'Não foi possível movimentar o equipamento');
      document.getElementById('pdpMoveModal')?.classList.add('hidden');
      this.items = this.items.filter(x => String(x.id) !== String(item.id));
      this.render(this.items);
      alert(`Equipamento movimentado para ${destination === 'mg2' ? 'Workplace MG2' : 'Prédio de Criação'}.`);
    } catch (e) { alert(e.message); }
  }
};

async function loadPDPTechnicians() {
  try {
    const r = await fetch('https://lozqdrqujouvjfflgasl.supabase.co/functions/v1/mg2-workplace?action=technicians');
    const d = await r.json();
    if (r.ok) PDP.tecnicos = d.data || [];
  } catch (e) { console.error(e); }
  if (PDP.items.length) PDP.render(PDP.items);
}

function showPDP() {
  document.querySelectorAll('main section').forEach(s => s.style.display = 'none');
  const el = document.getElementById('pdp');
  if (el) el.style.display = 'block';
  loadPDPTechnicians();
}
