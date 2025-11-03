// --- Variáveis Globais de Controle ---
let dadosCadastrados = []; 
let proximoNR = 1; 
let dadosPendentesCadastro = null; // Armazena os dados temporários para o modal

// Mapeamento de colunas para índices de célula na tabela
const colunaMap = {
    'nr': 1,
    'sequencialAuto': 2,
    'sequencialDigitado': 3,
    'criador': 4,
    'status': 6,
    'observacoes': 8
};


// --- Inicialização e Funções de Aba ---

// Função para abrir as abas
function openTab(evt, tabName) {
    let i, tabcontent, tablinks;

    tabcontent = document.getElementsByClassName("tabcontent");
    for (i = 0; i < tabcontent.length; i++) {
        tabcontent[i].style.display = "none";
    }

    tablinks = document.getElementsByClassName("tablink");
    for (i = 0; i < tablinks.length; i++) {
        tablinks[i].className = tablinks[i].className.replace(" active", "");
    }

    document.getElementById(tabName).style.display = "block";
    evt.currentTarget.className += " active";
    
    if (tabName === 'ListaGeral') {
        carregarListaGeral();
    }
}

// Inicializa a aplicação
document.addEventListener('DOMContentLoaded', (event) => {
    adicionarDadosTeste();
    
    // Configura o evento do botão SIM do modal com {once: true} para garantir que execute apenas uma vez.
    // Ele será reatribuído dentro da processarConfirmacaoDuplicidade.
    document.getElementById('modalSim').addEventListener('click', processarConfirmacaoDuplicidade, {once: true});
    
    setTimeout(() => {
         // Clica na primeira aba ao carregar
         document.querySelector('.tablink').click(); 
    }, 0);
});

function adicionarDadosTeste() {
    // Dados de teste
    dadosCadastrados.push({
        nr: proximoNR++,
        sequencialAuto: '00001/25',
        sequencialDigitado: 'PROD-A-123',
        criador: 'João S.',
        tipoOperacao: 'Produto',
        observacoes: 'Primeiro sequencial. Aguardando análise CQM.',
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        status: 'No CQM', 
        historicoCorrecao: []
    });
    dadosCadastrados.push({
        nr: proximoNR++,
        sequencialAuto: '00002/25',
        sequencialDigitado: 'MONIT-X-456',
        criador: 'Maria A.',
        tipoOperacao: 'Monitoramento',
        observacoes: 'Aprovado pelo CQM. Aguardando recepção.',
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        status: 'Na Recepção',
        historicoCorrecao: [{
            corretor: 'Sistema',
            motivo: 'Ajuste inicial do sistema',
            anterior: 'MONIT-X-INVALIDO',
            novo: 'MONIT-X-456',
            data: new Date().toLocaleDateString('pt-BR')
        }] 
    });
    dadosCadastrados.push({
        nr: proximoNR++,
        sequencialAuto: '00003/25',
        sequencialDigitado: 'CERT-003-Z',
        criador: 'Pedro M.',
        tipoOperacao: 'Certificacao',
        observacoes: 'Sequencial já liberado e finalizado.',
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        status: 'Liberado',
        historicoCorrecao: []
    });
    dadosCadastrados.push({
        nr: proximoNR++,
        sequencialAuto: '00004/25',
        sequencialDigitado: 'PROD-A-123', // Sequencial Duplicado para teste
        criador: 'Ana B.',
        tipoOperacao: 'Produto',
        observacoes: 'Duplicidade de teste.',
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        status: 'No CQM',
        historicoCorrecao: []
    });
}


// --- Funções Auxiliares de Duplicidade ---

/**
 * Encontra todos os itens existentes com um Sequencial Digitado específico.
 * @param {string} sequencialDigitado 
 * @returns {Array<Object>} Lista de itens duplicados.
 */
function encontrarDuplicados(sequencialDigitado) {
    return dadosCadastrados.filter(item => item.sequencialDigitado.toLowerCase() === sequencialDigitado.toLowerCase());
}

/**
 * Exibe o Modal de Duplicidade.
 * @param {Array<string>} sequenciaisDuplicados - Lista de sequenciais que apresentaram duplicidade.
 * @param {string} tipoCadastro - 'unico' ou 'multiplo'.
 */
