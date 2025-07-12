package br.com.inproutservices.inproutsystem.services.atividades;

import br.com.inproutservices.inproutsystem.dtos.atividades.AcaoCoordenadorDTO;
import br.com.inproutservices.inproutsystem.dtos.atividades.LancamentoRequestDTO;
import br.com.inproutservices.inproutsystem.entities.atividades.Lancamento;

public interface LancamentoService {

    /**
     * Cria um novo lançamento no estado RASCUNHO.
     * @param dto Os dados do lançamento vindos do frontend.
     * @param managerId O ID do usuário (Manager) que está criando.
     * @return O lançamento salvo.
     */
    Lancamento criarLancamento(LancamentoRequestDTO dto, Long managerId);

    Lancamento solicitarNovoPrazo(Long lancamentoId, AcaoCoordenadorDTO dto);
    Lancamento aprovarExtensaoPrazo(Long lancamentoId, Long controllerId);
    Lancamento rejeitarExtensaoPrazo(Long lancamentoId, Long controllerId, String motivoRejeicao);
    /**
     * Busca todos os lançamentos em RASCUNHO e os submete para aprovação do Coordenador.
     * Este método será chamado pela tarefa agendada.
     */
    void submeterLancamentosDiarios();

    /**
     * Coordenador aprova um lançamento, movendo-o para a fila do Controller.
     */
    Lancamento aprovarPeloCoordenador(Long lancamentoId, Long coordenadorId);

    /**
     * Controller aprova um lançamento, finalizando o fluxo.
     */
    Lancamento aprovarPeloController(Long lancamentoId, Long controllerId);

    /**
     * Controller rejeita um lançamento, devolvendo-o para a fila do Coordenador com um comentário.
     */
    Lancamento rejeitarPeloController(Long lancamentoId, Long controllerId, String motivoRejeicao);

    Lancamento getLancamentoById(Long id);
}