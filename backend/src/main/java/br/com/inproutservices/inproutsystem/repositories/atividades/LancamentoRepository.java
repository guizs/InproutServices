package br.com.inproutservices.inproutsystem.repositories.atividades;

import br.com.inproutservices.inproutsystem.entities.atividades.Lancamento;
import br.com.inproutservices.inproutsystem.enums.atividades.SituacaoAprovacao;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface LancamentoRepository extends JpaRepository<Lancamento, Long> {

    List<Lancamento> findBySituacaoAprovacao(SituacaoAprovacao situacao);

    Optional<Lancamento> findFirstByOsIdAndSituacaoAprovacaoOrderByDataCriacaoAsc(Long osId, SituacaoAprovacao situacao);

    @Query("SELECT l FROM Lancamento l LEFT JOIN FETCH l.manager LEFT JOIN FETCH l.os LEFT JOIN FETCH l.etapaDetalhada ed LEFT JOIN FETCH ed.etapa LEFT JOIN FETCH l.prestador LEFT JOIN FETCH l.comentarios c LEFT JOIN FETCH c.autor WHERE l.id = :id")
    Optional<Lancamento> findByIdWithDetails(@Param("id") Long id);

    @Query("SELECT DISTINCT l FROM Lancamento l LEFT JOIN FETCH l.manager LEFT JOIN FETCH l.os")
    List<Lancamento> findAllWithDetails();
}