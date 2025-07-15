package br.com.inproutservices.inproutsystem.repositories.atividades;

import br.com.inproutservices.inproutsystem.entities.atividades.Lancamento;
import br.com.inproutservices.inproutsystem.enums.atividades.SituacaoAprovacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    /**
     * Encontra todos os lançamentos com uma situação de aprovação específica.
     * Usaremos isso para a tarefa agendada encontrar todos os RASCUNHOS.
     */
    List<Lancamento> findBySituacaoAprovacao(SituacaoAprovacao situacao);

    /**
     * Encontra o primeiro lançamento (o mais antigo) de uma OS específica
     * que está com a situação de aprovação PENDENTE_COORDENADOR.
     * A ordenação por data de criação garante que pegaremos o mais antigo.
     */
    Optional<Lancamento> findFirstByOsIdAndSituacaoAprovacaoOrderByDataCriacaoAsc(Long osId, SituacaoAprovacao situacao);

    /**
     * Busca um Lançamento pelo seu ID, já trazendo (FETCH) os dados do manager, da OS e dos comentários
     * com seus respectivos autores, tudo em uma única consulta otimizada.
     */
    @Query("SELECT l FROM Lancamento l LEFT JOIN FETCH l.manager LEFT JOIN FETCH l.os LEFT JOIN FETCH l.comentarios c LEFT JOIN FETCH c.autor WHERE l.id = :id")
    Optional<Lancamento> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT l FROM Lancamento l LEFT JOIN FETCH l.manager LEFT JOIN FETCH l.os")
    List<Lancamento> findAllWithDetails();
}