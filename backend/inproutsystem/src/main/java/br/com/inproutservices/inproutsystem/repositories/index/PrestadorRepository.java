package br.com.inproutservices.inproutsystem.repositories.index;

import br.com.inproutservices.inproutsystem.entities.index.Prestador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;
import java.util.List;
import java.util.Optional;

@Repository
public interface PrestadorRepository extends JpaRepository<Prestador, Long> {

    Optional<Prestador> findByCodigoPrestador(String codigoPrestador);

    boolean existsByCodigoPrestador(String codigoPrestador);

    List<Prestador> findByAtivoTrue();

    List<Prestador> findByAtivoFalse();
}