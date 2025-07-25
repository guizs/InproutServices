// ==========================================================
// FUNÇÕES GLOBAIS E AUXILIARES
// ==========================================================

/**
 * Mostra uma notificação toast na tela.
 * @param {string} mensagem A mensagem a ser exibida.
 * @param {string} [tipo='success'] O tipo do toast ('success' ou 'error').
 */
function mostrarToast(mensagem, tipo = 'success') {
    const toastElemento = document.getElementById('toastMensagem');
    const toastTexto = document.getElementById('toastTexto');
    if (!toastElemento || !toastTexto) return;

    toastTexto.textContent = mensagem;
    toastElemento.classList.remove('text-bg-success', 'text-bg-danger');
    toastElemento.classList.add(tipo === 'error' ? 'text-bg-danger' : 'text-bg-success');

    const toast = new bootstrap.Toast(toastElemento);
    toast.show();
}

/**
 * Redireciona o usuário para a página de login, ajustando o caminho
 * se ele estiver dentro do diretório /pages.
 */
function redirectToLogin() {
    const path = window.location.pathname;
    const isInPages = path.includes('/pages/');
    window.location.href = isInPages ? '../login.html' : 'login.html';
}

// ==========================================================
// EVENTO PRINCIPAL - EXECUTADO QUANDO A PÁGINA CARREGA
// ==========================================================

