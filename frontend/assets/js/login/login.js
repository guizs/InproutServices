// Função para ler um cookie específico
function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(';').shift();
}

// Verifica se o cookie "lembrar-me" existe quando a página carrega
document.addEventListener('DOMContentLoaded', () => {
    const rememberedEmail = getCookie('remember-me');
    if (rememberedEmail) {
        document.getElementById('email').value = decodeURIComponent(rememberedEmail);
        document.getElementById('lembrarMe').checked = true;
    }
});


// Função para mostrar mensagens (já existe, mantenha como está)
function mostrarMensagem(texto, tipo = 'success') {
    const mensagemEl = document.getElementById('mensagem');
    mensagemEl.classList.remove('d-none', 'alert-success', 'alert-error');
    mensagemEl.classList.add('alert', tipo === 'success' ? 'alert-success' : 'alert-error');
    mensagemEl.textContent = texto;
}

document.getElementById('formLogin').addEventListener('submit', async (event) => {
    event.preventDefault();

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;
    const lembrarMe = document.getElementById('lembrarMe').checked;
    const btnLogin = document.getElementById('btnLogin');
    const btnText = btnLogin.querySelector('.btn-text');
    const spinner = btnLogin.querySelector('.spinner-border');

    if (!email || !senha) {
        mostrarMensagem('Preencha todos os campos!', 'error');
        return;
    }

    // Ativa o estado de carregamento do botão
    btnLogin.disabled = true;
    btnText.textContent = 'Entrando...';
    spinner.classList.remove('d-none');

    const payload = JSON.stringify({ email, senha, lembrarMe });

    try {
        const response = await fetch('http://3.128.248.3:8080/usuarios/login', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: payload,
            credentials: 'include' // <-- ADICIONE ESTA LINHA
        });

        if (response.ok) {
            const data = await response.json();
            
            localStorage.setItem('usuarioId', data.id);
            localStorage.setItem('usuario', data.usuario);
            localStorage.setItem('email', data.email);
            localStorage.setItem('role', data.role);
            localStorage.setItem('segmentos', JSON.stringify(data.segmentos));
            localStorage.setItem('lastActivity', new Date().getTime());

            mostrarMensagem('Login bem-sucedido! Redirecionando...', 'success');
            setTimeout(() => {
                window.location.href = 'index.html';
            }, 1000);
        } else {
            mostrarMensagem('E-mail ou senha inválidos!', 'error');
            // Restaura o botão em caso de erro
            btnLogin.disabled = false;
            btnText.textContent = 'Entrar';
            spinner.classList.add('d-none');
        }

    } catch (error) {
        mostrarMensagem('Erro ao conectar com o servidor.', 'error');
        // Restaura o botão em caso de erro de conexão
        btnLogin.disabled = false;
        btnText.textContent = 'Entrar';
        spinner.classList.add('d-none');
    }
});