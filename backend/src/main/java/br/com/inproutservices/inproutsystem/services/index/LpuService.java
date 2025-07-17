package br.com.inproutservices.inproutsystem.services.index;

import br.com.inproutservices.inproutsystem.dtos.index.ContratoResponseDTO;
import br.com.inproutservices.inproutsystem.dtos.index.LpuResponseDTO;
import br.com.inproutservices.inproutsystem.entities.index.Contrato;
import br.com.inproutservices.inproutsystem.entities.index.Lpu;
import br.com.inproutservices.inproutsystem.repositories.atividades.OsRepository;
import br.com.inproutservices.inproutsystem.repositories.index.ContratoRepository;
import br.com.inproutservices.inproutsystem.repositories.index.LpuRepository;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;
import br.com.inproutservices.inproutsystem.entities.os.OS;

import java.math.BigDecimal;
import java.util.List;
import java.util.Map;
import java.util.stream.Collectors;

@Service
public class LpuService {

    private final LpuRepository lpuRepository;
    private final ContratoRepository contratoRepository;
    private final OsRepository osRepository;

    public LpuService(LpuRepository lpuRepository, ContratoRepository contratoRepository, OsRepository osRepository) {
        this.lpuRepository = lpuRepository;
        this.contratoRepository = contratoRepository;
        this.osRepository = osRepository;
    }

    @Transactional(readOnly = true)
    public List<LpuResponseDTO> findLpusByOsId(Long osId) {
        // 1. Busca a OS principal
        OS os = osRepository.findById(osId)
                .orElseThrow(() -> new EntityNotFoundException("OS não encontrada com o ID: " + osId));

        // 2. Acessa a coleção de LPUs diretamente da entidade OS e converte para DTO
        return os.getLpus().stream()
                .map(lpu -> {
                    // A lógica de conversão para DTO que você já tinha continua aqui...
                    ContratoResponseDTO contratoDTO = new ContratoResponseDTO(lpu.getContrato().getId(), lpu.getContrato().getNome());
                    return new LpuResponseDTO(
                            lpu.getId(), lpu.getCodigoLpu(), lpu.getNomeLpu(), lpu.getUnidade(),
                            lpu.getValorSemImposto(), lpu.getValorComImposto(), lpu.isAtivo(), contratoDTO
                    );
                })
                .collect(Collectors.toList());
    }

    // --- NOVO MÉTODO PARA LISTAGEM FLEXÍVEL ---
    /**
     * Retorna uma lista de LPUs com base no status de ativação.
     * @param ativo Se null, retorna todas. Se true, retorna ativas. Se false, retorna inativas.
     */
    @Transactional(readOnly = true)
    // No LpuService, o método de listagem se resume a uma linha:
    public List<Lpu> listarLpusPorStatus(Boolean ativo) {
        return lpuRepository.findByStatus(ativo);
    }

    /**
     * Busca uma única LPU pelo seu ID.
     */
    @Transactional(readOnly = true)
    public Lpu buscarPorId(Long id) {
        return lpuRepository.findByIdWithContrato(id)
                .orElseThrow(() -> new EntityNotFoundException("LPU não encontrada com o ID: " + id));
    }

    @Transactional(readOnly = true)
    public LpuResponseDTO buscarLpuPorIdDTO(Long id) {
        // Busca a entidade LPU do banco (o lazy loading não é problema aqui)
        Lpu lpu = lpuRepository.findById(id)
                .orElseThrow(() -> new EntityNotFoundException("LPU não encontrada com o ID: " + id));

        // Mapeia a entidade para o DTO
        ContratoResponseDTO contratoDTO = new ContratoResponseDTO(lpu.getContrato().getId(), lpu.getContrato().getNome());

        return new LpuResponseDTO(
                lpu.getId(),
                lpu.getCodigoLpu(),
                lpu.getNomeLpu(),
                lpu.getUnidade(),
                lpu.getValorSemImposto(),
                lpu.getValorComImposto(),
                lpu.isAtivo(),
                contratoDTO
        );
    }

