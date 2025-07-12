document.addEventListener('DOMContentLoaded', () => {
  const form = document.getElementById('formAdicionar');

  form.addEventListener('submit', async function (e) {
    e.preventDefault();

    // IDs dos campos que quer enviar
    const campos = [
      'os', 'site', 'segmento', 'projeto', 'gestorTim', 'regional',
      'equipe', 'vistoria', 'planoVistoria', 'desmobilizacao', 'planoDesmobilizacao',
      'instalacao', 'planoInstalacao', 'ativacao', 'planoAtivacao', 'documentacao',
      'planoDocumentacao', 'etapaGeral', 'etapaDetalhada', 'status', 'detalheDiario',
      'codigoPrestador', 'prestador', 'valorAtividade', 'coordenador'
    ];

    const dados = {};

    campos.forEach(id => {
      let valor = document.getElementById(id)?.value.trim();

      // Ignora valores vazios, nulos ou "N/A" (case insensitive)
      if (valor && valor.toUpperCase() !== 'N/A') {
        // Se for campo 'valorAtividade', converte para número
        if (id === 'valorAtividade') {
          // Tenta converter vírgula para ponto e parseFloat
          const numero = parseFloat(valor.replace(',', '.'));
          if (!isNaN(numero)) {
            dados['valor'] = numero; // usa 'valor' porque no backend o campo é assim
          }
        } else {
          dados[id] = valor;
        }
      }
    });

    // Mostra no console o JSON que vai enviar
    console.log('JSON enviado:', JSON.stringify(dados, null, 2));

    try {
      const resposta = await fetch('http://localhost:8080/atividades', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(dados)
      });

      if (!resposta.ok) {
        throw new Error(`Erro ${resposta.status}`);
      }

      alert('Atividade adicionada com sucesso!');
      const modal = bootstrap.Modal.getInstance(document.getElementById('modalAdicionar'));
      modal.hide();
      form.reset();

    } catch (erro) {
      console.error('Erro ao salvar atividade:', erro);
      alert('Erro ao salvar. Veja o console.');
    }
  });
});