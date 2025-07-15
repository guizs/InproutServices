package br.com.inproutservices.inproutsystem.repositories.materiais;

import br.com.inproutservices.inproutsystem.entities.materiais.Material;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;

/**
 * Repositório para a entidade Material.
 * JpaRepository<Material, Long> nos dá todos os métodos CRUD básicos
 * para a entidade Material, que tem uma chave primária (ID) do tipo Long.
 */
@Repository
public interface MaterialRepository extends JpaRepository<Material, Long> {

    /**
     * Busca um material pelo seu campo 'codigo'.
     * O Spring Data JPA cria a consulta automaticamente a partir do nome do método.
     *
     * @param codigo O código a ser buscado.
     * @return um Optional contendo o Material se encontrado, ou vazio caso contrário.
     */
    Optional<Material> findByCodigo(String codigo);

}