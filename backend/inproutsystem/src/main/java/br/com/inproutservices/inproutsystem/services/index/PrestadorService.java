package br.com.inproutservices.inproutsystem.services.index;

import br.com.inproutservices.inproutsystem.entities.index.Prestador;
import br.com.inproutservices.inproutsystem.repositories.index.PrestadorRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional; // Importe esta anotação

import java.util.List;
import java.util.Optional;

@Service
public class PrestadorService {

    @Autowired
    private PrestadorRepository prestadorRepository;

    public List<Prestador> listarTodos() {
        return prestadorRepository.findAll(Sort.by(Sort.Direction.ASC, "id"));
    }

    public List<Prestador> listarAtivos() {
        return prestadorRepository.findByAtivoTrue();
    }

    public List<Prestador> listarDesativados() {
        return prestadorRepository.findByAtivoFalse();
    }

    public Optional<Prestador> buscarPorCodigo(Long codigo) {
        return prestadorRepository.findByCodigoPrestador(codigo);
    }

    @Transactional
    public Prestador salvar(Prestador prestador) {
        if (prestadorRepository.existsByCodigoPrestador(prestador.getCodigoPrestador())) {
            throw new RuntimeException("Já existe um prestador com esse código!");
        }
        prestador.setAtivo(true);
        return prestadorRepository.save(prestador);
    }

    public Optional<Prestador> buscarPorId(Long id) {
        return prestadorRepository.findById(id);
    }

    @Transactional
    public void desativar(Long codigo) {
        Prestador prestador = prestadorRepository.findByCodigoPrestador(codigo)
                .orElseThrow(() -> new RuntimeException("Prestador não encontrado"));

        prestador.setAtivo(false);
        prestadorRepository.save(prestador);
    }

    @Transactional
    public void ativar(Long codigo) {
        Prestador prestador = prestadorRepository.findByCodigoPrestador(codigo)
                .orElseThrow(() -> new RuntimeException("Prestador não encontrado"));

        prestador.setAtivo(true);
        prestadorRepository.save(prestador);
    }

    // --- MÉTODO DE ATUALIZAÇÃO ADICIONADO ---

    /**
     * Atualiza um prestador existente no banco de dados.
     * @param id O ID (chave primária) do prestador a ser atualizado.
     * @param dadosNovos Um objeto Prestador contendo os novos dados.
     * @return O objeto Prestador após ser salvo com as atualizações.
     */
    @Transactional
    public Prestador atualizar(Long id, Prestador dadosNovos) {
        // 1. Busca o prestador pelo ID (chave primária) para garantir que estamos alterando o correto.
        Prestador prestadorExistente = prestadorRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("Prestador não encontrado com o ID: " + id));

        // 2. VALIDAÇÃO: Verifica se o novo 'codigoPrestador' (se foi alterado) já não está em uso por OUTRO prestador.
        Optional<Prestador> prestadorComMesmoCodigo = prestadorRepository.findByCodigoPrestador(dadosNovos.getCodigoPrestador());
        if (prestadorComMesmoCodigo.isPresent() && !prestadorComMesmoCodigo.get().getId().equals(prestadorExistente.getId())) {
            // Se encontrou um prestador com o mesmo código, E o ID desse prestador é diferente do que estamos editando,
            // então lança um erro para evitar códigos duplicados.
            throw new RuntimeException("O código de prestador '" + dadosNovos.getCodigoPrestador() + "' já está em uso por outro prestador.");
        }

        // 3. Atualiza os dados do objeto que veio do banco com os novos dados.
        atualizarDados(prestadorExistente, dadosNovos);

        // 4. Salva as alterações. O JPA fará um UPDATE.
        return prestadorRepository.save(prestadorExistente);
    }

    /**
     * Método auxiliar para copiar apenas os campos permitidos do objeto com novos dados
     * para o objeto existente (que veio do banco).
     */
    private void atualizarDados(Prestador existente, Prestador novosDados) {
        // O campo 'codigoPrestador' também pode ser atualizado, desde que passe na validação acima.
        existente.setCodigoPrestador(novosDados.getCodigoPrestador());
        existente.setPrestador(novosDados.getPrestador());
        existente.setRazaoSocial(novosDados.getRazaoSocial());
        existente.setCidade(novosDados.getCidade());
        existente.setUf(novosDados.getUf());
        existente.setRegiao(novosDados.getRegiao());
        existente.setRg(novosDados.getRg());
        existente.setCpf(novosDados.getCpf());
        existente.setCnpj(novosDados.getCnpj());
        existente.setCodigoBanco(novosDados.getCodigoBanco());
        existente.setBanco(novosDados.getBanco());
        existente.setAgencia(novosDados.getAgencia());
        existente.setConta(novosDados.getConta());
        existente.setTipoDeConta(novosDados.getTipoDeConta());
        existente.setTelefone(novosDados.getTelefone());
        existente.setEmail(novosDados.getEmail());
        existente.setTipoPix(novosDados.getTipoPix());
        existente.setChavePix(novosDados.getChavePix());
        existente.setObservacoes(novosDados.getObservacoes());
    }
}