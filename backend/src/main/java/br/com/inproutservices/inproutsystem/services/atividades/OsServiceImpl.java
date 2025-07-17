package br.com.inproutservices.inproutsystem.services.atividades;

import br.com.inproutservices.inproutsystem.dtos.atividades.OsRequestDto;
import br.com.inproutservices.inproutsystem.entities.index.Contrato;
import br.com.inproutservices.inproutsystem.entities.index.Lpu;
import br.com.inproutservices.inproutsystem.entities.os.OS;
import br.com.inproutservices.inproutsystem.repositories.atividades.OsRepository;
import br.com.inproutservices.inproutsystem.repositories.index.ContratoRepository;
import br.com.inproutservices.inproutsystem.repositories.index.LpuRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDateTime;
import java.util.List;

@Service
public class OsServiceImpl implements OsService {

    private final OsRepository osRepository;
    private final LpuRepository lpuRepository;
    private final ContratoRepository contratoRepository;

    public OsServiceImpl(OsRepository osRepository, LpuRepository lpuRepository, ContratoRepository contratoRepository) {
        this.osRepository = osRepository;
        this.lpuRepository = lpuRepository;
        this.contratoRepository = contratoRepository;
    }

    @Override
    @Transactional
    public OS createOs(OsRequestDto osDto) {
        // 1. Cria a nova entidade OS e preenche os dados simples do DTO
        OS novaOs = new OS();
        novaOs.setOs(osDto.getOs());
        novaOs.setSite(osDto.getSite());
        novaOs.setContrato(osDto.getContrato()); // Assumindo que o DTO tenha o nome do contrato
        novaOs.setSegmento(osDto.getSegmento());
        novaOs.setProjeto(osDto.getProjeto());
        novaOs.setGestorTim(osDto.getGestorTim());
        novaOs.setRegional(osDto.getRegional());
        novaOs.setLote(osDto.getLote());
        novaOs.setBoq(osDto.getBoq());
        novaOs.setPo(osDto.getPo());
        novaOs.setItem(osDto.getItem());
        novaOs.setObjetoContratado(osDto.getObjetoContratado());
        novaOs.setUnidade(osDto.getUnidade());
        novaOs.setQuantidade(osDto.getQuantidade());
        novaOs.setValorTotal(osDto.getValorTotal());
        novaOs.setObservacoes(osDto.getObservacoes());
        novaOs.setDataPo(osDto.getDataPo());

        // 2. Associa a coleção de LPUs selecionadas
        if (osDto.getLpuIds() != null && !osDto.getLpuIds().isEmpty()) {
            // Busca todas as LPUs da lista de IDs de uma vez só
            List<Lpu> lpusParaAssociar = lpuRepository.findAllById(osDto.getLpuIds());

            // Validação: garante que todas as LPUs solicitadas foram encontradas no banco
            if (lpusParaAssociar.size() != osDto.getLpuIds().size()) {
                throw new EntityNotFoundException("Uma ou mais LPUs com os IDs fornecidos não foram encontradas.");
            }

            // Adiciona a coleção de entidades LPU à nova OS
            novaOs.setLpus(new HashSet<>(lpusParaAssociar));
        }

        // 3. Define os campos de auditoria
        novaOs.setDataCriacao(LocalDateTime.now());
        novaOs.setUsuarioCriacao("sistema");
        novaOs.setStatusRegistro("ATIVO");

        // 4. Salva a OS (o JPA cuidará de preencher a tabela de junção os_lpus para você)
        return osRepository.save(novaOs);
    }

    @Override
    @Transactional(readOnly = true)
    public OS getOsById(Long id) {
        return osRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("OS não encontrada com o ID: " + id));
    }

    @Override
    @Transactional(readOnly = true)
    public List<OS> getAllOs() {
        return osRepository.findAllWithDetails();
    }

    @Override
    @Transactional
    public OS updateOs(Long id, OsRequestDto osDto) {
        OS existingOs = getOsById(id);

        Contrato contrato = contratoRepository.findById(osDto.getContratoId())
                .orElseThrow(() -> new EntityNotFoundException("Contrato não encontrado com o ID: " + osDto.getContratoId()));

        Lpu lpu = lpuRepository.findByCodigoLpuAndContratoId(osDto.getCodigoLpu(), osDto.getContratoId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "LPU não encontrada com o código: " + osDto.getCodigoLpu() + " para o Contrato ID: " + osDto.getContratoId()
                ));

        // Chamando o método de mapeamento atualizado
        mapDtoToEntity(osDto, existingOs, lpu, contrato);

        existingOs.setDataAtualizacao(LocalDateTime.now());
        existingOs.setUsuarioAtualizacao("sistema");

        return osRepository.save(existingOs);
    }

    @Override
    @Transactional
    public void deleteOs(Long id) {
        if (!osRepository.existsById(id)) {
            throw new EntityNotFoundException("OS não encontrada com o ID: " + id);
        }
        osRepository.deleteById(id);
    }

    /**
     * Método auxiliar atualizado para receber a entidade Contrato completa.
     */
    private void mapDtoToEntity(OsRequestDto dto, OS os, Lpu lpu, Contrato contrato) {
        os.setOs(dto.getOs());
        os.setSite(dto.getSite());
        os.setContrato(contrato.getNome());
        os.setSegmento(dto.getSegmento());
        os.setProjeto(dto.getProjeto());
        os.setGestorTim(dto.getGestorTim());
        os.setRegional(dto.getRegional());
        os.setLpu(lpu);
        os.setLote(dto.getLote());
        os.setBoq(dto.getBoq());
        os.setPo(dto.getPo());
        os.setItem(dto.getItem());
        os.setObjetoContratado(dto.getObjetoContratado());
        os.setUnidade(dto.getUnidade());
        os.setQuantidade(dto.getQuantidade());
        os.setValorTotal(dto.getValorTotal());
        os.setObservacoes(dto.getObservacoes());
        os.setDataPo(dto.getDataPo());
    }
}