function mostrarMensagem(texto, tipo = 'success') {
      const mensagemEl = document.getElementById('mensagem');
      mensagemEl.classList.remove('d-none', 'alert-success', 'alert-error');
      mensagemEl.classList.add('alert', tipo === 'success' ? 'alert-success' : 'alert-error');
      mensagemEl.textContent = texto;
    }
    
    // ALTERAÇÃO: O listener agora está no formulário e escuta o evento 'submit'
    document.getElementById('formLogin').addEventListener('submit', async (event) => {
    event.preventDefault(); // Impede que a página recarregue

    const email = document.getElementById('email').value;
    const senha = document.getElementById('senha').value;

    if (!email || !senha) {
      mostrarMensagem('Preencha todos os campos!', 'error');
      return;
    }

    document.getElementById('overlay-loader').classList.remove('d-none');

    const payload = JSON.stringify({ email, senha });

    try {
      const response = await fetch('http://localhost:8080/usuarios/login', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: payload
      });

      if (response.ok) {
        const data = await response.json();

        localStorage.setItem('token', data.token);
        localStorage.setItem('usuarioId', data.id);
        localStorage.setItem('usuario', data.usuario);
        localStorage.setItem('email', data.email);
        localStorage.setItem('role', data.role);

        setTimeout(() => {
          window.location.href = 'index.html';
        }, 1500);
      } else {
        mostrarMensagem('E-mail ou senha inválidos!', 'error');
      }

    } catch (error) {
      mostrarMensagem('Erro ao conectar com o servidor.', 'error');
    } finally {
      document.getElementById('overlay-loader').classList.add('d-none');
    }
  });