    /**
     * Cria uma nova LPU no banco de dados.
     */
    @Transactional
    public Lpu criarLpu(Lpu lpu, Long contratoId) { // <-- MUDANÇA: Removemos o osId daqui

        // A validação de duplicidade por contrato continua correta
        lpuRepository.findByCodigoLpuAndContratoId(lpu.getCodigoLpu(), contratoId).ifPresent(l -> {
            throw new IllegalArgumentException(
                    "Já existe uma LPU com o código: " + lpu.getCodigoLpu() + " para este contrato."
            );
        });

        // A associação com o Contrato também continua correta
        Contrato contrato = contratoRepository.findById(contratoId)
                .orElseThrow(() -> new EntityNotFoundException("Contrato não encontrado com o ID: " + contratoId));

        lpu.setContrato(contrato);
        lpu.setAtivo(true);

        // A linha 'lpu.setOs(os);' foi REMOVIDA, pois não faz mais parte deste processo.

        return lpuRepository.save(lpu);
    }

    /**
     * Altera uma LPU existente.
     */
    @Transactional
    public Lpu alterarLpu(Long id, Lpu lpuAtualizada) {
        Lpu lpuExistente = buscarPorId(id);

        // Verifica se o código da LPU foi alterado e se o novo código já existe em outra LPU do mesmo contrato.
        if (lpuAtualizada.getCodigoLpu() != null && !lpuAtualizada.getCodigoLpu().equals(lpuExistente.getCodigoLpu())) {
            lpuRepository.findByCodigoLpuAndContratoId(lpuAtualizada.getCodigoLpu(), lpuExistente.getContrato().getId())
                    .ifPresent(l -> {
                        // Se encontrou uma LPU com o novo código e o ID dela é diferente do que estamos alterando...
                        if (!l.getId().equals(id)) {
                            throw new IllegalArgumentException(
                                    "Já existe outra LPU com o código: " + lpuAtualizada.getCodigoLpu() + " para este contrato."
                            );
                        }
                    });
            lpuExistente.setCodigoLpu(lpuAtualizada.getCodigoLpu());
        }

        lpuExistente.setNomeLpu(lpuAtualizada.getNomeLpu());
        lpuExistente.setUnidade(lpuAtualizada.getUnidade());
        lpuExistente.setValorSemImposto(lpuAtualizada.getValorSemImposto());
        lpuExistente.setValorComImposto(lpuAtualizada.getValorComImposto());

        return lpuRepository.save(lpuExistente);
    }

    /**
     * Desativa uma LPU (exclusão lógica).
     */
    @Transactional
    public void desativarLpu(Long id) {
        Lpu lpuParaDesativar = buscarPorId(id);
        lpuParaDesativar.setAtivo(false);
        lpuRepository.save(lpuParaDesativar);
    }

    /**
     * Reativa uma LPU que foi desativada (exclusão lógica).
     */
    @Transactional
    public Lpu atualizarParcialmente(Long id, Map<String, Object> updates) {
        Lpu lpuExistente = lpuRepository.findById(id)
                .orElseThrow(() -> new RuntimeException("LPU não encontrada com o id: " + id));

        updates.forEach((key, value) -> {
            switch (key) {
                case "ativo":
                    lpuExistente.setAtivo((Boolean) value);
                    break;

                case "codigoLpu":
                    lpuExistente.setCodigoLpu((String) value);
                    break;
                case "nomeLpu":
                    lpuExistente.setNomeLpu((String) value);
                    break;
                case "unidade":
                    lpuExistente.setUnidade((String) value);
                    break;
                case "valorSemImposto":
                    lpuExistente.setValorSemImposto(new BigDecimal(value.toString()));
                    break;
                case "valorComImposto":
                    lpuExistente.setValorComImposto(new BigDecimal(value.toString()));
                    break;
            }
        });

        return lpuRepository.save(lpuExistente); // Salva a entidade modificada
    }
}