function exibirModalDuplicidade(sequenciaisDuplicados, tipoCadastro) {
    const modal = document.getElementById('duplicidadeModal');
    const detalhesDiv = document.getElementById('duplicidadeDetalhes');
    detalhesDiv.innerHTML = '';

    let conteudoHTML = '';
    let sequenciaisVerificados = new Set(); // Para garantir que cada Sequencial Digitado seja verificado uma vez

    sequenciaisDuplicados.forEach(seqD => {
        if (sequenciaisVerificados.has(seqD.toLowerCase())) return;
        sequenciaisVerificados.add(seqD.toLowerCase());

        const duplicadosEncontrados = encontrarDuplicados(seqD);

        conteudoHTML += `<h3>Sequencial Digitado Duplicado: <mark>${seqD}</mark></h3>`;

        duplicadosEncontrados.forEach(item => {
            const ajustadoIcone = item.historicoCorrecao.length > 0 ? ' (⚙️ AJUSTADO)' : '';
            const statusClass = getStatusClass(item.status);

            conteudoHTML += `
                <div class="duplicado-item">
                    <p><strong>Item Existente (NR: ${item.nr})</strong></p>
                    <ul>
                        <li>Sequencial Auto: ${item.sequencialAuto}</li>
                        <li>Criador: ${item.criador}</li>
                        <li>Tipo Operação: ${item.tipoOperacao}</li>
                        <li>Status: <span class="${statusClass}">${item.status}</span>${ajustadoIcone}</li>
                        <li>Data Criação: ${item.dataCadastro}</li>
                        <li>Observações: ${item.observacoes.substring(0, 100)}${item.observacoes.length > 100 ? '...' : ''}</li>
                    </ul>
                </div>
            `;
        });
    });

    detalhesDiv.innerHTML = conteudoHTML || '<p>Erro: Detalhes da duplicidade não carregados.</p>';
    
    // Mostra o modal (usa display: flex para centralização)
    modal.style.display = 'flex'; 
    document.getElementById('modalSim').setAttribute('data-tipo', tipoCadastro); 
    
    // Garantir que o listener SIM esteja ativo (útil após o clique 'NÃO, CANCELAR' do HTML)
    document.getElementById('modalSim').addEventListener('click', processarConfirmacaoDuplicidade, {once: true});
}

/**
 * Fecha o Modal de Duplicidade.
 */
function fecharModal() {
    document.getElementById('duplicidadeModal').style.display = 'none';
    // Remove o listener para evitar execução acidental (será reatribuído na processarConfirmacaoDuplicidade)
    document.getElementById('modalSim').removeEventListener('click', processarConfirmacaoDuplicidade);
    // NOTA: dadosPendentesCadastro deve ser limpo pelo botão 'NÃO, CANCELAR' no HTML.
}

/**
 * Chamada quando o usuário clica SIM no modal. (CORRIGIDO)
 */
function processarConfirmacaoDuplicidade(event) {
    // 1. Verifica se há dados pendentes antes de qualquer coisa (Ponto de correção do erro)
    if (!dadosPendentesCadastro) {
        alert("Erro: Dados pendentes não encontrados. Tentativa de cadastro cancelada. Por favor, reinicie o processo.");
        document.getElementById('duplicidadeModal').style.display = 'none'; 
        return;
    }

    const tipo = event.target.getAttribute('data-tipo');
    
    // 2. Executa o cadastro
    if (tipo === 'unico') {
        cadastrar(dadosPendentesCadastro.criador, dadosPendentesCadastro.sequencialDigitado, dadosPendentesCadastro.tipoOperacao, dadosPendentesCadastro.observacoes);
    } else if (tipo === 'multiplo') {
        cadastrarMultiplos(dadosPendentesCadastro.criador, dadosPendentesCadastro.tipoOperacao, dadosPendentesCadastro.sequenciaisArray, dadosPendentesCadastro.observacoes);
    }
    
    // 3. Limpa dados temporários e fecha o modal
    dadosPendentesCadastro = null;
    document.getElementById('duplicidadeModal').style.display = 'none';
    
    // 4. RE-ATRIBUI o listener para o próximo uso (com {once: true})
    document.getElementById('modalSim').addEventListener('click', processarConfirmacaoDuplicidade, {once: true});
}


