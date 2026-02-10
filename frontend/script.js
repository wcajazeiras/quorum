// ========== SIDEBAR NAVIGATION ==========
// Gerencia a ativação de itens na sidebar ao clicar
const allSideMenuItems = document.querySelectorAll('#sidebar .side-menu.top li a');
const pages = document.querySelectorAll('#content main .page');

function setActivePage(pageKey) {
    pages.forEach(page => {
        const isActive = page.dataset.page === pageKey;
        page.classList.toggle('active', isActive);
    });

    allSideMenuItems.forEach(item => {
        const itemKey = item.dataset.page;
        const isActive = itemKey === pageKey;
        item.parentElement.classList.toggle('active', isActive);
    });
}

allSideMenuItems.forEach(item => {
    const listItem = item.parentElement;

    item.addEventListener('click', function (e) {
        e.preventDefault();

        // Remove ativo de todos os itens
        allSideMenuItems.forEach(i => {
            i.parentElement.classList.remove('active');
        });

        // Adiciona ativo ao item clicado
        listItem.classList.add('active');

        // Troca a pagina exibida
        const targetPage = item.dataset.page;
        if (targetPage) {
            setActivePage(targetPage);
        }
    });
});

// ========== PAGE LINKS ==============
// Permite trocar paginas por links dentro do conteudo
document.querySelectorAll('a[data-page], button[data-page]').forEach(link => {
    if (link.closest('#sidebar')) return;

    link.addEventListener('click', function (event) {
        const targetPage = link.dataset.page;
        if (!targetPage) return;
        event.preventDefault();
        setActivePage(targetPage);
    });
});

// ========== SIDEBAR TOGGLE ==========
// Abre/fecha a sidebar ao clicar no menu icon
const menuBar = document.querySelector('#content nav .bx.bx-menu');
const sidebar = document.getElementById('sidebar');

menuBar.addEventListener('click', function () {
    sidebar.classList.toggle('hide');
});

// Ajusta responsividade da sidebar baseado no tamanho da tela
function adjustSidebarResponsive() {
    if (window.innerWidth <= 576) {
        sidebar.classList.add('hide');
    } else {
        sidebar.classList.remove('hide');
    }
}

window.addEventListener('load', adjustSidebarResponsive);
window.addEventListener('resize', adjustSidebarResponsive);

// ========== SEARCH FORM TOGGLE ==========
// Em telas pequenas, expande o input de busca ao clicar no botão
const searchButton = document.querySelector('#content nav form .form-input button');
const searchButtonIcon = document.querySelector('#content nav form .form-input button .bx');
const searchForm = document.querySelector('#content nav form');

searchButton.addEventListener('click', function (e) {
    if (window.innerWidth < 768) {
        e.preventDefault();
        searchForm.classList.toggle('show');
        
        // Muda o ícone entre lupa e X
        if (searchForm.classList.contains('show')) {
            searchButtonIcon.classList.replace('bx-search', 'bx-x');
        } else {
            searchButtonIcon.classList.replace('bx-x', 'bx-search');
        }
    }
});

// ========== DARK MODE TOGGLE ==========
// Ativa/desativa o modo escuro da aplicação
const switchModeCheckbox = document.getElementById('switch-mode');

function applyTheme(isDark, persist = true) {
    document.body.classList.toggle('dark', isDark);
    if (switchModeCheckbox) {
        switchModeCheckbox.checked = isDark;
    }
    if (persist) {
        localStorage.setItem('darkMode', isDark ? 'true' : 'false');
    }
}

window.addEventListener('load', function () {
    const savedPreference = localStorage.getItem('darkMode');
    if (savedPreference === 'true') {
        applyTheme(true, false);
        return;
    }

    if (savedPreference === 'false') {
        applyTheme(false, false);
        return;
    }

    // Default: light mode
    applyTheme(false, false);
});

if (switchModeCheckbox) {
    switchModeCheckbox.addEventListener('change', function () {
        applyTheme(this.checked);
    });
}

// ========== NOTIFICATION DROPDOWN ==========
// Abre/fecha o dropdown de notificações
const notificationIcon = document.querySelector('.notification');
const notificationMenu = document.querySelector('.notification-menu');

notificationIcon.addEventListener('click', function (e) {
    e.preventDefault();
    notificationMenu.classList.toggle('show');
    
    // Fecha menu de perfil se estiver aberto
    profileMenu.classList.remove('show');
});

// ========== PROFILE DROPDOWN ==========
// Abre/fecha o dropdown de perfil
const profileIcon = document.querySelector('.profile');
const profileMenu = document.querySelector('.profile-menu');

profileIcon.addEventListener('click', function (e) {
    e.preventDefault();
    profileMenu.classList.toggle('show');
    
    // Fecha menu de notificações se estiver aberto
    notificationMenu.classList.remove('show');
});

// ========== CLOSE MENUS ON OUTSIDE CLICK ==========
// Fecha ambos os menus quando clica fora deles
window.addEventListener('click', function (e) {
    // Verifica se o clique não foi no ícone de notificação ou perfil
    if (!e.target.closest('.notification') && !e.target.closest('.profile')) {
        notificationMenu.classList.remove('show');
        profileMenu.classList.remove('show');
    }
});

// ========== CONTRATOS PAGE (FULL CRUD) ==========
let contratosCache = [];
let editaisCache = [];
const contratosPageTableBody = document.getElementById('contratosPageTableBody');
const contratosTableBody = document.getElementById('contratosTableBody'); // dashboard table

function formatDate(value) {
    if (!value) return 'Não informado';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('pt-BR');
}

function formatCurrency(value) {
    if (!value && value !== 0) return '-';
    return Number(value).toLocaleString('pt-BR', { style: 'currency', currency: 'BRL' });
}

function getContratoStatusMeta(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'ativo') return { label: 'Ativo', css: 'active', color: '#27ae60' };
    if (normalized === 'encerrado') return { label: 'Encerrado', css: 'process', color: '#888' };
    if (normalized === 'suspenso') return { label: 'Suspenso', css: 'pending', color: '#f39c12' };
    if (normalized === 'cancelado') return { label: 'Cancelado', css: 'pending', color: '#e74c3c' };
    return { label: 'Em andamento', css: 'process', color: '#3498db' };
}

function getBadgeText(rawLabel) {
    const digits = String(rawLabel || '').replace(/\D/g, '').slice(-3);
    return digits || 'CNT';
}

function getStatusMeta(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'ativo') return { label: 'Ativo', css: 'active', color: '27ae60' };
    if (normalized === 'encerrado') return { label: 'Encerrado', css: 'completed', color: '3C91E6' };
    if (normalized === 'suspenso') return { label: 'Suspenso', css: 'pending', color: 'FFCE26' };
    if (normalized === 'cancelado') return { label: 'Cancelado', css: 'pending', color: 'FFCE26' };
    return { label: 'Em andamento', css: 'process', color: 'FD7238' };
}

// Build row for the contratos PAGE table (full version with actions)
function buildContratoPageRow(contrato) {
    const statusMeta = getContratoStatusMeta(contrato.status);
    const numero = contrato.numero || `CT-${contrato.id}`;
    const editalLabel = contrato.editalNumero || `Edital #${contrato.editalId}`;
    const orgao = contrato.orgao || '-';
    const periodo = `${formatDate(contrato.dataInicio)} - ${formatDate(contrato.dataFim)}`;
    const valor = formatCurrency(contrato.valor);

    const row = document.createElement('tr');
    row.innerHTML = `
        <td><span class="contrato-numero">${numero}</span></td>
        <td><span class="contrato-edital">${editalLabel}</span></td>
        <td>${orgao}</td>
        <td>${periodo}</td>
        <td><span class="contrato-valor">${valor}</span></td>
        <td><span class="status ${statusMeta.css}">${statusMeta.label}</span></td>
        <td>
            <button class="btn-icon" data-action="editar-contrato" data-id="${contrato.id}" title="Editar">
                <i class='bx bxs-edit'></i>
            </button>
            <button class="btn-icon danger" data-action="deletar-contrato" data-id="${contrato.id}" title="Excluir">
                <i class='bx bxs-trash'></i>
            </button>
        </td>
    `;
    return row;
}

// Build row for the DASHBOARD table (compact, no actions)
function buildContratoRow(contrato) {
    const statusMeta = getStatusMeta(contrato.status);
    const contratoNumero = contrato.numero ? `#${contrato.numero}` : `#${contrato.id}`;
    const contratoBadge = getBadgeText(contrato.numero || contrato.id);
    const contratoImage = `https://placehold.co/36x36/${statusMeta.color}/FFFFFF?text=${encodeURIComponent(contratoBadge)}`;
    const periodo = `${formatDate(contrato.dataInicio)} - ${formatDate(contrato.dataFim)}`;
    const orgao = contrato.orgao || 'Não informado';
    const municipio = contrato.editalMunicipio || '';
    const estado = contrato.editalEstado || '';
    const localidade = municipio && estado ? `${municipio} - ${estado}` : (municipio || estado || 'Não informado');

    const row = document.createElement('tr');

    const contratoCell = document.createElement('td');
    const image = document.createElement('img');
    image.src = contratoImage;
    image.alt = '';
    const label = document.createElement('p');
    label.textContent = contratoNumero;
    contratoCell.appendChild(image);
    contratoCell.appendChild(label);

    const orgaoCell = document.createElement('td');
    orgaoCell.textContent = orgao;

    const localidadeCell = document.createElement('td');
    localidadeCell.textContent = localidade;

    const periodoCell = document.createElement('td');
    periodoCell.textContent = periodo;

    const statusCell = document.createElement('td');
    const statusSpan = document.createElement('span');
    statusSpan.className = `status ${statusMeta.css}`;
    statusSpan.textContent = statusMeta.label;
    statusCell.appendChild(statusSpan);

    row.appendChild(contratoCell);
    row.appendChild(orgaoCell);
    row.appendChild(localidadeCell);
    row.appendChild(periodoCell);
    row.appendChild(statusCell);

    return row;
}

function updateContratosResumo() {
    const total = contratosCache.length;
    const ativos = contratosCache.filter(c => (c.status || '').toLowerCase() === 'ativo').length;
    const suspensos = contratosCache.filter(c => (c.status || '').toLowerCase() === 'suspenso').length;
    const encerrados = contratosCache.filter(c => ['encerrado', 'cancelado'].includes((c.status || '').toLowerCase())).length;

    const elTotal = document.getElementById('contratosResumoTotal');
    const elAtivos = document.getElementById('contratosResumoAtivos');
    const elSuspensos = document.getElementById('contratosResumoSuspensos');
    const elEncerrados = document.getElementById('contratosResumoEncerrados');

    if (elTotal) elTotal.textContent = total;
    if (elAtivos) elAtivos.textContent = ativos;
    if (elSuspensos) elSuspensos.textContent = suspensos;
    if (elEncerrados) elEncerrados.textContent = encerrados;
}

