package br.com.inproutservices.inproutsystem.services.materiais;

import br.com.inproutservices.inproutsystem.dtos.materiais.MaterialRequestDTO;
import br.com.inproutservices.inproutsystem.entities.materiais.Material;
import br.com.inproutservices.inproutsystem.exceptions.materiais.BusinessException;
import br.com.inproutservices.inproutsystem.repositories.materiais.MaterialRepository;
import br.com.inproutservices.inproutsystem.exceptions.materiais.ResourceNotFoundException;
import br.com.inproutservices.inproutsystem.repositories.materiais.SolicitacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.Objects;


@Service
public class MaterialService {

    private final MaterialRepository materialRepository;
    private final SolicitacaoRepository solicitacaoRepository;

    public MaterialService(MaterialRepository materialRepository, SolicitacaoRepository solicitacaoRepository) {
        this.materialRepository = materialRepository;
        this.solicitacaoRepository = solicitacaoRepository;
    }

    @Transactional(readOnly = true)
    public List<Material> listarTodos() {
        return materialRepository.findAll();
    }

    @Transactional(readOnly = true)
    public Material buscarPorId(Long id) {
        return materialRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado com o ID: " + id));
    }

    @Transactional
    public Material criarMaterial(MaterialRequestDTO dto) {
        // Regra de negócio: Não permitir códigos duplicados
        materialRepository.findByCodigo(dto.codigo()).ifPresent(m -> {
            throw new BusinessException("O código '" + dto.codigo() + "' já está em uso.");
        });

        Material material = new Material();
        material.setCodigo(dto.codigo());
        material.setDescricao(dto.descricao());
        material.setUnidadeMedida(dto.unidadeMedida());
        material.setSaldoFisico(dto.saldoFisicoInicial());

        return materialRepository.save(material);
    }

    @Transactional
    public Material atualizarMaterial(Long id, MaterialRequestDTO dto) {
        Material material = buscarPorId(id); // Reutiliza a busca e o tratamento de erro

        // Regra de negócio: Se o código for alterado, verificar se o novo código já não existe
        if (!Objects.equals(material.getCodigo(), dto.codigo())) {
            materialRepository.findByCodigo(dto.codigo()).ifPresent(m -> {
                throw new BusinessException("O código '" + dto.codigo() + "' já está em uso por outro material.");
            });
        }

        material.setCodigo(dto.codigo());
        material.setDescricao(dto.descricao());
        material.setUnidadeMedida(dto.unidadeMedida());
        material.setSaldoFisico(dto.saldoFisicoInicial()); // Na alteração, o saldo também é ajustado

        return materialRepository.save(material);
    }

    @Transactional
    public void deletarMaterial(Long id) {
        Material material = buscarPorId(id);

        // Regra de negócio: Não permitir deletar material com histórico de solicitações
        if (solicitacaoRepository.existsByItensMaterialId(id)) {
            throw new BusinessException("Não é possível deletar o material '" + material.getDescricao() + "' pois ele já foi utilizado em solicitações.");
        }

        materialRepository.deleteById(id);
    }
}