// --- Funções da Aba CADASTRO ---

function gerarSequencialAuto() {
    const ano = new Date().getFullYear().toString().slice(-2);
    return String(proximoNR).padStart(5, '0') + '/' + ano;
}

// FUNÇÃO WRAPPER PARA CADASTRO ÚNICO (CORRIGIDA)
function iniciarCadastroUnico() {
    const criador = document.getElementById('criador').value.trim(); 
    const sequencialDigitado = document.getElementById('sequencialDigitado').value.trim(); 
    const tipoOperacao = document.getElementById('tipoOperacao').value;
    const observacoes = document.getElementById('observacoes').value;

    if (!criador || !sequencialDigitado || !tipoOperacao) {
        alert("Por favor, preencha todos os campos obrigatórios.");
        dadosPendentesCadastro = null;
        return;
    }
    
    // DEFINE OS DADOS PENDENTES AQUI
    dadosPendentesCadastro = { criador, sequencialDigitado, tipoOperacao, observacoes };

    const duplicados = encontrarDuplicados(sequencialDigitado);

    if (duplicados.length > 0) {
        // Exibe o modal
        exibirModalDuplicidade([sequencialDigitado], 'unico'); 
    } else {
        // Não há duplicidade, cadastra diretamente
        cadastrar(criador, sequencialDigitado, tipoOperacao, observacoes);
        dadosPendentesCadastro = null; // Limpa após o cadastro direto
    }
}

// FUNÇÃO DE CADASTRO ÚNICO REAL
function cadastrar(criador, sequencialDigitado, tipoOperacao, observacoes) {
    const novoSequencialAuto = gerarSequencialAuto();

    const novoCadastro = {
        nr: proximoNR++, 
        sequencialAuto: novoSequencialAuto,
        sequencialDigitado: sequencialDigitado,
        criador: criador,
        tipoOperacao: tipoOperacao,
        observacoes: observacoes,
        dataCadastro: new Date().toLocaleDateString('pt-BR'),
        status: 'No CQM', 
        historicoCorrecao: []
    };

    dadosCadastrados.push(novoCadastro);

    // Limpar o formulário (somente na interface principal)
    document.getElementById('sequencialDigitado').value = '';
    document.getElementById('observacoes').value = '';
    document.getElementById('tipoOperacao').value = '';
    
    alert(`Cadastro realizado com sucesso!\nStatus Inicial: NO CQM\nSequencial Automático: ${novoSequencialAuto}`);
}


// FUNÇÃO WRAPPER PARA CADASTRO MÚLTIPLO (CORRIGIDA)
function iniciarCadastroMultiplo() {
    const criador = document.getElementById('criadorRapido').value.trim();
    const tipoOperacao = document.getElementById('tipoOperacaoRapido').value;
    const sequenciaisLista = document.getElementById('sequenciaisLista').value.trim();
    const observacoes = document.getElementById('observacoesRapido').value;

    if (!criador || !tipoOperacao || !sequenciaisLista) {
        alert("Por favor, preencha o Criador, o Tipo de Operação e a Lista de Sequenciais.");
        dadosPendentesCadastro = null;
        return;
    }

    const sequenciaisArray = sequenciaisLista.split('\n')
        .map(seq => seq.trim())
        .filter(seq => seq.length > 0);

    if (sequenciaisArray.length === 0) {
        alert("A lista de sequenciais digitados está vazia.");
        dadosPendentesCadastro = null;
        return;
    }

    // DEFINE OS DADOS PENDENTES AQUI
    dadosPendentesCadastro = { criador, tipoOperacao, sequenciaisArray, observacoes };

    // 1. Verifica duplicidades no lote em relação aos dados já cadastrados
    const duplicadosNoLote = sequenciaisArray.filter(seqD => encontrarDuplicados(seqD).length > 0);

    if (duplicadosNoLote.length > 0) {
        // Exibe o modal com a lista de sequenciais duplicados
        exibirModalDuplicidade(duplicadosNoLote, 'multiplo'); 
    } else {
        // Não há duplicidade, cadastra diretamente
        cadastrarMultiplos(criador, tipoOperacao, sequenciaisArray, observacoes);
        dadosPendentesCadastro = null; // Limpa após o cadastro direto
    }
}