function applyContratosFilters() {
    const statusFilter = (document.getElementById('contratosFilterStatus')?.value || '').toLowerCase();
    const editalFilter = document.getElementById('contratosFilterEdital')?.value || '';
    const buscaFilter = (document.getElementById('contratosFilterBusca')?.value || '').toLowerCase();

    const filtered = contratosCache.filter(c => {
        if (statusFilter && (c.status || '').toLowerCase() !== statusFilter) return false;
        if (editalFilter && String(c.editalId) !== editalFilter) return false;
        if (buscaFilter) {
            const searchable = [c.numero, c.orgao, c.responsavel, c.objeto, c.editalNumero].join(' ').toLowerCase();
            if (!searchable.includes(buscaFilter)) return false;
        }
        return true;
    });

    renderContratosPageTable(filtered);
}

function renderContratosPageTable(list) {
    if (!contratosPageTableBody) return;
    if (!list || list.length === 0) {
        contratosPageTableBody.innerHTML = '<tr><td colspan="7">Nenhum contrato encontrado.</td></tr>';
        return;
    }
    contratosPageTableBody.innerHTML = '';
    list.forEach(c => contratosPageTableBody.appendChild(buildContratoPageRow(c)));
}

async function loadEditaisForSelect() {
    try {
        const response = await fetch('/api/editais');
        if (!response.ok) throw new Error('Falha ao carregar editais');
        editaisCache = await response.json();

        // Populate modal select
        const select = document.getElementById('contratoEditalId');
        if (select) {
            select.innerHTML = '<option value="">Selecione o edital</option>';
            editaisCache.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = `${e.numero} - ${e.orgao || ''}`;
                select.appendChild(opt);
            });
        }

        // Populate filter select
        const filterSelect = document.getElementById('contratosFilterEdital');
        if (filterSelect) {
            filterSelect.innerHTML = '<option value="">Todos</option>';
            editaisCache.forEach(e => {
                const opt = document.createElement('option');
                opt.value = e.id;
                opt.textContent = e.numero;
                filterSelect.appendChild(opt);
            });
        }
    } catch (error) {
        console.error('Erro ao carregar editais:', error);
    }
}

async function loadContratos() {
    if (contratosPageTableBody) {
        contratosPageTableBody.innerHTML = '<tr><td colspan="7">Carregando contratos...</td></tr>';
    }

    try {
        const response = await fetch('/api/contratos');
        if (!response.ok) throw new Error('Falha ao carregar contratos');

        contratosCache = await response.json();
        if (!Array.isArray(contratosCache)) contratosCache = [];

        renderContratosPageTable(contratosCache);
        updateContratosResumo();

        // Also update dashboard table
        if (contratosTableBody) {
            if (contratosCache.length === 0) {
                contratosTableBody.innerHTML = '<tr><td colspan="5">Nenhum contrato cadastrado.</td></tr>';
            } else {
                contratosTableBody.innerHTML = '';
                contratosCache.forEach(c => contratosTableBody.appendChild(buildContratoRow(c)));
            }
        }
    } catch (error) {
        if (contratosPageTableBody) {
            contratosPageTableBody.innerHTML = '<tr><td colspan="7">Erro ao carregar contratos.</td></tr>';
        }
        if (contratosTableBody) {
            contratosTableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar contratos.</td></tr>';
        }
        console.error(error);
    }
}

// Alias for dashboard backward compat
async function loadContratosTable() {
    await loadContratos();
}

// Modal management
const contratoModal = document.getElementById('contratoModal');
const contratoForm = document.getElementById('contratoForm');
const contratoModalTitulo = document.getElementById('contratoModalTitulo');

function openContratoModal(contrato = null) {
    if (!contratoModal || !contratoForm) return;

    contratoForm.reset();
    document.getElementById('contratoId').value = '';
    document.getElementById('contratoStatus').value = 'ativo';

    if (contrato) {
        contratoModalTitulo.textContent = 'Editar contrato';
        document.getElementById('contratoId').value = contrato.id;
        document.getElementById('contratoEditalId').value = contrato.editalId;
        document.getElementById('contratoNumero').value = contrato.numero || '';
        document.getElementById('contratoObjeto').value = contrato.objeto || '';
        document.getElementById('contratoValor').value = numberToCurrency(contrato.valor);
        document.getElementById('contratoResponsavel').value = contrato.responsavel || '';
        document.getElementById('contratoDataInicio').value = contrato.dataInicio || '';
        document.getElementById('contratoDataFim').value = contrato.dataFim || '';
        document.getElementById('contratoStatus').value = contrato.status || 'ativo';
        document.getElementById('contratoObservacoes').value = contrato.observacoes || '';
    } else {
        contratoModalTitulo.textContent = 'Cadastro de contrato';
    }

    contratoModal.classList.add('show');
    contratoModal.setAttribute('aria-hidden', 'false');
}

function closeContratoModal() {
    if (!contratoModal) return;
    contratoModal.classList.remove('show');
    contratoModal.setAttribute('aria-hidden', 'true');
}

// Mascara de moeda brasileira
function maskCurrency(input) {
    let v = input.value.replace(/\D/g, '');
    if (!v) { input.value = ''; return; }
    v = (parseInt(v, 10) / 100).toFixed(2);
    v = v.replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    input.value = v;
}

function parseCurrencyToNumber(str) {
    if (!str) return null;
    return parseFloat(str.replace(/\./g, '').replace(',', '.')) || null;
}

function numberToCurrency(num) {
    if (!num && num !== 0) return '';
    return Number(num).toFixed(2).replace('.', ',').replace(/\B(?=(\d{3})+(?!\d))/g, '.');
}

document.getElementById('contratoValor')?.addEventListener('input', function () {
    maskCurrency(this);
});

// Event listeners
document.getElementById('abrirCadastroContrato')?.addEventListener('click', () => openContratoModal());
document.getElementById('fecharCadastroContrato')?.addEventListener('click', closeContratoModal);
document.getElementById('cancelarContrato')?.addEventListener('click', closeContratoModal);

contratoModal?.addEventListener('click', function (e) {
    if (e.target === contratoModal) closeContratoModal();
});

contratoForm?.addEventListener('submit', async function (e) {
    e.preventDefault();

    const id = document.getElementById('contratoId').value;
    const dados = {
        editalId: document.getElementById('contratoEditalId').value,
        numero: document.getElementById('contratoNumero').value,
        objeto: document.getElementById('contratoObjeto').value,
        valor: parseCurrencyToNumber(document.getElementById('contratoValor').value),
        responsavel: document.getElementById('contratoResponsavel').value,
        dataInicio: document.getElementById('contratoDataInicio').value,
        dataFim: document.getElementById('contratoDataFim').value,
        status: document.getElementById('contratoStatus').value,
        observacoes: document.getElementById('contratoObservacoes').value
    };

    try {
        const url = id ? `/api/contratos/${id}` : '/api/contratos';
        const method = id ? 'PUT' : 'POST';

        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(dados)
        });

        if (!response.ok) {
            const err = await response.json();
            throw new Error(err.erro || 'Erro ao salvar contrato');
        }

        closeContratoModal();
        await loadContratos();
    } catch (error) {
        alert(error.message);
        console.error(error);
    }
});

// Table action delegation (edit/delete)
contratosPageTableBody?.addEventListener('click', async function (e) {
    const btn = e.target.closest('button[data-action]');
    if (!btn) return;

    const action = btn.dataset.action;
    const id = btn.dataset.id;

    if (action === 'editar-contrato') {
        const contrato = contratosCache.find(c => String(c.id) === String(id));
        if (contrato) openContratoModal(contrato);
    }

    if (action === 'deletar-contrato') {
        if (!confirm('Deseja realmente excluir este contrato?')) return;
        try {
            const response = await fetch(`/api/contratos/${id}`, { method: 'DELETE' });
            if (!response.ok) throw new Error('Falha ao excluir contrato');
            await loadContratos();
        } catch (error) {
            console.error(error);
        }
    }
});

// Filters
document.getElementById('contratosFilterStatus')?.addEventListener('change', applyContratosFilters);
document.getElementById('contratosFilterEdital')?.addEventListener('change', applyContratosFilters);
document.getElementById('contratosFilterBusca')?.addEventListener('input', applyContratosFilters);

// ========== TODO ITEM INTERACTIONS ==========
// Permite marcar/desmarcar itens de pendências (futuro: salvar no backend)
const todoItems = document.querySelectorAll('.todo-list li');

todoItems.forEach(item => {
    item.addEventListener('click', function () {
        // Nota: Aqui será integrado com backend mais tarde
        // Por enquanto apenas visual feedback
        console.log('Item clicado:', this.querySelector('p').textContent);
    });
});

// ========== EDITAIS (CRUD) ==========
const editalForm = document.getElementById('editalForm');
const editalModal = document.getElementById('editalModal');
const editaisTableBody = document.getElementById('editaisTableBody');
const editalPdfInput = document.getElementById('editalPdfInput');
const editalPdfName = document.getElementById('editalPdfName');
const analisarEditalBtn = document.getElementById('analisarEditalBtn');
const editalNumero = document.getElementById('editalNumero');
const editalOrgao = document.getElementById('editalOrgao');
const editalTipoOrgao = document.getElementById('editalTipoOrgao');
const editalEstado = document.getElementById('editalEstado');
const editalMunicipio = document.getElementById('editalMunicipio');
const editalVigencia = document.getElementById('editalVigencia');
const editalObjeto = document.getElementById('editalObjeto');
const editalResumo = document.getElementById('editalResumo');
const editalStatus = document.getElementById('editalStatus');
const abrirCadastroEditalBtn = document.getElementById('abrirCadastroEdital');
const fecharCadastroEditalBtn = document.getElementById('fecharCadastroEdital');
const editalModalTitle = editalModal ? editalModal.querySelector('.modal-header h3') : null;
const editalModalSubmit = editalForm ? editalForm.querySelector('button[type="submit"]') : null;

let editaisFullCache = [];
let editingEditalId = null;

function getEditalStatusMeta(status) {
    const n = String(status || '').toLowerCase();
    if (n === 'aberto') return { label: 'Aberto', css: 'active' };
    if (n === 'em_analise' || n === 'em análise') return { label: 'Em análise', css: 'process' };
    if (n === 'adjudicado') return { label: 'Adjudicado', css: 'completed' };
    if (n === 'encerrado') return { label: 'Encerrado', css: 'pending' };
    if (n === 'cancelado') return { label: 'Cancelado', css: 'pending' };
    return { label: status || 'Aberto', css: 'active' };
}

function formatEditalLocal(edital) {
    const mun = edital.municipio || '';
    const uf = edital.estado || '';
    if (mun && uf) return `${mun} - ${uf}`;
    return mun || uf || '-';
}

