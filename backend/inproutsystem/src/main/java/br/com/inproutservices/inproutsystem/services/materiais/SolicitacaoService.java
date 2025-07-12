package br.com.inproutservices.inproutsystem.services.materiais;

// 1. ADICIONE OS IMPORTS NECESSÁRIOS
import br.com.inproutservices.inproutsystem.dtos.materiais.SolicitacaoRequestDTO;
import br.com.inproutservices.inproutsystem.entities.index.Lpu;
import br.com.inproutservices.inproutsystem.entities.materiais.ItemSolicitacao;
import br.com.inproutservices.inproutsystem.entities.materiais.Material;
import br.com.inproutservices.inproutsystem.entities.materiais.Solicitacao;
import br.com.inproutservices.inproutsystem.entities.os.OS;
import br.com.inproutservices.inproutsystem.enums.materiais.StatusSolicitacao;
import br.com.inproutservices.inproutsystem.exceptions.materiais.BusinessException;
import br.com.inproutservices.inproutsystem.exceptions.materiais.ResourceNotFoundException;
import br.com.inproutservices.inproutsystem.repositories.atividades.OsRepository;
import br.com.inproutservices.inproutsystem.repositories.index.LpuRepository;
import br.com.inproutservices.inproutsystem.repositories.materiais.MaterialRepository;
import br.com.inproutservices.inproutsystem.repositories.materiais.SolicitacaoRepository;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.Arrays;
import java.util.List;

@Service
public class SolicitacaoService {

    private final SolicitacaoRepository solicitacaoRepository;
    private final MaterialRepository materialRepository;
    // 2. ADICIONE OS REPOSITÓRIOS DE OS E LPU
    private final OsRepository osRepository;
    private final LpuRepository lpuRepository;

    // 3. ATUALIZE O CONSTRUTOR PARA INJETAR AS NOVAS DEPENDÊNCIAS
    public SolicitacaoService(SolicitacaoRepository solicitacaoRepository,
                              MaterialRepository materialRepository,
                              OsRepository osRepository,
                              LpuRepository lpuRepository) {
        this.solicitacaoRepository = solicitacaoRepository;
        this.materialRepository = materialRepository;
        this.osRepository = osRepository;
        this.lpuRepository = lpuRepository;
    }

    @Transactional
    public Solicitacao criarSolicitacao(SolicitacaoRequestDTO dto) {
        // 4. BUSQUE AS ENTIDADES OS E LPU PELOS IDS RECEBIDOS
        OS os = osRepository.findById(dto.osId())
                .orElseThrow(() -> new ResourceNotFoundException("OS não encontrada com o ID: " + dto.osId()));

        Lpu lpu = lpuRepository.findById(dto.lpuId())
                .orElseThrow(() -> new ResourceNotFoundException("LPU não encontrada com o ID: " + dto.lpuId()));

        // 5. CRIE A SOLICITAÇÃO E ASSOCIE AS ENTIDADES ENCONTRADAS
        Solicitacao solicitacao = new Solicitacao();
        solicitacao.setOs(os); // Associa a entidade OS completa
        solicitacao.setLpu(lpu); // Associa a entidade LPU completa
        solicitacao.setIdSolicitante(dto.idSolicitante());
        solicitacao.setJustificativa(dto.justificativa());

        // O restante da lógica para os itens permanece igual
        for (var itemDto : dto.itens()) {
            Material material = materialRepository.findByCodigo(itemDto.codigoMaterial())
                    .orElseThrow(() -> new ResourceNotFoundException("Material não encontrado com o código: " + itemDto.codigoMaterial()));

            ItemSolicitacao item = new ItemSolicitacao();
            item.setMaterial(material);
            item.setQuantidadeSolicitada(itemDto.quantidade());
            item.setSolicitacao(solicitacao); // Link bidirecional
            solicitacao.getItens().add(item);
        }
        return solicitacaoRepository.save(solicitacao);
    }

    // NENHUMA ALTERAÇÃO NECESSÁRIA NOS MÉTODOS ABAIXO
    @Transactional(readOnly = true)
    public List<Solicitacao> listarPendentes() {
        return solicitacaoRepository.findByStatus(StatusSolicitacao.PENDENTE);
    }

    @Transactional(readOnly = true)
    public List<Solicitacao> listarHistorico() {
        List<StatusSolicitacao> statuses = Arrays.asList(StatusSolicitacao.APROVADA, StatusSolicitacao.REJEITADA);
        return solicitacaoRepository.findByStatusIn(statuses);
    }

    @Transactional
    public Solicitacao aprovarSolicitacao(Long solicitacaoId, Long aprovadorId) {
        Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada com o ID: " + solicitacaoId));

        if (solicitacao.getStatus() != StatusSolicitacao.PENDENTE) {
            throw new BusinessException("Apenas solicitações com status PENDENTE podem ser aprovadas.");
        }

        for (ItemSolicitacao item : solicitacao.getItens()) {
            Material material = item.getMaterial();
            if (material.getSaldoFisico().compareTo(item.getQuantidadeSolicitada()) < 0) {
                throw new BusinessException("Estoque insuficiente para o material: " + material.getDescricao() +
                        ". Solicitado: " + item.getQuantidadeSolicitada() +
                        ", Disponível: " + material.getSaldoFisico());
            }
        }

        for (ItemSolicitacao item : solicitacao.getItens()) {
            Material material = item.getMaterial();
            BigDecimal novoSaldo = material.getSaldoFisico().subtract(item.getQuantidadeSolicitada());
            material.setSaldoFisico(novoSaldo);
            item.setSaldoNoMomentoDaAprovacao(novoSaldo);
            materialRepository.save(material);
        }

        solicitacao.setStatus(StatusSolicitacao.APROVADA);
        solicitacao.setIdAprovador(aprovadorId);
        solicitacao.setDataAprovacao(LocalDateTime.now());

        return solicitacaoRepository.save(solicitacao);
    }

    @Transactional
    public Solicitacao rejeitarSolicitacao(Long solicitacaoId, Long aprovadorId, String observacao) {
        Solicitacao solicitacao = solicitacaoRepository.findById(solicitacaoId)
                .orElseThrow(() -> new ResourceNotFoundException("Solicitação não encontrada com o ID: " + solicitacaoId));

        if (solicitacao.getStatus() != StatusSolicitacao.PENDENTE) {
            throw new BusinessException("Apenas solicitações com status PENDENTE podem ser rejeitadas.");
        }

        solicitacao.setStatus(StatusSolicitacao.REJEITADA);
        solicitacao.setIdAprovador(aprovadorId);
        solicitacao.setDataAprovacao(LocalDateTime.now());
        solicitacao.setObsAprovador(observacao);

        return solicitacaoRepository.save(solicitacao);
    }
}