// FUNÇÃO DE CADASTRO MÚLTIPLO REAL
function cadastrarMultiplos(criador, tipoOperacao, sequenciaisArray, observacoes) {
    let sequenciaisCadastrados = [];
    
    sequenciaisArray.forEach(seqDigitado => {
        const novoSequencialAuto = gerarSequencialAuto(); 

        const novoCadastro = {
            nr: proximoNR++,
            sequencialAuto: novoSequencialAuto,
            sequencialDigitado: seqDigitado, 
            criador: criador,
            tipoOperacao: tipoOperacao,
            observacoes: observacoes, 
            dataCadastro: new Date().toLocaleDateString('pt-BR'),
            status: 'No CQM',
            historicoCorrecao: []
        };

        dadosCadastrados.push(novoCadastro);
        sequenciaisCadastrados.push(novoSequencialAuto);
    });

    // Limpa a interface de cadastro em lote
    document.getElementById('sequenciaisLista').value = '';
    document.getElementById('observacoesRapido').value = '';
    
    alert(`Sucesso! ${sequenciaisCadastrados.length} itens cadastrados.\nSequenciais automáticos gerados: ${sequenciaisCadastrados.join(', ')}`);
}


// --- Funções de Correção, Liberação e Lista Geral ---

function buscarParaCorrecao() {
    const buscaSeq = document.getElementById('buscaSeqCorrecao').value.trim();
    const resultadoDiv = document.getElementById('correcaoInterface');
    const itemEncontrado = dadosCadastrados.find(item => item.sequencialAuto === buscaSeq);
    
    resultadoDiv.style.display = 'none';

    if (!itemEncontrado) {
        alert("Sequencial Automático não encontrado.");
        return;
    }

    const podeCorrigir = itemEncontrado.status !== 'Liberado';
    const statusClass = getStatusClass(itemEncontrado.status);

    resultadoDiv.style.display = 'block';
    
    let conteudoHTML = `
        <p><strong>Item Encontrado (NR: ${itemEncontrado.nr})</strong></p>
        <p>Status: <span class="${statusClass}">${itemEncontrado.status}</span></p>
        <p>Sequencial Digitado Atual: <strong>${itemEncontrado.sequencialDigitado}</strong></p>
    `;

    if (!podeCorrigir) {
        conteudoHTML += '<p class="status-liberado">Este item está com status **Liberado** e não pode ser corrigido.</p>';
        resultadoDiv.innerHTML = conteudoHTML;
        return;
    }

    // Formulário de Correção
    conteudoHTML += `
        <hr>
        <h3>Corrigir Sequencial Digitado</h3>
        <label for="corretorNome">Seu Nome (Corretor):</label>
        <input type="text" id="corretorNome" placeholder="Seu nome" required>
        
        <label for="novoSequencialDigitado">Novo Sequencial Digitado:</label>
        <input type="text" id="novoSequencialDigitado" value="${itemEncontrado.sequencialDigitado}" required>
        
        <label for="motivoCorrecao">Motivo da Correção:</label>
        <textarea id="motivoCorrecao" placeholder="Descreva o motivo da alteração..." required></textarea>

        <button id="btnCorrigir" onclick="corrigirSequencialDigitado(${itemEncontrado.nr})">Aplicar Correção</button>
    `;

    resultadoDiv.innerHTML = conteudoHTML;
}

