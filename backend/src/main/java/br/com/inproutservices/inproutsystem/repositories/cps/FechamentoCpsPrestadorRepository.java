package br.com.inproutservices.inproutsystem.repositories.cps;

import br.com.inproutservices.inproutsystem.entities.cps.FechamentoCpsPrestador;
import br.com.inproutservices.inproutsystem.entities.index.Prestador;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface FechamentoCpsPrestadorRepository extends JpaRepository<FechamentoCpsPrestador, Long> {

    // Busca um fechamento específico para um prestador em um determinado mês/ano.
    Optional<FechamentoCpsPrestador> findByPrestadorAndMesAndAno(Prestador prestador, int mes, int ano);

    // Busca todos os fechamentos de um determinado mês/ano.
    List<FechamentoCpsPrestador> findByMesAndAno(int mes, int ano);
}