document.addEventListener('DOMContentLoaded', () => {

    // --- 1. VERIFICAÇÃO DE AUTENTICAÇÃO ---
    const nomeCompleto = localStorage.getItem('usuario');
    if (!nomeCompleto) {
        redirectToLogin();
        return; // Interrompe a execução se não houver usuário
    }

    // --- 2. CONFIGURAÇÕES DA INTERFACE DO USUÁRIO ---
    // Mostra o primeiro nome do usuário na barra de navegação
    const primeiroNome = nomeCompleto.split(' ')[0];
    const nomeUsuarioEl = document.getElementById('nomeUsuario');
    if (nomeUsuarioEl) {
        nomeUsuarioEl.textContent = `Olá, ${primeiroNome}`;
    }

    // --- 3. EVENT LISTENERS GLOBAIS ---

    // Botão de Logout
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', () => {
            localStorage.clear();
            redirectToLogin();
        });
    }

    // Botão para salvar alterações na "Minha Conta"
    const btnSalvarAlteracoes = document.getElementById('btnSalvarAlteracoes');
    if (btnSalvarAlteracoes) {
        btnSalvarAlteracoes.addEventListener('click', async () => {
            const emailAtual = localStorage.getItem('email');
            const novoEmail = document.getElementById('novoEmail').value.trim();
            const novaSenha = document.getElementById('novaSenha').value.trim();
            const confirmarSenha = document.getElementById('confirmarSenha').value.trim();
            let alterouAlgo = false;

            // Lógica para alterar e-mail
            if (novoEmail) {
                if (novoEmail === emailAtual) {
                    return mostrarToast('O novo e-mail é igual ao atual.', 'error');
                }
                try {
                    const response = await fetch(`http://localhost:8080/usuarios/email?emailAtual=${encodeURIComponent(emailAtual)}&novoEmail=${encodeURIComponent(novoEmail)}`, { method: 'PUT' });
                    if (!response.ok) {
                        const resultado = await response.text();
                        throw new Error(resultado);
                    }
                    localStorage.setItem('email', novoEmail);
                    document.getElementById('emailUsuarioModal').textContent = novoEmail;
                    document.getElementById('novoEmail').value = '';
                    mostrarToast('E-mail atualizado com sucesso!');
                    alterouAlgo = true;
                } catch (err) {
                    return mostrarToast(`Erro ao atualizar e-mail: ${err.message}`, 'error');
                }
            }

            // Lógica para alterar senha
            if (novaSenha || confirmarSenha) {
                if (novaSenha !== confirmarSenha) return mostrarToast('As senhas não coincidem.', 'error');
                if (!novaSenha) return mostrarToast('Preencha ambos os campos de senha.', 'error');

                try {
                    const responseSenha = await fetch(`http://localhost:8080/usuarios/senha?email=${encodeURIComponent(localStorage.getItem('email'))}&novaSenha=${encodeURIComponent(novaSenha)}`, { method: 'PUT' });
                    if (!responseSenha.ok) {
                        const resultadoSenha = await responseSenha.text();
                        throw new Error(resultadoSenha);
                    }
                    document.getElementById('novaSenha').value = '';
                    document.getElementById('confirmarSenha').value = '';
                    mostrarToast('Senha atualizada com sucesso!');
                    alterouAlgo = true;
                } catch (err) {
                    return mostrarToast(`Erro ao atualizar senha: ${err.message}`, 'error');
                }
            }

            if (!alterouAlgo) {
                mostrarToast('Nenhuma alteração para salvar.', 'error');
            }
        });
    }

    // --- 4. CONFIGURAÇÃO DO MODAL "MINHA CONTA" ---
    const modalMinhaConta = document.getElementById('modalMinhaConta');
    if (modalMinhaConta) {
        modalMinhaConta.addEventListener('show.bs.modal', async () => {
            // --- Preenche os dados básicos do usuário ---
            document.getElementById('nomeUsuarioModal').textContent = localStorage.getItem('usuario') || 'Usuário';
            document.getElementById('emailUsuarioModal').textContent = localStorage.getItem('email') || 'email@dominio.com';

            // --- LÓGICA PARA EXIBIR CARGO E SEGMENTOS ---
            const userRole = (localStorage.getItem('role') || '').toUpperCase();
            const userSegmentoIds = JSON.parse(localStorage.getItem('segmentos')) || [];
            const detalhesContainer = modalMinhaConta.querySelector('#userInfoDetalhes');

            if (detalhesContainer) {
                detalhesContainer.innerHTML = ''; // Limpa o conteúdo anterior

                // Verifica se o usuário é Gestor ou Coordenador
                if (userRole === 'MANAGER' || userRole === 'COORDINATOR') {
                    const roleTraduzido = userRole === 'MANAGER' ? 'Gestor' : 'Coordenador';

                    try {
                        // Busca a lista completa de segmentos na API
                        const response = await fetch('http://localhost:8080/segmentos');
                        if (!response.ok) throw new Error('Falha ao buscar segmentos.');
                        const todosSegmentos = await response.json();

                        // Mapeia os IDs dos segmentos do usuário para seus nomes
                        const nomesSegmentos = userSegmentoIds.map(id => {
                            const segmento = todosSegmentos.find(s => s.id === id);
                            return segmento ? segmento.nome : null;
                        }).filter(Boolean); // Remove nulos caso algum ID não seja encontrado

                        const segmentosTexto = nomesSegmentos.length > 0 ? nomesSegmentos.join(', ') : 'Nenhum segmento associado';

                        // Exibe as informações formatadas no container
                        detalhesContainer.innerHTML = `
                        <div class="text-center">
                            <span class="badge bg-success mb-2" style="font-size: 0.9rem;">${roleTraduzido}</span>
                            <p class="text-muted small mb-0"><strong>Segmentos:</strong> ${segmentosTexto}</p>
                        </div>
                    `;
                    } catch (error) {
                        console.error("Erro ao buscar segmentos:", error);
                        detalhesContainer.innerHTML = `<p class="text-danger small">Erro ao carregar segmentos.</p>`;
                    }
                }
            }

            // --- Configura os botões e collapses INTERNOS do modal ---
            const botaoEmail = modalMinhaConta.querySelector('[data-bs-target="#alterarEmail"]');
            const botaoSenha = modalMinhaConta.querySelector('[data-bs-target="#alterarSenha"]');
            const collapseEmailEl = modalMinhaConta.querySelector('#alterarEmail');
            const collapseSenhaEl = modalMinhaConta.querySelector('#alterarSenha');

            if (botaoEmail && botaoSenha && collapseEmailEl && collapseSenhaEl) {
                const collapseEmail = new bootstrap.Collapse(collapseEmailEl, { toggle: false });
                const collapseSenha = new bootstrap.Collapse(collapseSenhaEl, { toggle: false });

                botaoEmail.addEventListener('click', () => {
                    collapseSenha.hide();
                    collapseEmail.toggle();
                });

                botaoSenha.addEventListener('click', () => {
                    collapseEmail.hide();
                    collapseSenha.toggle();
                });
            }
        });
    }
});

// Corrige cache quando navega com botão "voltar" do navegador
window.addEventListener('pageshow', (event) => {
    const navEntries = performance.getEntriesByType && performance.getEntriesByType("navigation");
    if (event.persisted || (navEntries && navEntries.length > 0 && navEntries[0].type === "back_forward")) {
        window.location.reload();
    }
});