function buildEditalRow(edital) {
    const row = document.createElement('tr');
    const sm = getEditalStatusMeta(edital.status);
    let pncpTag = '';
    if (edital.pncpNumeroControle) {
        // numeroControlePNCP formato: "18291351000164-1-000329/2025"
        // URL correta: /app/editais/{cnpj}/{ano}/{sequencial}
        const m = edital.pncpNumeroControle.match(/^(\d+)-\d+-0*(\d+)\/(\d+)$/);
        const pncpUrl = m
            ? `https://pncp.gov.br/app/editais/${m[1]}/${m[3]}/${m[2]}`
            : `https://pncp.gov.br/app/editais`;
        pncpTag = ` <a href="${pncpUrl}" target="_blank" rel="noopener" class="pncp-badge-importado" style="font-size:10px;text-decoration:none;" title="Ver no portal PNCP"><i class="bx bxs-cloud-download"></i> PNCP</a>`;
    }

    row.innerHTML = `
        <td>${edital.numero || '-'}${pncpTag}</td>
        <td>${edital.orgao || '-'}</td>
        <td>${formatEditalLocal(edital)}</td>
        <td>${edital.vigencia || '-'}</td>
        <td><span class="status ${sm.css}">${sm.label}</span></td>
        <td>
            <div class="actions">
                <button class="btn-icon" data-action="view" data-id="${edital.id}" title="Visualizar">
                    <i class='bx bxs-show'></i>
                </button>
                <button class="btn-icon" data-action="edit" data-id="${edital.id}" title="Editar">
                    <i class='bx bxs-edit'></i>
                </button>
                <button class="btn-icon danger" data-action="delete" data-id="${edital.id}" title="Excluir">
                    <i class='bx bxs-trash'></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

function renderEditaisTable(items) {
    if (!editaisTableBody) return;
    if (!items || items.length === 0) {
        editaisTableBody.innerHTML = '<tr><td colspan="6">Nenhum edital cadastrado.</td></tr>';
        return;
    }
    editaisTableBody.innerHTML = '';
    items.forEach(e => editaisTableBody.appendChild(buildEditalRow(e)));
}

function updateEditaisSummary(items) {
    const total = items.length;
    const abertos = items.filter(e => (e.status || 'aberto') === 'aberto').length;
    const analise = items.filter(e => e.status === 'em_analise').length;
    const encerrados = items.filter(e => e.status === 'encerrado' || e.status === 'cancelado').length;
    const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    el('editaisResumoTotal', total);
    el('editaisResumoAbertos', abertos);
    el('editaisResumoAnalise', analise);
    el('editaisResumoEncerrados', encerrados);
}

function applyEditaisFilters() {
    const statusFilter = document.getElementById('editaisFilterStatus')?.value || '';
    const buscaFilter = (document.getElementById('editaisFilterBusca')?.value || '').toLowerCase();

    const filtered = editaisFullCache.filter(e => {
        if (statusFilter && (e.status || 'aberto') !== statusFilter) return false;
        if (buscaFilter) {
            const searchable = [e.numero, e.orgao, e.objeto, e.municipio, e.estado].join(' ').toLowerCase();
            if (!searchable.includes(buscaFilter)) return false;
        }
        return true;
    });
    renderEditaisTable(filtered);
}

async function loadEditais() {
    if (!editaisTableBody) return;
    editaisTableBody.innerHTML = '<tr><td colspan="6">Carregando editais...</td></tr>';
    try {
        const response = await fetch('/api/editais');
        if (!response.ok) throw new Error('Falha ao carregar editais');
        const editais = await response.json();
        editaisFullCache = Array.isArray(editais) ? editais : [];
        // Also update the editaisCache used by contratos
        editaisCache = editaisFullCache;
        updateEditaisSummary(editaisFullCache);
        applyEditaisFilters();
    } catch (error) {
        editaisTableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar editais.</td></tr>';
        console.error(error);
    }
}

function openEditalModal(edital = null) {
    if (!editalForm || !editalModal) return;
    if (edital) {
        editingEditalId = edital.id;
        if (editalModalTitle) editalModalTitle.textContent = 'Editar edital';
        if (editalModalSubmit) editalModalSubmit.textContent = 'Atualizar edital';
        if (editalNumero) editalNumero.value = edital.numero || '';
        if (editalOrgao) editalOrgao.value = edital.orgao || '';
        if (editalTipoOrgao) editalTipoOrgao.value = edital.tipoOrgao || 'Município';
        if (editalEstado) editalEstado.value = edital.estado || '';
        if (editalMunicipio) editalMunicipio.value = edital.municipio || '';
        if (editalVigencia) editalVigencia.value = edital.vigencia || '';
        if (editalObjeto) editalObjeto.value = edital.objeto || '';
        if (editalResumo) editalResumo.value = edital.resumo || '';
        if (editalStatus) editalStatus.value = edital.status || 'aberto';
    } else {
        editingEditalId = null;
        editalForm.reset();
        if (editalStatus) editalStatus.value = 'aberto';
        if (editalModalTitle) editalModalTitle.textContent = 'Cadastro de edital';
        if (editalModalSubmit) editalModalSubmit.textContent = 'Salvar edital';
    }
    if (editalPdfName) editalPdfName.textContent = 'Importar PDF do edital';
    if (editalPdfInput) editalPdfInput.value = '';
    editalModal.classList.add('show');
    editalModal.setAttribute('aria-hidden', 'false');
}

function closeEditalModal() {
    if (!editalModal) return;
    editalModal.classList.remove('show');
    editalModal.setAttribute('aria-hidden', 'true');
}

// PDF upload + AI fill
if (editalPdfInput && editalPdfName) {
    editalPdfInput.addEventListener('change', () => {
        const file = editalPdfInput.files && editalPdfInput.files[0];
        editalPdfName.textContent = file ? file.name : 'Importar PDF do edital';
    });
}

if (analisarEditalBtn) {
    analisarEditalBtn.addEventListener('click', async () => {
        const file = editalPdfInput && editalPdfInput.files ? editalPdfInput.files[0] : null;
        if (!file) {
            alert('Selecione um PDF para analisar.');
            return;
        }
        analisarEditalBtn.disabled = true;
        analisarEditalBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Analisando...';
        const formData = new FormData();
        formData.append('editalPdf', file);
        try {
            const response = await fetch('/api/editais/analisar', { method: 'POST', body: formData });
            if (!response.ok) throw new Error('Falha ao analisar');
            const data = await response.json();
            // Fill form fields from AI result
            if (editalNumero && data.numero) editalNumero.value = data.numero;
            if (editalOrgao && data.orgao) editalOrgao.value = data.orgao;
            if (editalTipoOrgao && data.tipoOrgao) editalTipoOrgao.value = data.tipoOrgao;
            if (editalEstado && data.estado) editalEstado.value = data.estado;
            if (editalMunicipio && data.municipio) editalMunicipio.value = data.municipio;
            if (editalVigencia && data.vigencia) editalVigencia.value = data.vigencia;
            if (editalObjeto && data.objeto) editalObjeto.value = data.objeto;
            if (editalResumo && data.resumo) editalResumo.value = data.resumo;
        } catch (err) {
            console.error(err);
            alert('Erro ao analisar PDF.');
        } finally {
            analisarEditalBtn.disabled = false;
            analisarEditalBtn.innerHTML = '<i class="bx bxs-analyse"></i> Analisar PDF';
        }
    });
}

// Form submit
if (editalForm) {
    editalForm.addEventListener('submit', async (event) => {
        event.preventDefault();
        const payload = {
            numero: editalNumero ? editalNumero.value.trim() : '',
            orgao: editalOrgao ? editalOrgao.value.trim() : '',
            tipoOrgao: editalTipoOrgao ? editalTipoOrgao.value : 'Município',
            estado: editalEstado ? editalEstado.value.trim().toUpperCase() : '',
            municipio: editalMunicipio ? editalMunicipio.value.trim() : '',
            vigencia: editalVigencia ? editalVigencia.value.trim() : '',
            objeto: editalObjeto ? editalObjeto.value.trim() : '',
            resumo: editalResumo ? editalResumo.value.trim() : '',
            status: editalStatus ? editalStatus.value : 'aberto'
        };
        try {
            const endpoint = editingEditalId ? `/api/editais/${editingEditalId}` : '/api/editais';
            const method = editingEditalId ? 'PUT' : 'POST';
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });
            if (!response.ok) throw new Error('Falha ao salvar edital');
            editalForm.reset();
            editingEditalId = null;
            closeEditalModal();
            await loadEditais();
            // Refresh contratos edital selects
            await loadEditaisForSelect();
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar edital.');
        }
    });
}

// Open/close modal
if (abrirCadastroEditalBtn) {
    abrirCadastroEditalBtn.addEventListener('click', (e) => {
        e.preventDefault();
        openEditalModal();
    });
}

if (fecharCadastroEditalBtn) {
    fecharCadastroEditalBtn.addEventListener('click', () => closeEditalModal());
}

if (editalModal) {
    editalModal.addEventListener('click', (e) => {
        if (e.target === editalModal) closeEditalModal();
    });
}

// ── Edital View Modal ──
const editalViewModal = document.getElementById('editalViewModal');
const editalViewConteudo = document.getElementById('editalViewConteudo');
let editalViewAtual = null;

function openEditalViewModal(edital) {
    editalViewAtual = edital;
    if (!editalViewModal || !editalViewConteudo) return;
    const sm = getEditalStatusMeta(edital.status);
    const local = formatEditalLocal(edital);
    const tipoOrgaoMap = { 'Município': 'Município', 'Municipio': 'Município', 'Estado': 'Estado', 'Federal': 'Federal' };
    const tipoOrgao = tipoOrgaoMap[edital.tipoOrgao] || edital.tipoOrgao || '-';

    let pncpLink = '';
    if (edital.pncpNumeroControle) {
        const m = edital.pncpNumeroControle.match(/^(\d+)-\d+-0*(\d+)\/(\d+)$/);
        const pncpUrl = m
            ? `https://pncp.gov.br/app/editais/${m[1]}/${m[3]}/${m[2]}`
            : `https://pncp.gov.br/app/editais`;
        pncpLink = `<a href="${pncpUrl}" target="_blank" rel="noopener" class="pncp-badge-importado" style="font-size:12px;text-decoration:none;"><i class="bx bxs-cloud-download"></i> Ver no PNCP</a>`;
    }

    editalViewConteudo.innerHTML = `
        <div class="edital-view-grid">
            <div class="edital-view-item">
                <span class="edital-view-label">Número</span>
                <span class="edital-view-value">${edital.numero || '-'}</span>
            </div>
            <div class="edital-view-item">
                <span class="edital-view-label">Status</span>
                <span class="edital-view-value"><span class="status ${sm.css}">${sm.label}</span></span>
            </div>
            <div class="edital-view-item">
                <span class="edital-view-label">Órgão</span>
                <span class="edital-view-value">${edital.orgao || '-'}</span>
            </div>
            <div class="edital-view-item">
                <span class="edital-view-label">Tipo de órgão</span>
                <span class="edital-view-value">${tipoOrgao}</span>
            </div>
            <div class="edital-view-item">
                <span class="edital-view-label">UF / Município</span>
                <span class="edital-view-value">${local || '-'}</span>
            </div>
            <div class="edital-view-item">
                <span class="edital-view-label">Vigência</span>
                <span class="edital-view-value">${edital.vigencia || '-'}</span>
            </div>
            <div class="edital-view-item full">
                <span class="edital-view-label">Objeto</span>
                <span class="edital-view-value">${edital.objeto || '-'}</span>
            </div>
            <div class="edital-view-item full">
                <span class="edital-view-label">Resumo / Observações</span>
                <span class="edital-view-value">${edital.resumo || '-'}</span>
            </div>
            <div class="edital-view-item full">
                <span class="edital-view-label">Links</span>
                <span class="edital-view-value edital-view-links">
                    ${pncpLink ? `<span>${pncpLink}</span>` : ''}
                    ${edital.linkSistemaOrigem ? `<a href="${edital.linkSistemaOrigem}" target="_blank" rel="noopener" class="sistema-origem-badge" style="font-size:12px;text-decoration:none;"><i class='bx bx-link-external'></i> Sistema de Origem</a>` : ''}
                    ${!pncpLink && !edital.linkSistemaOrigem ? '-' : ''}
                </span>
            </div>
            ${edital.pdfNome ? `<div class="edital-view-item full">
                <span class="edital-view-label">PDF anexado</span>
                <span class="edital-view-value"><i class='bx bxs-file-pdf' style="color:#e74c3c;"></i> ${edital.pdfNome}</span>
            </div>` : ''}
        </div>
    `;

    editalViewModal.classList.add('show');
    editalViewModal.setAttribute('aria-hidden', 'false');
}

