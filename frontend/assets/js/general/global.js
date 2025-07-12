//Função para mostrar mensagens de sucesso/erro
function mostrarToast(mensagem, tipo = 'success') {
    const toastElemento = document.getElementById('toastMensagem');
    const toastTexto = document.getElementById('toastTexto');

    // Define a mensagem
    toastTexto.textContent = mensagem;

    // Remove classes anteriores de cor
    toastElemento.classList.remove('text-bg-success', 'text-bg-danger');

    // Adiciona a nova cor conforme o tipo
    if (tipo === 'error') {
        toastElemento.classList.add('text-bg-danger');
    } else {
        toastElemento.classList.add('text-bg-success');
    }

    // Mostra o toast usando Bootstrap
    const toast = new bootstrap.Toast(toastElemento);
    toast.show();
}

//Mostra nome do usuário na tela
document.addEventListener('DOMContentLoaded', () => {
    const nomeCompleto = localStorage.getItem('usuario');

    if (nomeCompleto) {
        const primeiroNome = nomeCompleto.split(' ')[0];
        document.getElementById('nomeUsuario').textContent = `Olá, ${primeiroNome}`;
    }

    const botaoEmail = document.querySelector('[data-bs-target="#alterarEmail"]');
    const botaoSenha = document.querySelector('[data-bs-target="#alterarSenha"]');
    const collapseEmailEl = document.getElementById('alterarEmail');
    const collapseSenhaEl = document.getElementById('alterarSenha');

    // Inicializa os collapses manualmente para evitar que abram automaticamente
    const collapseEmail = new bootstrap.Collapse(collapseEmailEl, { toggle: false });
    const collapseSenha = new bootstrap.Collapse(collapseSenhaEl, { toggle: false });

    // Exclusividade: abre um e fecha o outro
    botaoEmail.addEventListener('click', () => {
        collapseSenha.hide();
        collapseEmail.toggle(); // Alterna o email (abre/fecha)
    });

    botaoSenha.addEventListener('click', () => {
        collapseEmail.hide();
        collapseSenha.toggle(); // Alterna a senha (abre/fecha)
    });
});

// Função pra redirecionar pro login de forma dinâmica
function redirectToLogin() {
    const path = window.location.pathname;
    const isInPages = path.includes('/pages/');

    if (isInPages) {
        window.location.href = '../login.html';
    } else {
        window.location.href = 'login.html';
    }
}

// Logout - limpa localStorage e redireciona
document.getElementById('logoutBtn').addEventListener('click', () => {
    localStorage.clear();
    redirectToLogin();
});

// Verifica se tem usuário logado, se não tiver joga pro login
document.addEventListener('DOMContentLoaded', () => {
    const nome = localStorage.getItem('usuario');

    if (!nome) {
        redirectToLogin();
    }
});

// Corrige cache quando navega com botão voltar do navegador
window.addEventListener('pageshow', function (event) {
    if (event.persisted || performance.getEntriesByType("navigation")[0].type === "back_forward") {
        window.location.reload();
    }
});

document.addEventListener('DOMContentLoaded', () => {
    const nomeCompleto = localStorage.getItem('usuario');
    const email = localStorage.getItem('email');

    if (nomeCompleto) {
        document.getElementById('nomeUsuarioModal').textContent = nomeCompleto;
    }

    if (email) {
        document.getElementById('emailUsuarioModal').textContent = email;
    }
});

//Atualizar troca do email
document.getElementById('btnSalvarAlteracoes').addEventListener('click', async () => {
    const emailAtual = localStorage.getItem('email') || localStorage.getItem('usuario');

    const novoEmail = document.getElementById('novoEmail').value.trim();
    const novaSenha = document.getElementById('novaSenha').value.trim();
    const confirmarSenha = document.getElementById('confirmarSenha').value.trim();

    let alterouAlgo = false;

    // Validação e alteração do email
    if (novoEmail) {
        if (novoEmail === emailAtual) {
            mostrarToast('O novo e-mail é igual ao atual.', 'error');
            return;
        }

        try {
            const response = await fetch(
                `http://localhost:8080/usuarios/email?emailAtual=${encodeURIComponent(emailAtual)}&novoEmail=${encodeURIComponent(novoEmail)}`,
                { method: 'PUT' }
            );
            const resultado = await response.text();

            if (response.ok) {
                localStorage.setItem('email', novoEmail);
                document.getElementById('emailUsuarioModal').textContent = novoEmail;
                document.getElementById('novoEmail').value = '';
                mostrarToast('E-mail atualizado com sucesso!');
                alterouAlgo = true;
            } else {
                mostrarToast(`Erro ao atualizar e-mail: ${resultado}`, 'error');
                return;
            }
        } catch (err) {
            mostrarToast('Erro ao conectar com o servidor para alterar e-mail.', 'error');
            return;
        }
    }

    // Validação e alteração da senha
    if (novaSenha || confirmarSenha) {
        if (!novaSenha || !confirmarSenha) {
            mostrarToast('Preencha ambos os campos de senha.', 'error');
            return;
        }
        if (novaSenha !== confirmarSenha) {
            mostrarToast('As senhas não coincidem.', 'error');
            return;
        }

        try {
            const responseSenha = await fetch(
                `http://localhost:8080/usuarios/senha?email=${encodeURIComponent(emailAtual)}&novaSenha=${encodeURIComponent(novaSenha)}`,
                { method: 'PUT' }
            );
            const resultadoSenha = await responseSenha.text();

            if (responseSenha.ok) {
                document.getElementById('novaSenha').value = '';
                document.getElementById('confirmarSenha').value = '';
                mostrarToast('Senha atualizada com sucesso!');
                alterouAlgo = true;
            } else {
                mostrarToast(`Erro ao atualizar senha: ${resultadoSenha}`, 'error');
                return;
            }
        } catch {
            mostrarToast('Erro ao conectar com o servidor para alterar senha.', 'error');
            return;
        }
    }

    // Caso o usuário não tenha preenchido nenhum campo para alteração
    if (!alterouAlgo) {
        mostrarToast('Nenhuma alteração para salvar.', 'error');
    }
});


const modalMinhaConta = document.getElementById('modalMinhaConta');
modalMinhaConta.addEventListener('show.bs.modal', () => {
    const nome = localStorage.getItem('usuario');
    const email = localStorage.getItem('email');
    document.getElementById('nomeUsuarioModal').textContent = nome || 'Usuário';
    document.getElementById('emailUsuarioModal').textContent = email || 'email@dominio.com';
});