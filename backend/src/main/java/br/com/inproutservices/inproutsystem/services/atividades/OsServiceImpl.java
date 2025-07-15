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
        Contrato contrato = contratoRepository.findById(osDto.getContratoId())
                .orElseThrow(() -> new EntityNotFoundException("Contrato não encontrado com o ID: " + osDto.getContratoId()));

        Lpu lpu = lpuRepository.findByCodigoLpuAndContratoId(osDto.getCodigoLpu(), osDto.getContratoId())
                .orElseThrow(() -> new EntityNotFoundException(
                        "LPU não encontrada com o código: " + osDto.getCodigoLpu() + " para o Contrato ID: " + osDto.getContratoId()
                ));

        OS newOs = new OS();
        // Chamando o método de mapeamento atualizado
        mapDtoToEntity(osDto, newOs, lpu, contrato);

        newOs.setDataCriacao(LocalDateTime.now());
        newOs.setUsuarioCriacao("sistema");
        newOs.setStatusRegistro("ATIVO");

        return osRepository.save(newOs);
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