function closeEditalViewModal() {
    if (!editalViewModal) return;
    editalViewModal.classList.remove('show');
    editalViewModal.setAttribute('aria-hidden', 'true');
    editalViewAtual = null;
}

document.getElementById('fecharViewEdital')?.addEventListener('click', closeEditalViewModal);
document.getElementById('editalViewFecharBtn')?.addEventListener('click', closeEditalViewModal);
document.getElementById('editalViewEditarBtn')?.addEventListener('click', () => {
    if (editalViewAtual) {
        closeEditalViewModal();
        openEditalModal(editalViewAtual);
    }
});
if (editalViewModal) {
    editalViewModal.addEventListener('click', (e) => {
        if (e.target === editalViewModal) closeEditalViewModal();
    });
}

// Filters
document.getElementById('editaisFilterStatus')?.addEventListener('change', applyEditaisFilters);
document.getElementById('editaisFilterBusca')?.addEventListener('input', applyEditaisFilters);

// Table actions (view/edit/delete)
if (editaisTableBody) {
    editaisTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const id = button.dataset.id;
        if (action === 'view') {
            const edital = editaisFullCache.find(item => String(item.id) === String(id));
            if (edital) openEditalViewModal(edital);
        }
        if (action === 'edit') {
            const edital = editaisFullCache.find(item => String(item.id) === String(id));
            if (edital) openEditalModal(edital);
        }
        if (action === 'delete') {
            if (!confirm('Deseja excluir este edital?')) return;
            try {
                const response = await fetch(`/api/editais/${id}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir');
                await loadEditais();
                await loadEditaisForSelect();
            } catch (err) {
                console.error(err);
                alert('Erro ao excluir edital.');
            }
        }
    });
}

// ========== MEDICOS (CADASTRO) ==========
const medicoForm = document.getElementById('medicoForm');
const medicosTableBody = document.getElementById('medicosTableBody');
const medicoNome = document.getElementById('medicoNome');
const medicoEspecialidade = document.getElementById('medicoEspecialidade');
const medicoCrm = document.getElementById('medicoCrm');
const medicoTelefone = document.getElementById('medicoTelefone');
const medicoEmail = document.getElementById('medicoEmail');
const medicoUf = document.getElementById('medicoUf');
const medicoCidade = document.getElementById('medicoCidade');
const medicoStatus = document.getElementById('medicoStatus');
const medicoFotoInput = document.getElementById('medicoFotoInput');
const medicoFotoPreview = document.getElementById('medicoFotoPreview');
let medicoFotoFile = null;
const abrirCadastroMedico = document.getElementById('abrirCadastroMedico');
const fecharCadastroMedico = document.getElementById('fecharCadastroMedico');
const medicoModal = document.getElementById('medicoModal');
const medicoModalTitle = medicoModal ? medicoModal.querySelector('.modal-header h3') : null;
const medicoModalSubmit = medicoForm ? medicoForm.querySelector('button[type="submit"]') : null;
const medicosFilterEspecialidade = document.getElementById('medicosFilterEspecialidade');
const medicosFilterStatus = document.getElementById('medicosFilterStatus');
let medicosCache = [];
let editingMedicoId = null;

// Photo preview click and file change handlers
if (medicoFotoPreview) {
    medicoFotoPreview.addEventListener('click', () => {
        if (medicoFotoInput) medicoFotoInput.click();
    });
}

if (medicoFotoInput) {
    medicoFotoInput.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (!file) return;
        medicoFotoFile = file;
        const reader = new FileReader();
        reader.onload = (ev) => {
            if (medicoFotoPreview) {
                medicoFotoPreview.innerHTML = '';
                medicoFotoPreview.style.backgroundImage = `url('${ev.target.result}')`;
            }
        };
        reader.readAsDataURL(file);
    });
}

function resetFotoPreview() {
    medicoFotoFile = null;
    if (medicoFotoInput) medicoFotoInput.value = '';
    if (medicoFotoPreview) {
        medicoFotoPreview.style.backgroundImage = '';
        medicoFotoPreview.innerHTML = `<i class='bx bxs-camera'></i><span>Adicionar foto</span>`;
    }
}

function setFotoPreview(url) {
    if (medicoFotoPreview) {
        medicoFotoPreview.innerHTML = '';
        medicoFotoPreview.style.backgroundImage = `url('${url}')`;
    }
}

async function uploadMedicoFoto(medicoId) {
    if (!medicoFotoFile || !medicoId) return;
    const formData = new FormData();
    formData.append('foto', medicoFotoFile);
    try {
        await fetch(`/api/medicos/${medicoId}/foto`, { method: 'POST', body: formData });
    } catch (err) {
        console.error('Erro ao enviar foto:', err);
    }
    medicoFotoFile = null;
}

function formatMedicoLocal(medico) {
    const cidade = medico.municipio || '';
    const uf = medico.uf || '';
    if (cidade && uf) return `${cidade} - ${uf}`;
    return cidade || uf || 'Não informado';
}

function buildMedicoRow(medico) {
    const row = document.createElement('tr');
    const statusLabel = medico.status ? medico.status : 'ativo';
    const avatarHtml = medico.foto
        ? `<img src="${medico.foto}" class="medico-avatar" alt="">`
        : `<span class="medico-avatar medico-avatar-placeholder"><i class='bx bxs-user'></i></span>`;

    row.innerHTML = `
        <td><div class="medico-nome-cell">${avatarHtml}<span>${medico.nome || ''}</span></div></td>
        <td>${medico.especialidade || ''}</td>
        <td>${medico.crm || 'Não informado'}</td>
        <td>${formatMedicoLocal(medico)}</td>
        <td>${statusLabel}</td>
        <td>
            <div class="actions">
                <button class="btn-icon" data-action="edit" data-id="${medico.id}" title="Editar">
                    <i class='bx bxs-edit'></i>
                </button>
                <button class="btn-icon danger" data-action="delete" data-id="${medico.id}" title="Excluir">
                    <i class='bx bxs-trash'></i>
                </button>
            </div>
        </td>
    `;

    return row;
}

function renderMedicosTable(items) {
    if (!medicosTableBody) return;
    if (!items || items.length === 0) {
        medicosTableBody.innerHTML = '<tr><td colspan="6">Nenhum médico cadastrado.</td></tr>';
        return;
    }

    medicosTableBody.innerHTML = '';
    items.forEach(medico => {
        medicosTableBody.appendChild(buildMedicoRow(medico));
    });
}

function updateMedicosFilters(items) {
    if (!medicosFilterEspecialidade) return;
    const specialties = [...new Set(items.map(m => m.especialidade).filter(Boolean))].sort();
    medicosFilterEspecialidade.innerHTML = '<option value="">Todas</option>';
    specialties.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        medicosFilterEspecialidade.appendChild(option);
    });
}

function applyMedicosFilters() {
    const especFilter = medicosFilterEspecialidade ? medicosFilterEspecialidade.value : '';
    const statusFilter = medicosFilterStatus ? medicosFilterStatus.value : '';

    const filtered = medicosCache.filter(medico => {
        const matchesEspecialidade = !especFilter || medico.especialidade === especFilter;
        const matchesStatus = !statusFilter || (medico.status || 'ativo') === statusFilter;
        return matchesEspecialidade && matchesStatus;
    });

    renderMedicosTable(filtered);
}

async function loadMedicos() {
    if (!medicosTableBody) return;

    medicosTableBody.innerHTML = '<tr><td colspan="6">Carregando médicos...</td></tr>';

    try {
        const response = await fetch('/api/medicos');
        if (!response.ok) {
            throw new Error('Falha ao carregar médicos');
        }

        const medicos = await response.json();
        medicosCache = Array.isArray(medicos) ? medicos : [];
        updateMedicosFilters(medicosCache);
        applyMedicosFilters();
    } catch (error) {
        medicosTableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar médicos.</td></tr>';
        console.error(error);
    }
}

function applyPhoneMask(value) {
    const digits = String(value || '').replace(/\D/g, '').slice(0, 11);
    if (digits.length === 0) return '';
    if (digits.length <= 2) return `(${digits}`;
    const ddd = digits.slice(0, 2);
    const rest = digits.slice(2);
    if (rest.length <= 4) return `(${ddd}) ${rest}`;
    if (rest.length <= 8) {
        return `(${ddd}) ${rest.slice(0, 4)}-${rest.slice(4)}`;
    }
    return `(${ddd}) ${rest.slice(0, 5)}-${rest.slice(5)}`;
}

function openMedicoModal(medico = null) {
    if (!medicoForm || !medicoModal) return;
    if (medico) {
        editingMedicoId = medico.id;
        if (medicoModalTitle) medicoModalTitle.textContent = 'Editar medico';
        if (medicoModalSubmit) medicoModalSubmit.textContent = 'Atualizar medico';
        if (medicoNome) medicoNome.value = medico.nome || '';
        if (medicoEspecialidade) medicoEspecialidade.value = medico.especialidade || '';
        if (medicoCrm) medicoCrm.value = medico.crm || '';
        if (medicoTelefone) medicoTelefone.value = applyPhoneMask(medico.telefone || '');
        if (medicoEmail) medicoEmail.value = medico.email || '';
        if (medicoUf) medicoUf.value = (medico.uf || '').toUpperCase();
        if (medicoCidade) medicoCidade.value = medico.municipio || '';
        if (medicoStatus) medicoStatus.value = medico.status || 'ativo';
        // Show existing photo
        if (medico.foto) {
            setFotoPreview(medico.foto);
        } else {
            resetFotoPreview();
        }
    } else {
        editingMedicoId = null;
        medicoForm.reset();
        resetFotoPreview();
        if (medicoStatus) medicoStatus.value = 'ativo';
        if (medicoModalTitle) medicoModalTitle.textContent = 'Cadastro de medicos';
        if (medicoModalSubmit) medicoModalSubmit.textContent = 'Salvar medico';
    }
    medicoModal.classList.add('show');
    medicoModal.setAttribute('aria-hidden', 'false');
}

function closeMedicoModal() {
    if (!medicoModal) return;
    medicoModal.classList.remove('show');
    medicoModal.setAttribute('aria-hidden', 'true');
}

if (medicoForm) {
    medicoForm.addEventListener('submit', async (event) => {
        event.preventDefault();

        const payload = {
            nome: medicoNome ? medicoNome.value.trim() : '',
            especialidade: medicoEspecialidade ? medicoEspecialidade.value.trim() : '',
            crm: medicoCrm ? medicoCrm.value.trim() : '',
            telefone: medicoTelefone ? medicoTelefone.value.trim() : '',
            email: medicoEmail ? medicoEmail.value.trim() : '',
            uf: medicoUf ? medicoUf.value.trim().toUpperCase() : '',
            municipio: medicoCidade ? medicoCidade.value.trim() : '',
            status: medicoStatus ? medicoStatus.value : 'ativo'
        };

        try {
            const endpoint = editingMedicoId ? `/api/medicos/${editingMedicoId}` : '/api/medicos';
            const method = editingMedicoId ? 'PUT' : 'POST';
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar medico');
            }

            const saved = await response.json();

            // Upload photo if selected
            const savedId = editingMedicoId || saved.id;
            if (medicoFotoFile && savedId) {
                await uploadMedicoFoto(savedId);
            }

            medicoForm.reset();
            resetFotoPreview();
            if (medicoStatus) {
                medicoStatus.value = 'ativo';
            }
            editingMedicoId = null;
            closeMedicoModal();

            await loadMedicos();
        } catch (error) {
            console.error(error);
        }
    });
}

if (abrirCadastroMedico && medicoModal) {
    abrirCadastroMedico.addEventListener('click', () => {
        openMedicoModal();
    });
}

if (fecharCadastroMedico && medicoModal) {
    fecharCadastroMedico.addEventListener('click', () => {
        closeMedicoModal();
    });
}

if (medicoModal) {
    medicoModal.addEventListener('click', (event) => {
        if (event.target === medicoModal) {
            closeMedicoModal();
        }
    });
}

if (medicoTelefone) {
    medicoTelefone.addEventListener('input', (event) => {
        const masked = applyPhoneMask(event.target.value);
        event.target.value = masked;
    });
}

if (medicosFilterEspecialidade) {
    medicosFilterEspecialidade.addEventListener('change', applyMedicosFilters);
}

if (medicosFilterStatus) {
    medicosFilterStatus.addEventListener('change', applyMedicosFilters);
}

if (medicosTableBody) {
    medicosTableBody.addEventListener('click', async (event) => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;

        const action = button.dataset.action;
        const medicoId = button.dataset.id;
        if (action === 'edit' && medicoId) {
            const medico = medicosCache.find(item => String(item.id) === String(medicoId));
            if (medico) {
                openMedicoModal(medico);
            }
            return;
        }
        if (action === 'delete' && medicoId) {
            const confirmDelete = window.confirm('Deseja excluir este medico?');
            if (!confirmDelete) return;

            try {
                const response = await fetch(`/api/medicos/${medicoId}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Falha ao excluir medico');
                }
                await loadMedicos();
            } catch (error) {
                console.error(error);
            }
        }
    });
}