function corrigirSequencialDigitado(nr) {
    const corretorNome = document.getElementById('corretorNome').value.trim();
    const novoSequencial = document.getElementById('novoSequencialDigitado').value.trim();
    const motivoCorrecao = document.getElementById('motivoCorrecao').value.trim();

    if (!corretorNome || !novoSequencial || !motivoCorrecao) {
        alert("Todos os campos de correção são obrigatórios!");
        return;
    }

    const itemIndex = dadosCadastrados.findIndex(item => item.nr === nr);
    if (itemIndex === -1) return;

    const item = dadosCadastrados[itemIndex];
    const sequencialAnterior = item.sequencialDigitado;
    
    if (item.status === 'Liberado') {
        alert("ERRO: Item Liberado não pode ser corrigido.");
        return;
    }

    item.sequencialDigitado = novoSequencial;

    item.historicoCorrecao.push({
        corretor: corretorNome,
        motivo: motivoCorrecao,
        anterior: sequencialAnterior,
        novo: novoSequencial,
        data: new Date().toLocaleDateString('pt-BR')
    });

    alert(`Correção realizada com sucesso!\nNR: ${nr}\nAntigo: ${sequencialAnterior}\nNovo: ${novoSequencial}`);

    document.getElementById('buscaSeqCorrecao').value = '';
    document.getElementById('correcaoInterface').style.display = 'none';
}


function buscarParaLiberacaoCQM() {
    const buscaSeq = document.getElementById('buscaSeqCQM').value.trim();
    const resultadoDiv = document.getElementById('resultadoCQM');
    
    const itemEncontrado = dadosCadastrados.find(item => item.sequencialAuto === buscaSeq);

    if (itemEncontrado) {
        const statusClass = getStatusClass(itemEncontrado.status);

        resultadoDiv.innerHTML = `
            <p><strong>Sequencial Encontrado!</strong></p>
            <p>NR: ${itemEncontrado.nr}</p>
            <p>Criador: ${itemEncontrado.criador}</p>
            <p>Status Atual: <span class="${statusClass}">${itemEncontrado.status}</span></p>
            <p>Observações: ${itemEncontrado.observacoes}</p>
            <button id="btnLiberarCQM" onclick="liberarSequencialCQM(${itemEncontrado.nr})" 
                ${itemEncontrado.status !== 'No CQM' ? 'disabled' : ''}>
                ${itemEncontrado.status === 'No CQM' ? 'Aprovar CQM (Mudar para Na Recepção)' : 'Já Aprovado ou Liberado'}
            </button>
        `;
    } else {
        resultadoDiv.innerHTML = '<p class="status-nocqm">Sequencial não encontrado. Verifique o número digitado.</p>';
    }
}

function liberarSequencialCQM(nr) {
    const liberador = document.getElementById('liberadorCQMNome').value;
    if (!liberador) {
        alert("Por favor, digite seu nome (Aprovador CQM) antes de prosseguir.");
        return;
    }
    
    const index = dadosCadastrados.findIndex(item => item.nr === nr);
    if (index !== -1 && dadosCadastrados[index].status === 'No CQM') {
        dadosCadastrados[index].status = 'Na Recepção';
        alert(`Sequencial NR ${nr} APROVADO PELO CQM por ${liberador}! Status: Na Recepção.`);
        buscarParaLiberacaoCQM(); 
    }
}


function buscarParaAcao() {
    const buscaSeq = document.getElementById('buscaSeqAcao').value.trim();
    const resultadoDiv = document.getElementById('resultadoAcao');
    
    const itemEncontrado = dadosCadastrados.find(item => item.sequencialAuto === buscaSeq);

    if (itemEncontrado) {
        const statusClass = getStatusClass(itemEncontrado.status);

        resultadoDiv.innerHTML = `
            <p><strong>Sequencial Encontrado!</strong></p>
            <p>NR: ${itemEncontrado.nr}</p>
            <p>Criador: ${itemEncontrado.criador}</p>
            <p>Status Atual: <span class="${statusClass}">${itemEncontrado.status}</span></p>
            <p>Observações: ${itemEncontrado.observacoes}</p>
            <button id="btnLiberarFinal" onclick="liberarSequencialFinal(${itemEncontrado.nr})" 
                ${itemEncontrado.status !== 'Na Recepção' ? 'disabled' : ''}>
                ${itemEncontrado.status === 'Na Recepção' ? 'Liberar FINAL (Mudar para Liberado)' : 'Não pronto para liberação final'}
            </button>
        `;
    } else {
        resultadoDiv.innerHTML = '<p class="status-nocqm">Sequencial não encontrado. Verifique o número digitado.</p>';
    }
}

