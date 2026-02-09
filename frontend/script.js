// ========== SIDEBAR NAVIGATION ==========
// Gerencia a ativação de itens na sidebar ao clicar
const allSideMenuItems = document.querySelectorAll('#sidebar .side-menu.top li a');
const pages = document.querySelectorAll('#content main .page');

function setActivePage(pageKey) {
    const normalizedKey = pageKey === 'editais-novo' ? 'editais' : pageKey;
    pages.forEach(page => {
        const isActive = page.dataset.page === pageKey;
        page.classList.toggle('active', isActive);
    });

    allSideMenuItems.forEach(item => {
        const itemKey = item.dataset.page;
        const isActive = itemKey === normalizedKey;
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

// ========== CONTRATOS TABLE (API) ==========
// Carrega dados reais da API e renderiza a tabela de contratos
const contratosTableBody = document.getElementById('contratosTableBody');

function formatDate(value) {
    if (!value) return 'Nao informado';
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return String(value);
    return date.toLocaleDateString('pt-BR');
}

function getBadgeText(rawLabel) {
    const digits = String(rawLabel || '').replace(/\D/g, '').slice(-3);
    return digits || 'CNT';
}

function getStatusMeta(status) {
    const normalized = String(status || '').toLowerCase();
    if (normalized === 'ativo') return { label: 'Ativo', css: 'completed', color: '3C91E6' };
    if (normalized === 'encerrado') return { label: 'Encerrado', css: 'completed', color: '3C91E6' };
    if (normalized === 'suspenso') return { label: 'Suspenso', css: 'pending', color: 'FFCE26' };
    if (normalized === 'cancelado') return { label: 'Cancelado', css: 'pending', color: 'FFCE26' };
    return { label: 'Em andamento', css: 'process', color: 'FD7238' };
}

function buildContratoRow(contrato) {
    const statusMeta = getStatusMeta(contrato.status);
    const contratoNumero = contrato.numero ? `#${contrato.numero}` : `#${contrato.id}`;
    const contratoBadge = getBadgeText(contrato.numero || contrato.id);
    const contratoImage = `https://placehold.co/36x36/${statusMeta.color}/FFFFFF?text=${encodeURIComponent(contratoBadge)}`;
    const periodo = `${formatDate(contrato.dataInicio)} - ${formatDate(contrato.dataFim)}`;
    const orgao = contrato.orgao || 'Nao informado';
    const municipio = contrato.municipio || '';
    const estado = contrato.estado || '';
    const localidade = municipio && estado ? `${municipio} - ${estado}` : (municipio || estado || 'Nao informado');

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

async function loadContratosTable() {
    if (!contratosTableBody) return;

    contratosTableBody.innerHTML = '<tr><td colspan="5">Carregando contratos...</td></tr>';

    try {
        const response = await fetch('/api/contratos');
        if (!response.ok) {
            throw new Error('Falha ao carregar contratos');
        }

        const contratos = await response.json();
        if (!Array.isArray(contratos) || contratos.length === 0) {
            contratosTableBody.innerHTML = '<tr><td colspan="5">Nenhum contrato cadastrado.</td></tr>';
            return;
        }

        contratosTableBody.innerHTML = '';
        contratos.forEach(contrato => {
            contratosTableBody.appendChild(buildContratoRow(contrato));
        });
    } catch (error) {
        contratosTableBody.innerHTML = '<tr><td colspan="5">Erro ao carregar contratos.</td></tr>';
        console.error(error);
    }
}

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

// ========== EDITAIS (UPLOAD) ==========
const editalPdfInput = document.getElementById('editalPdfInput');
const editalPdfName = document.getElementById('editalPdfName');
const analisarEditalBtn = document.getElementById('analisarEditalBtn');
const editalRequirements = document.getElementById('editalRequirements');
const editalAnexos = document.getElementById('editalAnexos');
const salvarEditalBtn = document.getElementById('salvarEditalBtn');

const editalNumero = document.getElementById('editalNumero');
const editalOrgao = document.getElementById('editalOrgao');
const editalTipoOrgao = document.getElementById('editalTipoOrgao');
const editalEstado = document.getElementById('editalEstado');
const editalMunicipio = document.getElementById('editalMunicipio');
const editalVigencia = document.getElementById('editalVigencia');
const editalObjeto = document.getElementById('editalObjeto');
const editalResumo = document.getElementById('editalResumo');

let parsedEdital = null;

const annexLinks = [
    {
        titulo: 'Anexo II - Modelo de Requerimento de Credenciamento',
        url: 'https://arquivos.licitardigital.com.br/2af7f023-4dcb-4c67-a21f-a864fa0c8e10.pdf'
    },
    {
        titulo: 'Anexo III - Formulario de Cadastro de Inscricao',
        url: 'https://arquivos.licitardigital.com.br/9848a2e2-15fb-4630-bf74-e3dd984b9aa7.pdf'
    },
    {
        titulo: 'Anexo IV - Declaracao de nao emprego de menor',
        url: 'https://arquivos.licitardigital.com.br/c216b6ec-8e0b-49c0-a137-e4813237b23a.pdf'
    },
    {
        titulo: 'Anexo V - Declaracao de aceitacao do preco',
        url: 'https://arquivos.licitardigital.com.br/aea7131e-1d6c-4f06-b9f3-8e68cd9c308c.pdf'
    },
    {
        titulo: 'Anexo VI - Declaracao de inexistencia de vinculo',
        url: 'https://arquivos.licitardigital.com.br/a15aff47-61c7-4df8-8267-31917f4d42c9.pdf'
    },
    {
        titulo: 'Anexo VII - Modelo de Proposta de Precos',
        url: 'https://arquivos.licitardigital.com.br/8b3f413b-fdb0-4ed4-9986-bdbb5ff6c3d2.pdf'
    }
];

function renderEditalRequirements(items) {
    if (!editalRequirements) return;

    editalRequirements.innerHTML = '';
    items.forEach(item => {
        const li = document.createElement('li');
        li.textContent = item;
        editalRequirements.appendChild(li);
    });
}

function renderAnexos(items) {
    if (!editalAnexos) return;
    editalAnexos.innerHTML = '';

    if (!items || items.length === 0) {
        editalAnexos.innerHTML = '<tr><td colspan="3">Nenhum anexo identificado.</td></tr>';
        return;
    }

    items.forEach(item => {
        const fieldsCount = item.schema && Array.isArray(item.schema.fields) ? item.schema.fields.length : 0;
        const row = document.createElement('tr');
        row.innerHTML = `
            <td>${item.titulo}</td>
            <td>${item.fonte}</td>
            <td>${fieldsCount}</td>
        `;
        editalAnexos.appendChild(row);
    });
}

function fillEditalForm(data) {
    if (!data) return;
    if (editalNumero) editalNumero.value = data.numero || '';
    if (editalOrgao) editalOrgao.value = data.orgao || '';
    if (editalVigencia) editalVigencia.value = data.vigencia || '';
    if (editalObjeto) editalObjeto.value = data.objeto || '';
    if (editalResumo) editalResumo.value = data.resumo || '';
    if (editalTipoOrgao && data.tipoOrgao) editalTipoOrgao.value = data.tipoOrgao;
    if (editalEstado && data.estado) editalEstado.value = data.estado;
    if (editalMunicipio && data.municipio) editalMunicipio.value = data.municipio;
}

if (editalPdfInput && editalPdfName) {
    editalPdfInput.addEventListener('change', () => {
        const file = editalPdfInput.files && editalPdfInput.files[0];
        editalPdfName.textContent = file ? file.name : 'Nenhum arquivo selecionado';
    });
}

if (analisarEditalBtn) {
    analisarEditalBtn.addEventListener('click', async () => {
        const file = editalPdfInput && editalPdfInput.files ? editalPdfInput.files[0] : null;
        if (!file) {
            renderEditalRequirements(['Selecione um PDF para iniciar a analise.']);
            return;
        }

        const formData = new FormData();
        formData.append('editalPdf', file);
        formData.append('annexLinks', JSON.stringify(annexLinks));

        try {
            const response = await fetch('/api/editais/analisar', {
                method: 'POST',
                body: formData
            });

            if (!response.ok) {
                throw new Error('Falha ao analisar edital');
            }

            parsedEdital = await response.json();
            renderEditalRequirements(parsedEdital.requisitos || []);
            renderAnexos(parsedEdital.anexos || []);
            fillEditalForm(parsedEdital);
        } catch (error) {
            console.error(error);
            renderEditalRequirements(['Falha ao analisar o PDF.']);
        }
    });
}

if (salvarEditalBtn) {
    salvarEditalBtn.addEventListener('click', async () => {
        if (!parsedEdital) {
            alert('Analise o PDF antes de salvar.');
            return;
        }

        const payload = {
            numero: editalNumero ? editalNumero.value.trim() : '',
            orgao: editalOrgao ? editalOrgao.value.trim() : '',
            tipoOrgao: editalTipoOrgao ? editalTipoOrgao.value : 'Municipio',
            estado: editalEstado ? editalEstado.value.trim() : '',
            municipio: editalMunicipio ? editalMunicipio.value.trim() : '',
            vigencia: editalVigencia ? editalVigencia.value.trim() : '',
            objeto: editalObjeto ? editalObjeto.value.trim() : '',
            resumo: editalResumo ? editalResumo.value.trim() : '',
            pdfNome: parsedEdital.pdfNome || '',
            requisitos: (parsedEdital.requisitos || []).map(texto => ({ texto })),
            anexos: parsedEdital.anexos || [],
            tarefas: parsedEdital.tarefas || []
        };

        try {
            const response = await fetch('/api/editais', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(payload)
            });

            if (!response.ok) {
                const erro = await response.json();
                throw new Error(erro.erro || 'Falha ao salvar edital');
            }

            alert('Edital salvo com sucesso.');
        } catch (error) {
            console.error(error);
            alert('Erro ao salvar edital.');
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
const abrirCadastroMedico = document.getElementById('abrirCadastroMedico');
const fecharCadastroMedico = document.getElementById('fecharCadastroMedico');
const medicoModal = document.getElementById('medicoModal');
const medicoModalTitle = medicoModal ? medicoModal.querySelector('.modal-header h3') : null;
const medicoModalSubmit = medicoForm ? medicoForm.querySelector('button[type="submit"]') : null;
const medicosFilterEspecialidade = document.getElementById('medicosFilterEspecialidade');
const medicosFilterStatus = document.getElementById('medicosFilterStatus');
let medicosCache = [];
let editingMedicoId = null;

function formatMedicoLocal(medico) {
    const cidade = medico.municipio || '';
    const uf = medico.uf || '';
    if (cidade && uf) return `${cidade} - ${uf}`;
    return cidade || uf || 'Nao informado';
}

function buildMedicoRow(medico) {
    const row = document.createElement('tr');
    const statusLabel = medico.status ? medico.status : 'ativo';

    row.innerHTML = `
        <td>${medico.nome || ''}</td>
        <td>${medico.especialidade || ''}</td>
        <td>${medico.crm || 'Nao informado'}</td>
        <td>${formatMedicoLocal(medico)}</td>
        <td>${statusLabel}</td>
        <td>
            <div class="actions">
                <button class="btn-icon" data-action="edit" data-id="${medico.id}">Editar</button>
                <button class="btn-icon danger" data-action="delete" data-id="${medico.id}">Excluir</button>
            </div>
        </td>
    `;

    return row;
}

function renderMedicosTable(items) {
    if (!medicosTableBody) return;
    if (!items || items.length === 0) {
        medicosTableBody.innerHTML = '<tr><td colspan="6">Nenhum medico cadastrado.</td></tr>';
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

    medicosTableBody.innerHTML = '<tr><td colspan="6">Carregando medicos...</td></tr>';

    try {
        const response = await fetch('/api/medicos');
        if (!response.ok) {
            throw new Error('Falha ao carregar medicos');
        }

        const medicos = await response.json();
        medicosCache = Array.isArray(medicos) ? medicos : [];
        updateMedicosFilters(medicosCache);
        applyMedicosFilters();
    } catch (error) {
        medicosTableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar medicos.</td></tr>';
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
    } else {
        editingMedicoId = null;
        medicoForm.reset();
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

            medicoForm.reset();
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
        return { label: 'Concluido', css: 'completed', key: 'concluido' };
    }
    return { label: 'Agendado', css: 'pending', key: 'agendado' };
}

function formatPlantaoLocal(plantao) {
    const cidade = plantao.municipio || '';
    const uf = plantao.uf || '';
    if (cidade && uf) return `${cidade} - ${uf}`;
    return cidade || uf || 'Nao informado';
}

function buildPlantaoRow(plantao) {
    const row = document.createElement('tr');
    const statusMeta = getPlantaoStatus(plantao.data);
    row.innerHTML = `
        <td>${formatDate(plantao.data)}</td>
        <td>${plantao.nome || 'Nao informado'}</td>
        <td>${plantao.especialidade || 'Nao informado'}</td>
        <td>${formatPlantaoLocal(plantao)}</td>
        <td><span class="status ${statusMeta.css}">${statusMeta.label}</span></td>
        <td>
            <div class="actions">
                <button class="btn-icon" data-action="edit" data-id="${plantao.id}">Editar</button>
                <button class="btn-icon danger" data-action="delete" data-id="${plantao.id}">Cancelar</button>
            </div>
        </td>
    `;
    return row;
}

function renderPlantoesTable(items) {
    if (!plantoesTableBody) return;
    if (!items || items.length === 0) {
        plantoesTableBody.innerHTML = '<tr><td colspan="6">Nenhum plantao cadastrado.</td></tr>';
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
    plantoesTableBody.innerHTML = '<tr><td colspan="6">Carregando plantões...</td></tr>';

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
        plantoesTableBody.innerHTML = '<tr><td colspan="6">Erro ao carregar plantões.</td></tr>';
        console.error(error);
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

    if (plantao) {
        editingPlantaoId = plantao.id;
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

window.addEventListener('load', loadContratosTable);
window.addEventListener('load', function () {
    setActivePage('dashboard');
});
window.addEventListener('load', loadMedicos);
window.addEventListener('load', loadPlantoes);