// ========== PLANTOES (GESTAO) ==========
const plantoesTableBody = document.getElementById('plantoesTableBody');
const plantoesFilterStatus = document.getElementById('plantoesFilterStatus');
const plantoesFilterEspecialidade = document.getElementById('plantoesFilterEspecialidade');
const plantoesFilterPeriodo = document.getElementById('plantoesFilterPeriodo');
const plantoesResumoConcluidos = document.getElementById('plantoesResumoConcluidos');
const plantoesResumoHoje = document.getElementById('plantoesResumoHoje');
const plantoesResumoAgendados = document.getElementById('plantoesResumoAgendados');
const abrirCadastroPlantaoButtons = document.querySelectorAll('.abrir-cadastro-plantao');
const fecharCadastroPlantao = document.getElementById('fecharCadastroPlantao');
const plantaoModal = document.getElementById('plantaoModal');
const plantaoForm = document.getElementById('plantaoForm');
const plantaoContrato = document.getElementById('plantaoContrato');
const plantaoMedico = document.getElementById('plantaoMedico');
const plantaoData = document.getElementById('plantaoData');
const plantaoCargaHoraria = document.getElementById('plantaoCargaHoraria');
let plantoesCache = [];
let editingPlantaoId = null;

function getPlantaoStatus(data) {
    const parsed = new Date(data);
    if (Number.isNaN(parsed.getTime())) {
        return { label: 'Agendado', css: 'pending', key: 'agendado' };
    }
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    parsed.setHours(0, 0, 0, 0);
    if (parsed.getTime() === today.getTime()) {
        return { label: 'Hoje', css: 'process', key: 'hoje' };
    }
    if (parsed.getTime() < today.getTime()) {
        return { label: 'Concluído', css: 'completed', key: 'concluido' };
    }
    return { label: 'Agendado', css: 'pending', key: 'agendado' };
}

function formatPlantaoLocal(plantao) {
    const cidade = plantao.municipio || '';
    const uf = plantao.uf || '';
    if (cidade && uf) return `${cidade} - ${uf}`;
    return cidade || uf || 'Não informado';
}

function buildPlantaoRow(plantao) {
    const row = document.createElement('tr');
    const statusMeta = getPlantaoStatus(plantao.data);
    const contratoLabel = plantao.contratoNumero ? `#${plantao.contratoNumero}` : 'Não vinculado';
    row.innerHTML = `
        <td>${contratoLabel}</td>
        <td>${formatDate(plantao.data)}</td>
        <td>${plantao.nome || 'Não informado'}</td>
        <td>${plantao.especialidade || 'Não informado'}</td>
        <td>${formatPlantaoLocal(plantao)}</td>
        <td><span class="status ${statusMeta.css}">${statusMeta.label}</span></td>
        <td>
            <div class="actions">
                <button class="btn-icon" data-action="edit" data-id="${plantao.id}" title="Editar">
                    <i class='bx bxs-edit'></i>
                </button>
                <button class="btn-icon danger" data-action="delete" data-id="${plantao.id}" title="Cancelar">
                    <i class='bx bxs-trash'></i>
                </button>
            </div>
        </td>
    `;
    return row;
}

function renderPlantoesTable(items) {
    if (!plantoesTableBody) return;
    if (!items || items.length === 0) {
        plantoesTableBody.innerHTML = '<tr><td colspan="7">Nenhum plantão cadastrado.</td></tr>';
        return;
    }

    plantoesTableBody.innerHTML = '';
    items.forEach(plantao => {
        plantoesTableBody.appendChild(buildPlantaoRow(plantao));
    });
}

function updatePlantoesFilters(items) {
    if (!plantoesFilterEspecialidade) return;
    const specialties = [...new Set(items.map(p => p.especialidade).filter(Boolean))].sort();
    plantoesFilterEspecialidade.innerHTML = '<option value="">Todas</option>';
    specialties.forEach(spec => {
        const option = document.createElement('option');
        option.value = spec;
        option.textContent = spec;
        plantoesFilterEspecialidade.appendChild(option);
    });
}

function parseDateInput(value) {
    const trimmed = String(value || '').trim();
    if (!trimmed) return null;
    const isoMatch = trimmed.match(/^(\d{4})-(\d{2})-(\d{2})$/);
    if (isoMatch) {
        return new Date(`${isoMatch[1]}-${isoMatch[2]}-${isoMatch[3]}T00:00:00`);
    }
    const brMatch = trimmed.match(/^(\d{2})\/(\d{2})(?:\/(\d{4}))?$/);
    if (brMatch) {
        const year = brMatch[3] ? Number(brMatch[3]) : new Date().getFullYear();
        const month = Number(brMatch[2]) - 1;
        const day = Number(brMatch[1]);
        return new Date(year, month, day);
    }
    return null;
}

function parseDateRange(value) {
    const raw = String(value || '').trim();
    if (!raw) return { start: null, end: null };
    const parts = raw.split('-').map(part => part.trim()).filter(Boolean);
    const start = parts[0] ? parseDateInput(parts[0]) : null;
    const end = parts[1] ? parseDateInput(parts[1]) : null;
    return { start, end };
}

function applyPlantoesFilters() {
    const statusFilter = plantoesFilterStatus ? plantoesFilterStatus.value : '';
    const especFilter = plantoesFilterEspecialidade ? plantoesFilterEspecialidade.value : '';
    const periodoFilter = plantoesFilterPeriodo ? plantoesFilterPeriodo.value : '';
    const range = parseDateRange(periodoFilter);

    const filtered = plantoesCache.filter(plantao => {
        const statusMeta = getPlantaoStatus(plantao.data);
        const matchesStatus = !statusFilter || statusMeta.key === statusFilter;
        const matchesEspecialidade = !especFilter || plantao.especialidade === especFilter;

        let matchesPeriodo = true;
        if (range.start || range.end) {
            const plantaoDate = parseDateInput(plantao.data) || new Date(plantao.data);
            if (Number.isNaN(plantaoDate.getTime())) {
                matchesPeriodo = false;
            } else {
                if (range.start && plantaoDate < range.start) matchesPeriodo = false;
                if (range.end && plantaoDate > range.end) matchesPeriodo = false;
            }
        }

        return matchesStatus && matchesEspecialidade && matchesPeriodo;
    });

    renderPlantoesTable(filtered);
}

function updatePlantoesResumo(items) {
    if (!plantoesResumoConcluidos || !plantoesResumoHoje || !plantoesResumoAgendados) return;
    const counts = { concluido: 0, hoje: 0, agendado: 0 };
    items.forEach(plantao => {
        const statusMeta = getPlantaoStatus(plantao.data);
        counts[statusMeta.key] = (counts[statusMeta.key] || 0) + 1;
    });
    plantoesResumoConcluidos.textContent = counts.concluido || 0;
    plantoesResumoHoje.textContent = counts.hoje || 0;
    plantoesResumoAgendados.textContent = counts.agendado || 0;
}

