package br.com.inproutservices.inproutsystem.repositories.atividades;

import br.com.inproutservices.inproutsystem.entities.os.OS;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface OsRepository extends JpaRepository<OS, Long> {

    /**
     * Busca todas as OSs, trazendo junto (FETCH) os dados de LPU e Lançamentos
     * para evitar LazyInitializationException.
     */
    @Query("SELECT DISTINCT os FROM OS os LEFT JOIN FETCH os.lpu LEFT JOIN FETCH os.lancamentos")
    List<OS> findAllWithDetails();

    // Você também pode criar uma versão para o findById
    @Query("SELECT os FROM OS os LEFT JOIN FETCH os.lpu LEFT JOIN FETCH os.lancamentos WHERE os.id = :id")
    Optional<OS> findByIdWithDetails(Long id);
}