function liberarSequencialFinal(nr) {
    const liberador = document.getElementById('liberadorFinalNome').value;
    if (!liberador) {
        alert("Por favor, digite seu nome (Liberador Final) antes de prosseguir.");
        return;
    }
    
    const index = dadosCadastrados.findIndex(item => item.nr === nr);
    if (index !== -1 && dadosCadastrados[index].status === 'Na Recepção') {
        dadosCadastrados[index].status = 'Liberado';
        alert(`Sequencial NR ${nr} LIBERADO FINALMENTE por ${liberador}! Status: Liberado.`);
        buscarParaAcao(); 
    }
}


function getStatusClass(status) {
    switch (status) {
        case 'No CQM':
            return 'status-nocqm';
        case 'Na Recepção':
            return 'status-narecepcao';
        case 'Liberado':
            return 'status-liberado';
        default:
            return '';
    }
}

function carregarListaGeral() {
    const corpoTabela = document.getElementById('corpoTabelaCadastros');
    corpoTabela.innerHTML = ''; 

    if (dadosCadastrados.length === 0) {
        corpoTabela.innerHTML = '<tr><td colspan="9">Nenhum cadastro encontrado.</td></tr>'; 
        return;
    }

    dadosCadastrados.forEach(item => {
        const novaLinha = corpoTabela.insertRow();
        
        const statusClass = getStatusClass(item.status);
        const ajustado = item.historicoCorrecao && item.historicoCorrecao.length > 0;
        
        // 1. Célula do Ícone de Correção (Índice 0)
        const iconeCell = novaLinha.insertCell(0);
        if (ajustado) {
            const ultimoAjuste = item.historicoCorrecao[item.historicoCorrecao.length - 1];
            iconeCell.innerHTML = `<span class="ajustado-icone" title="Ajustado por: ${ultimoAjuste.corretor} em ${ultimoAjuste.data}. Motivo: ${ultimoAjuste.motivo}">⚙️</span>`;
        } else {
            iconeCell.textContent = '';
        }

        // 2. Demais Células (Índices ajustados)
        novaLinha.insertCell(1).textContent = item.nr;
        novaLinha.insertCell(2).textContent = item.sequencialAuto;
        novaLinha.insertCell(3).textContent = item.sequencialDigitado;
        novaLinha.insertCell(4).textContent = item.criador;
        novaLinha.insertCell(5).textContent = item.tipoOperacao;
        
        const statusCell = novaLinha.insertCell(6);
        statusCell.textContent = item.status;
        statusCell.classList.add(statusClass);

        novaLinha.insertCell(7).textContent = item.dataCadastro;
        novaLinha.insertCell(8).textContent = item.observacoes;
        
        novaLinha.setAttribute('data-nr', item.nr);
        novaLinha.setAttribute('data-status', item.status.toLowerCase());
    });

    aplicarFiltro();
}

/**
 * Função principal de filtragem. Esconde/mostra as linhas da tabela.
 */
function aplicarFiltro() {
    const termo = document.getElementById('termoPesquisa').value.toLowerCase().trim();
    const colunaFiltro = document.getElementById('filtroColuna').value;
    const linhas = document.getElementById('corpoTabelaCadastros').getElementsByTagName('tr');
    
    const indiceColuna = colunaMap[colunaFiltro];
    const filtrarPorColunaEspecifica = (colunaFiltro !== 'todos');

    for (let i = 0; i < linhas.length; i++) {
        const linha = linhas[i];
        
        if (linha.cells.length < 9) { 
             linha.style.display = ""; 
             continue;
        }

        let corresponde = false;

        if (termo === '') {
            corresponde = true;
        } 
        else if (filtrarPorColunaEspecifica) {
            const celula = linha.cells[indiceColuna];
            if (celula) {
                const textoCelula = (celula.textContent || celula.innerText).toLowerCase();
                if (textoCelula.includes(termo)) {
                    corresponde = true;
                }
            }
        } 
        else {
            for (let j = 1; j < linha.cells.length; j++) { 
                const celula = linha.cells[j];
                const textoCelula = (celula.textContent || celula.innerText).toLowerCase();
                if (textoCelula.includes(termo)) {
                    corresponde = true;
                    break;
                }
            }
        }

        linha.style.display = corresponde ? "" : "none";
    }
}