async function loadPlantoes() {
    if (!plantoesTableBody) return;
    plantoesTableBody.innerHTML = '<tr><td colspan="7">Carregando plantões...</td></tr>';

    try {
        const response = await fetch('/api/plantoes');
        if (!response.ok) {
            throw new Error('Falha ao carregar plantões');
        }
        const plantoes = await response.json();
        plantoesCache = Array.isArray(plantoes) ? plantoes : [];
        updatePlantoesFilters(plantoesCache);
        updatePlantoesResumo(plantoesCache);
        applyPlantoesFilters();
    } catch (error) {
        plantoesTableBody.innerHTML = '<tr><td colspan="7">Erro ao carregar plantões.</td></tr>';
        console.error(error);
    }
}

function syncPlantaoContratosOptions() {
    if (!plantaoContrato) return;
    const currentValue = plantaoContrato.value;
    plantaoContrato.innerHTML = '<option value="">Selecione</option>';
    contratosCache.forEach(contrato => {
        const option = document.createElement('option');
        option.value = contrato.id;
        const num = contrato.numero ? `#${contrato.numero}` : `#${contrato.id}`;
        const orgao = contrato.orgao || '';
        option.textContent = orgao ? `${num} - ${orgao}` : num;
        plantaoContrato.appendChild(option);
    });
    if (currentValue) {
        plantaoContrato.value = currentValue;
    }
}

function syncPlantaoMedicosOptions() {
    if (!plantaoMedico) return;
    const currentValue = plantaoMedico.value;
    plantaoMedico.innerHTML = '<option value="">Selecione</option>';
    medicosCache.forEach(medico => {
        const option = document.createElement('option');
        option.value = medico.id;
        option.textContent = `${medico.nome} (${medico.especialidade || 'Sem especialidade'})`;
        plantaoMedico.appendChild(option);
    });
    if (currentValue) {
        plantaoMedico.value = currentValue;
    }
}

function openPlantaoModal(plantao = null) {
    if (!plantaoModal || !plantaoForm) return;
    if (medicosCache.length === 0) {
        loadMedicos().then(syncPlantaoMedicosOptions).catch(() => {});
    } else {
        syncPlantaoMedicosOptions();
    }

    if (contratosCache.length === 0) {
        loadContratos().then(syncPlantaoContratosOptions).catch(() => {});
    } else {
        syncPlantaoContratosOptions();
    }

    if (plantao) {
        editingPlantaoId = plantao.id;
        if (plantaoContrato) plantaoContrato.value = plantao.contratoId || '';
        if (plantaoMedico) plantaoMedico.value = plantao.medicoId;
        if (plantaoData) plantaoData.value = String(plantao.data || '').slice(0, 10);
        if (plantaoCargaHoraria) plantaoCargaHoraria.value = plantao.cargaHoraria || '';
    } else {
        editingPlantaoId = null;
        plantaoForm.reset();
    }

    plantaoModal.classList.add('show');
    plantaoModal.setAttribute('aria-hidden', 'false');
}

function closePlantaoModal() {
    if (!plantaoModal) return;
    plantaoModal.classList.remove('show');
    plantaoModal.setAttribute('aria-hidden', 'true');
}

if (abrirCadastroPlantaoButtons.length) {
    abrirCadastroPlantaoButtons.forEach(button => {
        button.addEventListener('click', event => {
            event.preventDefault();
            openPlantaoModal();
        });
    });
}

if (fecharCadastroPlantao) {
    fecharCadastroPlantao.addEventListener('click', () => {
        closePlantaoModal();
    });
}

if (plantaoModal) {
    plantaoModal.addEventListener('click', event => {
        if (event.target === plantaoModal) {
            closePlantaoModal();
        }
    });
}

if (plantaoForm) {
    plantaoForm.addEventListener('submit', async event => {
        event.preventDefault();
        const payload = {
            contratoId: plantaoContrato ? Number(plantaoContrato.value) || null : null,
            medicoId: plantaoMedico ? Number(plantaoMedico.value) : null,
            data: plantaoData ? plantaoData.value : '',
            cargaHoraria: plantaoCargaHoraria ? Number(plantaoCargaHoraria.value) : null
        };

        try {
            const endpoint = editingPlantaoId ? `/api/plantoes/${editingPlantaoId}` : '/api/plantoes';
            const method = editingPlantaoId ? 'PUT' : 'POST';
            const response = await fetch(endpoint, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                throw new Error('Falha ao salvar plantao');
            }

            editingPlantaoId = null;
            plantaoForm.reset();
            closePlantaoModal();
            await loadPlantoes();
        } catch (error) {
            console.error(error);
        }
    });
}

if (plantoesTableBody) {
    plantoesTableBody.addEventListener('click', async event => {
        const button = event.target.closest('button[data-action]');
        if (!button) return;
        const action = button.dataset.action;
        const plantaoId = button.dataset.id;

        if (action === 'edit' && plantaoId) {
            const plantao = plantoesCache.find(item => String(item.id) === String(plantaoId));
            if (plantao) {
                openPlantaoModal(plantao);
            }
            return;
        }

        if (action === 'delete' && plantaoId) {
            const confirmDelete = window.confirm('Deseja cancelar este plantao?');
            if (!confirmDelete) return;
            try {
                const response = await fetch(`/api/plantoes/${plantaoId}`, { method: 'DELETE' });
                if (!response.ok) {
                    throw new Error('Falha ao cancelar plantao');
                }
                await loadPlantoes();
            } catch (error) {
                console.error(error);
            }
        }
    });
}

if (plantoesFilterStatus) {
    plantoesFilterStatus.addEventListener('change', applyPlantoesFilters);
}

if (plantoesFilterEspecialidade) {
    plantoesFilterEspecialidade.addEventListener('change', applyPlantoesFilters);
}

if (plantoesFilterPeriodo) {
    plantoesFilterPeriodo.addEventListener('input', applyPlantoesFilters);
}

// ========== PNCP - PORTAL NACIONAL DE CONTRATAÇÕES PÚBLICAS ==========
const pncpFilterForm = document.getElementById('pncpFilterForm');
const pncpTableBody = document.getElementById('pncpTableBody');
const pncpResultadosCard = document.getElementById('pncpResultadosCard');
const pncpPagination = document.getElementById('pncpPagination');
const pncpBuscarBtn = document.getElementById('pncpBuscarBtn');
const pncpLimparBtn = document.getElementById('pncpLimparBtn');
const pncpImportarTodosBtn = document.getElementById('pncpImportarTodosBtn');
const pncpDetalheModal = document.getElementById('pncpDetalheModal');
const pncpDetalheConteudo = document.getElementById('pncpDetalheConteudo');
const pncpImportarDetalheBtn = document.getElementById('pncpImportarDetalheBtn');

let pncpCache = [];              // Results from current search
let pncpCacheOriginal = [];      // Unsorted copy of results
let pncpCurrentPage = 1;
let pncpTotalPages = 0;
let pncpTotalRegistros = 0;
let pncpLastFilters = {};        // Last search params
let pncpDetalheAtual = null;     // Currently viewed contratação detail

// Map PNCP items to already-imported editais via pncpNumeroControle
function getPncpImportedSet() {
    const imported = new Set();
    (editaisFullCache || []).forEach(e => {
        if (e.pncpNumeroControle) imported.add(e.pncpNumeroControle);
    });
    return imported;
}

// Set default dates (last 30 days)
function initPncpDates() {
    const dataFinal = document.getElementById('pncpDataFinal');
    const dataInicial = document.getElementById('pncpDataInicial');
    if (dataFinal && !dataFinal.value) {
        const today = new Date();
        dataFinal.value = today.toISOString().split('T')[0];
    }
    if (dataInicial && !dataInicial.value) {
        const d = new Date();
        d.setDate(d.getDate() - 30);
        dataInicial.value = d.toISOString().split('T')[0];
    }
}

// Format currency BRL
function formatPncpValor(v) {
    if (v == null || v === '') return '-';
    return 'R$ ' + Number(v).toLocaleString('pt-BR', { minimumFractionDigits: 2, maximumFractionDigits: 2 });
}

// Format PNCP date
function formatPncpDate(d) {
    if (!d) return '-';
    try {
        return new Date(d).toLocaleDateString('pt-BR');
    } catch { return d; }
}

// Get situação label
function getSituacaoLabel(item) {
    return item.situacaoCompraNome || '-';
}

// Get situação CSS
function getSituacaoCss(item) {
    const id = item.situacaoCompraId;
    if (id === '1') return 'active';    // Divulgada
    if (id === '2') return 'process';   // Ativa
    if (id === '3') return 'pending';   // Suspensa
    if (id === '4') return 'pending';   // Revogada/Anulada
    return 'process';
}

// Get UF/Município from PNCP item
function formatPncpLocal(item) {
    const uf = item.unidadeOrgao?.ufSigla || '';
    const mun = item.unidadeOrgao?.municipioNome || '';
    if (mun && uf) return `${mun} - ${uf}`;
    return mun || uf || '-';
}

// Keywords that indicate medical-related contratações
const PNCP_MEDICO_KEYWORDS = /m[eé]dico|servi[cç]os?\s*m[eé]dic|m[aã]o[\s\-]*de[\s\-]*obra\s*m[eé]dic|sa[uú]de|hospitalar|plant[aã]o\s*m[eé]dic|atendimento\s*m[eé]dic|profissional\s*m[eé]dic|cl[ií]nic|ubs\b|upa\b|hospital|cirurgi|anestesi|emerg[eê]ncia\s*m[eé]dic/i;

function isPncpMedico(item) {
    const text = [
        item.objetoCompra,
        item.orgaoEntidade?.razaoSocial,
        item.informacaoComplementar
    ].filter(Boolean).join(' ');
    return PNCP_MEDICO_KEYWORDS.test(text);
}

// Build table row for a PNCP result
function buildPncpRow(item) {
    const row = document.createElement('tr');
    const imported = getPncpImportedSet();
    const numCtrl = item.numeroControlePNCP || '';
    const isImported = imported.has(numCtrl);
    const isMedico = isPncpMedico(item);

    if (isMedico) row.classList.add('pncp-row-medico');

    const badgeHtml = isImported
        ? '<span class="pncp-badge-importado"><i class="bx bx-check"></i> Importado</span>'
        : '<span class="pncp-badge-novo"><i class="bx bx-plus-circle"></i> Novo</span>';

    const medicoTag = isMedico ? '<span class="pncp-tag-medico"><i class="bx bxs-first-aid"></i> Médico</span>' : '';

    const sitLabel = getSituacaoLabel(item);
    const sitCss = getSituacaoCss(item);
    const orgao = item.orgaoEntidade?.razaoSocial || '-';
    const valorStr = formatPncpValor(item.valorTotalEstimado);
    const modalidade = item.modalidadeNome || '-';
    const numCompra = item.numeroCompra || item.numeroControlePNCP || '-';

    row.innerHTML = `
        <td>${badgeHtml}</td>
        <td>${numCompra}</td>
        <td class="pncp-objeto-cell" title="${orgao}">${orgao}${medicoTag}</td>
        <td>${formatPncpLocal(item)}</td>
        <td>${modalidade}</td>
        <td class="pncp-valor">${valorStr}</td>
        <td><span class="status ${sitCss}">${sitLabel}</span></td>
        <td>
            <div class="actions">
                <button class="btn-icon" data-pncp-action="ver" title="Ver detalhes">
                    <i class='bx bxs-show'></i>
                </button>
                ${isImported ? '' : `<button class="btn-icon" data-pncp-action="importar" title="Importar como edital">
                    <i class='bx bxs-download'></i>
                </button>`}
            </div>
        </td>
    `;

    // Store item data on row
    row._pncpItem = item;
    return row;
}

// Sort PNCP results
let pncpSortField = '';
let pncpSortDir = '';   // 'asc' | 'desc'

function sortPncpCache(field, dir) {
    if (!field) {
        pncpCache = [...pncpCacheOriginal];
    } else {
        pncpCache = [...pncpCacheOriginal];
        const asc = dir === 'asc' ? 1 : -1;
        pncpCache.sort((a, b) => {
            if (field === 'valor') return asc * ((a.valorTotalEstimado || 0) - (b.valorTotalEstimado || 0));
            if (field === 'orgao') return asc * (a.orgaoEntidade?.razaoSocial || '').localeCompare(b.orgaoEntidade?.razaoSocial || '', 'pt-BR');
            if (field === 'municipio') return asc * formatPncpLocal(a).localeCompare(formatPncpLocal(b), 'pt-BR');
            return 0;
        });
    }
    renderPncpTable(pncpCache);
    updatePncpSortIcons();
}

function updatePncpSortIcons() {
    const table = document.getElementById('pncpTable');
    if (!table) return;
    table.querySelectorAll('th.sortable').forEach(th => {
        const icon = th.querySelector('.sort-icon');
        if (!icon) return;
        const f = th.dataset.sort;
        if (f === pncpSortField) {
            icon.className = pncpSortDir === 'asc' ? 'bx bx-sort-up sort-icon active' : 'bx bx-sort-down sort-icon active';
        } else {
            icon.className = 'bx bx-sort-alt-2 sort-icon';
        }
    });
}

function handlePncpHeaderSort(field) {
    if (pncpSortField === field) {
        if (pncpSortDir === 'desc') { pncpSortDir = 'asc'; }
        else if (pncpSortDir === 'asc') { pncpSortField = ''; pncpSortDir = ''; }
    } else {
        pncpSortField = field;
        pncpSortDir = 'desc';
    }
    sortPncpCache(pncpSortField, pncpSortDir);
}

// Render PNCP results table
function renderPncpTable(items) {
    if (!pncpTableBody) return;
    if (!items || items.length === 0) {
        pncpTableBody.innerHTML = '<tr><td colspan="8" class="pncp-loading">Nenhuma contratação encontrada para os filtros selecionados.</td></tr>';
        return;
    }
    pncpTableBody.innerHTML = '';
    items.forEach(item => pncpTableBody.appendChild(buildPncpRow(item)));
}

// Update summary cards
function updatePncpSummary() {
    const imported = getPncpImportedSet();
    const importedCount = pncpCache.filter(i => imported.has(i.numeroControlePNCP || '')).length;
    const novos = pncpCache.length - importedCount;

    const el = (id, v) => { const e = document.getElementById(id); if (e) e.textContent = v; };
    el('pncpResumoResultados', pncpTotalRegistros);
    el('pncpResumoImportados', importedCount);
    el('pncpResumoNovos', novos);
    el('pncpResumoPaginas', pncpTotalPages);

    // Show/hide "Importar novos" button
    if (pncpImportarTodosBtn) {
        pncpImportarTodosBtn.style.display = novos > 0 ? '' : 'none';
    }
}

// Update pagination
function updatePncpPagination() {
    if (!pncpPagination) return;
    pncpPagination.style.display = pncpTotalPages > 1 ? 'flex' : 'none';
    const info = document.getElementById('pncpPaginaInfo');
    if (info) info.textContent = `Página ${pncpCurrentPage} de ${pncpTotalPages}`;

    const prev = document.getElementById('pncpPrevPage');
    const next = document.getElementById('pncpNextPage');
    if (prev) prev.disabled = pncpCurrentPage <= 1;
    if (next) next.disabled = pncpCurrentPage >= pncpTotalPages;
}

// Main search function
async function buscarPncp(pagina = 1) {
    if (!pncpTableBody) return;

    const dataInicial = document.getElementById('pncpDataInicial')?.value;
    const dataFinal = document.getElementById('pncpDataFinal')?.value;
    const codigoModalidade = document.getElementById('pncpModalidade')?.value;
    const uf = document.getElementById('pncpUf')?.value || '';
    const codigoMunicipioIbge = document.getElementById('pncpMunicipio')?.value || '';
    const cnpj = document.getElementById('pncpCnpj')?.value.replace(/[.\-\/]/g, '') || '';
    const buscaTexto = (document.getElementById('pncpBuscaTexto')?.value || '').toLowerCase().trim();

    if (!dataInicial || !dataFinal) {
        alert('Preencha Data inicial e Data final.');
        return;
    }

    // Format dates YYYYMMDD
    const fmtData = d => d.replace(/-/g, '');

    pncpLastFilters = { dataInicial: fmtData(dataInicial), dataFinal: fmtData(dataFinal), codigoModalidade, uf, codigoMunicipioIbge, cnpj, buscaTexto };

    // Show loading
    if (pncpResultadosCard) pncpResultadosCard.style.display = '';
    pncpTableBody.innerHTML = '<tr><td colspan="8" class="pncp-loading"><i class="bx bx-loader-alt bx-spin"></i>Consultando PNCP...</td></tr>';

    if (pncpBuscarBtn) {
        pncpBuscarBtn.disabled = true;
        pncpBuscarBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Buscando...';
    }

    try {
        const params = new URLSearchParams({
            dataInicial: pncpLastFilters.dataInicial,
            dataFinal: pncpLastFilters.dataFinal,
            pagina,
            tamanhoPagina: 15,
        });
        if (codigoModalidade) params.set('codigoModalidadeContratacao', codigoModalidade);
        if (uf) params.set('uf', uf);
        if (codigoMunicipioIbge) params.set('codigoMunicipioIbge', codigoMunicipioIbge);
        if (cnpj) params.set('cnpj', cnpj);

        const response = await fetch(`/api/pncp/contratacoes?${params.toString()}`);
        if (!response.ok) {
            const err = await response.json().catch(() => ({}));
            throw new Error(err.detalhe || err.erro || 'Erro ao consultar PNCP');
        }

        const resultado = await response.json();
        let items = resultado.data || [];

        // Client-side text filter on objetoCompra
        if (buscaTexto) {
            items = items.filter(item => {
                const text = [
                    item.objetoCompra,
                    item.orgaoEntidade?.razaoSocial,
                    item.informacaoComplementar
                ].filter(Boolean).join(' ').toLowerCase();
                return text.includes(buscaTexto);
            });
        }

        pncpCache = items;
        pncpCacheOriginal = [...items];
        pncpCurrentPage = resultado.numeroPagina || pagina;
        pncpTotalPages = resultado.totalPaginas || 0;
        pncpTotalRegistros = resultado.totalRegistros || 0;

        // Aplicar ordenação ativa
        if (pncpSortField) {
            sortPncpCache(pncpSortField, pncpSortDir);
        } else {
            renderPncpTable(pncpCache);
        }
        updatePncpSummary();
        updatePncpPagination();

    } catch (error) {
        console.error('Erro PNCP:', error);
        pncpTableBody.innerHTML = `<tr><td colspan="8" class="pncp-loading"><i class='bx bxs-error-circle' style="color:#e74c3c;"></i>${error.message}</td></tr>`;
    } finally {
        if (pncpBuscarBtn) {
            pncpBuscarBtn.disabled = false;
            pncpBuscarBtn.innerHTML = '<i class="bx bx-search"></i> Buscar no PNCP';
        }
    }
}

// Import single contratação as edital
async function importarPncpComoEdital(item) {
    const numCtrl = item.numeroControlePNCP || '';
    if (!numCtrl) {
        alert('Contratação sem número de controle PNCP.');
        return false;
    }

    // Check if already imported
    if (getPncpImportedSet().has(numCtrl)) {
        alert('Esta contratação já foi importada.');
        return false;
    }

    // Determine fields
    const orgaoNome = item.orgaoEntidade?.razaoSocial || '';
    const unidade = item.unidadeOrgao || {};
    const ufSigla = unidade.ufSigla || '';
    const municipio = unidade.municipioNome || '';

    let tipoOrgao = 'Municipal';
    const esfera = item.orgaoEntidade?.esferaId;
    if (esfera === 'F') tipoOrgao = 'Federal';
    else if (esfera === 'E') tipoOrgao = 'Estadual';

    let status = 'aberto';
    const situacaoId = item.situacaoCompraId;
    if (situacaoId === '2') status = 'em_analise';
    else if (situacaoId === '3') status = 'adjudicado';
    else if (situacaoId === '4') status = 'encerrado';

    let vigencia = '';
    if (item.dataAberturaProposta) {
        vigencia = 'Abertura: ' + formatPncpDate(item.dataAberturaProposta);
    }
    if (item.dataEncerramentoProposta) {
        vigencia += (vigencia ? ' | ' : '') + 'Encerramento: ' + formatPncpDate(item.dataEncerramentoProposta);
    }
    if (!vigencia) vigencia = formatPncpDate(item.dataPublicacaoPncp);

    const resumoParts = [
        item.modalidadeNome ? `Modalidade: ${item.modalidadeNome}` : '',
        item.valorTotalEstimado ? `Valor estimado: ${formatPncpValor(item.valorTotalEstimado)}` : '',
        item.situacaoCompraNome ? `Situação PNCP: ${item.situacaoCompraNome}` : '',
        item.informacaoComplementar || '',
        `Nº Controle PNCP: ${numCtrl}`
    ].filter(Boolean).join('\n');

    const payload = {
        numero: item.numeroCompra || numCtrl,
        orgao: orgaoNome,
        tipoOrgao,
        estado: ufSigla,
        municipio,
        vigencia: vigencia || '-',
        objeto: item.objetoCompra || '',
        resumo: resumoParts,
        status,
        pncpNumeroControle: numCtrl,
        linkSistemaOrigem: item.linkSistemaOrigem || ''
    };

    try {
        const response = await fetch('/api/editais', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        if (!response.ok) throw new Error('Falha ao importar');
        // Refresh editais cache
        await loadEditais();
        await loadEditaisForSelect();
        return true;
    } catch (err) {
        console.error('Erro ao importar PNCP:', err);
        alert('Erro ao importar contratação: ' + err.message);
        return false;
    }
}

// Show detail modal
function abrirPncpDetalhe(item) {
    pncpDetalheAtual = item;
    if (!pncpDetalheModal || !pncpDetalheConteudo) return;

    const imported = getPncpImportedSet();
    const isImported = imported.has(item.numeroControlePNCP || '');

    const pub = formatPncpDate(item.dataPublicacaoPncp);
    const abertura = formatPncpDate(item.dataAberturaProposta);
    const encerramento = formatPncpDate(item.dataEncerramentoProposta);
    const orgao = item.orgaoEntidade?.razaoSocial || '-';
    const cnpjOrgao = item.orgaoEntidade?.cnpj || '-';
    const unidade = item.unidadeOrgao?.nomeUnidade || '-';
    const local = formatPncpLocal(item);
    const modalidade = item.modalidadeNome || '-';
    const modoDisputa = item.modoDisputaNome || '-';
    const situacao = getSituacaoLabel(item);
    const valorEst = formatPncpValor(item.valorTotalEstimado);
    const valorHom = formatPncpValor(item.valorTotalHomologado);
    const objeto = item.objetoCompra || '-';
    const info = item.informacaoComplementar || '';
    const numCtrl = item.numeroControlePNCP || '-';
    const linkSistema = item.linkSistemaOrigem || '';
    const linkProcesso = item.linkProcessoEletronico || '';

    pncpDetalheConteudo.innerHTML = `
        <div class="pncp-detalhe-grid">
            <div class="pncp-field">
                <label>Nº da Compra</label>
                <span>${item.numeroCompra || '-'}</span>
            </div>
            <div class="pncp-field">
                <label>Nº Controle PNCP</label>
                <span>${numCtrl}</span>
            </div>
            <div class="pncp-field">
                <label>Órgão</label>
                <span>${orgao}</span>
            </div>
            <div class="pncp-field">
                <label>CNPJ</label>
                <span>${cnpjOrgao}</span>
            </div>
            <div class="pncp-field">
                <label>Unidade</label>
                <span>${unidade}</span>
            </div>
            <div class="pncp-field">
                <label>Local</label>
                <span>${local}</span>
            </div>
            <div class="pncp-field">
                <label>Modalidade</label>
                <span>${modalidade}</span>
            </div>
            <div class="pncp-field">
                <label>Modo de Disputa</label>
                <span>${modoDisputa}</span>
            </div>
            <div class="pncp-field">
                <label>Situação</label>
                <span><span class="status ${getSituacaoCss(item)}">${situacao}</span></span>
            </div>
            <div class="pncp-field">
                <label>Publicação PNCP</label>
                <span>${pub}</span>
            </div>
            <div class="pncp-field">
                <label>Abertura de Propostas</label>
                <span>${abertura}</span>
            </div>
            <div class="pncp-field">
                <label>Encerramento de Propostas</label>
                <span>${encerramento}</span>
            </div>
            <div class="pncp-field">
                <label>Valor Total Estimado</label>
                <span class="pncp-valor">${valorEst}</span>
            </div>
            <div class="pncp-field">
                <label>Valor Total Homologado</label>
                <span class="pncp-valor">${valorHom}</span>
            </div>
        </div>
        <div class="pncp-field" style="margin-top:16px;">
            <label>Objeto</label>
            <p>${objeto}</p>
        </div>
        ${info ? `<div class="pncp-field"><label>Informação Complementar</label><p>${info}</p></div>` : ''}
        ${linkSistema ? `<div class="pncp-field"><label>Link Sistema Origem</label><a href="${linkSistema}" target="_blank" rel="noopener">${linkSistema}</a></div>` : ''}
        ${linkProcesso ? `<div class="pncp-field"><label>Link Processo Eletrônico</label><a href="${linkProcesso}" target="_blank" rel="noopener">${linkProcesso}</a></div>` : ''}
        ${isImported ? '<p style="margin-top:12px;color:#2e7d32;font-weight:600;"><i class="bx bx-check-circle"></i> Esta contratação já foi importada como edital.</p>' : ''}
    `;

    if (pncpImportarDetalheBtn) {
        pncpImportarDetalheBtn.style.display = isImported ? 'none' : '';
    }

    pncpDetalheModal.classList.add('show');
    pncpDetalheModal.setAttribute('aria-hidden', 'false');
}

function fecharPncpDetalhe() {
    if (!pncpDetalheModal) return;
    pncpDetalheModal.classList.remove('show');
    pncpDetalheModal.setAttribute('aria-hidden', 'true');
    pncpDetalheAtual = null;
}

// ── Município dinâmico via IBGE API ──
const pncpUfSelect = document.getElementById('pncpUf');
const pncpMunicipioSelect = document.getElementById('pncpMunicipio');

function resetPncpMunicipio() {
    if (!pncpMunicipioSelect) return;
    pncpMunicipioSelect.innerHTML = '<option value="">Selecione a UF primeiro</option>';
    pncpMunicipioSelect.disabled = true;
}

async function carregarMunicipiosIbge(uf) {
    if (!pncpMunicipioSelect) return;
    if (!uf) { resetPncpMunicipio(); return; }
    pncpMunicipioSelect.innerHTML = '<option value="">Carregando...</option>';
    pncpMunicipioSelect.disabled = true;
    try {
        const resp = await fetch(`https://servicodados.ibge.gov.br/api/v1/localidades/estados/${uf}/municipios?orderBy=nome`);
        if (!resp.ok) throw new Error('Erro IBGE');
        const municipios = await resp.json();
        pncpMunicipioSelect.innerHTML = '<option value="">Todos</option>';
        municipios.forEach(m => {
            const opt = document.createElement('option');
            opt.value = m.id;          // código IBGE
            opt.textContent = m.nome;
            pncpMunicipioSelect.appendChild(opt);
        });
        pncpMunicipioSelect.disabled = false;
    } catch (err) {
        console.error('Erro ao carregar municípios IBGE:', err);
        pncpMunicipioSelect.innerHTML = '<option value="">Erro ao carregar</option>';
    }
}

if (pncpUfSelect) {
    pncpUfSelect.addEventListener('change', () => {
        carregarMunicipiosIbge(pncpUfSelect.value);
    });
}

// Event listeners PNCP
document.getElementById('pncpTable')?.querySelector('thead')?.addEventListener('click', (e) => {
    const th = e.target.closest('th.sortable');
    if (th && th.dataset.sort) handlePncpHeaderSort(th.dataset.sort);
});

if (pncpFilterForm) {
    pncpFilterForm.addEventListener('submit', (e) => {
        e.preventDefault();
        pncpCurrentPage = 1;
        buscarPncp(1);
    });
}

if (pncpLimparBtn) {
    pncpLimparBtn.addEventListener('click', () => {
        if (pncpFilterForm) pncpFilterForm.reset();
        resetPncpMunicipio();
        initPncpDates();
        pncpCache = [];
        pncpCacheOriginal = [];
        pncpSortField = '';
        pncpSortDir = '';
        pncpTotalPages = 0;
        pncpTotalRegistros = 0;
        if (pncpResultadosCard) pncpResultadosCard.style.display = 'none';
        updatePncpSummary();
    });
}

// Pagination
document.getElementById('pncpPrevPage')?.addEventListener('click', () => {
    if (pncpCurrentPage > 1) buscarPncp(pncpCurrentPage - 1);
});
document.getElementById('pncpNextPage')?.addEventListener('click', () => {
    if (pncpCurrentPage < pncpTotalPages) buscarPncp(pncpCurrentPage + 1);
});

// Table actions (ver / importar)
if (pncpTableBody) {
    pncpTableBody.addEventListener('click', async (e) => {
        const button = e.target.closest('button[data-pncp-action]');
        if (!button) return;
        const action = button.dataset.pncpAction;
        const row = button.closest('tr');
        const item = row?._pncpItem;
        if (!item) return;

        if (action === 'ver') {
            abrirPncpDetalhe(item);
        }

        if (action === 'importar') {
            button.disabled = true;
            button.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i>';
            const ok = await importarPncpComoEdital(item);
            if (ok) {
                // Re-render to update badges
                renderPncpTable(pncpCache);
                updatePncpSummary();
            }
            button.disabled = false;
            button.innerHTML = '<i class="bx bxs-download"></i>';
        }
    });
}

// Import all new
if (pncpImportarTodosBtn) {
    pncpImportarTodosBtn.addEventListener('click', async () => {
        const imported = getPncpImportedSet();
        const novos = pncpCache.filter(i => !imported.has(i.numeroControlePNCP || ''));
        if (novos.length === 0) {
            alert('Todas as contratações já foram importadas.');
            return;
        }
        if (!confirm(`Importar ${novos.length} contratação(ões) como editais?`)) return;

        pncpImportarTodosBtn.disabled = true;
        pncpImportarTodosBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Importando...';

        let importados = 0;
        for (const item of novos) {
            const ok = await importarPncpComoEdital(item);
            if (ok) importados++;
        }

        pncpImportarTodosBtn.disabled = false;
        pncpImportarTodosBtn.innerHTML = '<i class="bx bxs-download"></i> Importar novos';

        renderPncpTable(pncpCache);
        updatePncpSummary();
        alert(`${importados} contratação(ões) importada(s) com sucesso!`);
    });
}

// Detail modal buttons
if (pncpImportarDetalheBtn) {
    pncpImportarDetalheBtn.addEventListener('click', async () => {
        if (!pncpDetalheAtual) return;
        pncpImportarDetalheBtn.disabled = true;
        pncpImportarDetalheBtn.innerHTML = '<i class="bx bx-loader-alt bx-spin"></i> Importando...';
        const ok = await importarPncpComoEdital(pncpDetalheAtual);
        pncpImportarDetalheBtn.disabled = false;
        pncpImportarDetalheBtn.innerHTML = '<i class="bx bxs-download"></i> Importar como edital';
        if (ok) {
            fecharPncpDetalhe();
            renderPncpTable(pncpCache);
            updatePncpSummary();
        }
    });
}

document.getElementById('fecharPncpDetalhe')?.addEventListener('click', fecharPncpDetalhe);
document.getElementById('pncpFecharDetalheBtn')?.addEventListener('click', fecharPncpDetalhe);

if (pncpDetalheModal) {
    pncpDetalheModal.addEventListener('click', (e) => {
        if (e.target === pncpDetalheModal) fecharPncpDetalhe();
    });
}

window.addEventListener('load', loadContratosTable);
window.addEventListener('load', loadEditaisForSelect);
window.addEventListener('load', loadEditais);
window.addEventListener('load', function () {
    setActivePage('dashboard');
    initPncpDates();
});
window.addEventListener('load', loadMedicos);
window.addEventListener('load', loadPlantoes);
