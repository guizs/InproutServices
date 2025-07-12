package br.com.inproutservices.inproutsystem.services.atividades;

import br.com.inproutservices.inproutsystem.dtos.atividades.AcaoCoordenadorDTO;
import br.com.inproutservices.inproutsystem.dtos.atividades.LancamentoRequestDTO;
import br.com.inproutservices.inproutsystem.entities.atividades.Comentario;
import br.com.inproutservices.inproutsystem.entities.atividades.Lancamento;
import br.com.inproutservices.inproutsystem.entities.index.Lpu;
import br.com.inproutservices.inproutsystem.entities.os.OS;
import br.com.inproutservices.inproutsystem.entities.usuario.Usuario;
import br.com.inproutservices.inproutsystem.enums.atividades.SituacaoAprovacao;
import br.com.inproutservices.inproutsystem.exceptions.materiais.BusinessException;
import br.com.inproutservices.inproutsystem.repositories.atividades.ComentarioRepository;
import br.com.inproutservices.inproutsystem.repositories.atividades.LancamentoRepository;
import br.com.inproutservices.inproutsystem.repositories.atividades.OsRepository;
import br.com.inproutservices.inproutsystem.repositories.index.LpuRepository;
import br.com.inproutservices.inproutsystem.repositories.usuarios.UsuarioRepository;
import br.com.inproutservices.inproutsystem.services.config.PrazoService;
import jakarta.persistence.EntityNotFoundException;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

@Service
public class LancamentoServiceImpl implements LancamentoService {

    private final LancamentoRepository lancamentoRepository;
    private final OsRepository osRepository;
    private final LpuRepository lpuRepository;
    private final UsuarioRepository usuarioRepository;
    private final PrazoService prazoService;
    private final ComentarioRepository comentarioRepository;

    public LancamentoServiceImpl(LancamentoRepository lancamentoRepository, OsRepository osRepository,
                                 LpuRepository lpuRepository, UsuarioRepository usuarioRepository,
                                 PrazoService prazoService, ComentarioRepository comentarioRepository) {
        this.lancamentoRepository = lancamentoRepository;
        this.osRepository = osRepository;
        this.lpuRepository = lpuRepository;
        this.usuarioRepository = usuarioRepository;
        this.prazoService = prazoService;
        this.comentarioRepository = comentarioRepository;
    }

    @Override
    @Transactional
    public Lancamento criarLancamento(LancamentoRequestDTO dto, Long managerId) {
        OS os = osRepository.findById(dto.osId())
                .orElseThrow(() -> new EntityNotFoundException("OS não encontrada com o ID: " + dto.osId()));

        Usuario manager = usuarioRepository.findById(managerId)
                .orElseThrow(() -> new EntityNotFoundException("Manager não encontrado com o ID: " + managerId));

        Lancamento lancamento = new Lancamento();
        lancamento.setOs(os);
        lancamento.setManager(manager);
        lancamento.setSituacaoAprovacao(SituacaoAprovacao.RASCUNHO);
        lancamento.setUltUpdate(LocalDateTime.now());

        // Mapeando os outros dados do DTO para a entidade
        lancamento.setEquipe(dto.equipe());
        lancamento.setVistoria(dto.vistoria());
        lancamento.setPlanoVistoria(dto.planoVistoria());
        lancamento.setDesmobilizacao(dto.desmobilizacao());
        lancamento.setPlanoDesmobilizacao(dto.planoDesmobilizacao());
        lancamento.setInstalacao(dto.instalacao());
        lancamento.setPlanoInstalacao(dto.planoInstalacao());
        lancamento.setAtivacao(dto.ativacao());
        lancamento.setPlanoAtivacao(dto.planoAtivacao());
        lancamento.setDocumentacao(dto.documentacao());
        lancamento.setPlanoDocumentacao(dto.planoDocumentacao());
        lancamento.setEtapaGeral(dto.etapaGeral());
        lancamento.setEtapaDetalhada(dto.etapaDetalhada());
        lancamento.setStatus(dto.status());
        lancamento.setDetalheDiario(dto.detalheDiario());
        lancamento.setCodigoPrestador(dto.codigoPrestador());
        lancamento.setPrestador(dto.prestador());
        lancamento.setValor(dto.valor());

        return lancamentoRepository.save(lancamento);
    }

    @Override
    @Transactional
    public void submeterLancamentosDiarios() {
        List<Lancamento> rascunhos = lancamentoRepository.findBySituacaoAprovacao(SituacaoAprovacao.RASCUNHO);

        for (Lancamento lancamento : rascunhos) {
            LocalDate novoPrazo = prazoService.calcularPrazoEmDiasUteis(LocalDate.now(), 3);
            lancamento.setSituacaoAprovacao(SituacaoAprovacao.PENDENTE_COORDENADOR);
            lancamento.setDataSubmissao(LocalDateTime.now());
            lancamento.setDataPrazo(novoPrazo);
            lancamentoRepository.save(lancamento);
        }
    }

    @Override
    @Transactional
    public Lancamento aprovarPeloCoordenador(Long lancamentoId, Long coordenadorId) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Lançamento não encontrado com ID: " + lancamentoId));

        if (lancamento.getSituacaoAprovacao() != SituacaoAprovacao.PENDENTE_COORDENADOR) {
            throw new BusinessException("Este lançamento não está pendente de aprovação pelo Coordenador.");
        }

        Lancamento maisAntigo = lancamentoRepository
                .findFirstByOsIdAndSituacaoAprovacaoOrderByDataCriacaoAsc(lancamento.getOs().getId(), SituacaoAprovacao.PENDENTE_COORDENADOR)
                .orElse(null);

        if (maisAntigo == null || !maisAntigo.getId().equals(lancamento.getId())) {
            throw new BusinessException("Existe um lançamento mais antigo para esta OS que precisa ser resolvido primeiro.");
        }

        lancamento.setSituacaoAprovacao(SituacaoAprovacao.PENDENTE_CONTROLLER);
        lancamento.setUltUpdate(LocalDateTime.now());

        return lancamentoRepository.save(lancamento);
    }

    @Override
    @Transactional
    public Lancamento solicitarNovoPrazo(Long lancamentoId, AcaoCoordenadorDTO dto) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Lançamento não encontrado com ID: " + lancamentoId));

        Usuario coordenador = usuarioRepository.findById(dto.coordenadorId())
                .orElseThrow(() -> new EntityNotFoundException("Coordenador não encontrado com ID: " + dto.coordenadorId()));

        if (lancamento.getSituacaoAprovacao() != SituacaoAprovacao.PENDENTE_COORDENADOR) {
            throw new BusinessException("A solicitação de prazo só pode ser feita para lançamentos pendentes do Coordenador.");
        }
        if (dto.novaDataSugerida() == null) {
            throw new BusinessException("Uma nova data para o prazo deve ser sugerida.");
        }

        Comentario novoComentario = new Comentario();
        novoComentario.setLancamento(lancamento);
        novoComentario.setAutor(coordenador);
        novoComentario.setTexto(dto.comentario());
        lancamento.getComentarios().add(novoComentario);

        lancamento.setSituacaoAprovacao(SituacaoAprovacao.AGUARDANDO_EXTENSAO_PRAZO);
        lancamento.setDataPrazoProposta(dto.novaDataSugerida()); // Salva a data que veio no DTO
        lancamento.setUltUpdate(LocalDateTime.now());

        return lancamentoRepository.save(lancamento);
    }

    @Override
    @Transactional
    public Lancamento aprovarPeloController(Long lancamentoId, Long controllerId) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Lançamento não encontrado com ID: " + lancamentoId));

        if (lancamento.getSituacaoAprovacao() != SituacaoAprovacao.PENDENTE_CONTROLLER) {
            throw new BusinessException("Este lançamento não está pendente de aprovação pelo Controller.");
        }

        lancamento.setSituacaoAprovacao(SituacaoAprovacao.APROVADO);
        lancamento.setUltUpdate(LocalDateTime.now());

        return lancamentoRepository.save(lancamento);
    }

    @Override
    @Transactional
    public Lancamento rejeitarPeloController(Long lancamentoId, Long controllerId, String motivoRejeicao) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Lançamento não encontrado com ID: " + lancamentoId));

        Usuario controller = usuarioRepository.findById(controllerId)
                .orElseThrow(() -> new EntityNotFoundException("Controller não encontrado com ID: " + controllerId));

        if (lancamento.getSituacaoAprovacao() != SituacaoAprovacao.PENDENTE_CONTROLLER) {
            throw new BusinessException("Este lançamento não está pendente de aprovação pelo Controller.");
        }

        Comentario comentarioRejeicao = new Comentario();
        comentarioRejeicao.setLancamento(lancamento);
        comentarioRejeicao.setAutor(controller);
        comentarioRejeicao.setTexto(motivoRejeicao);
        lancamento.getComentarios().add(comentarioRejeicao);

        lancamento.setSituacaoAprovacao(SituacaoAprovacao.PENDENTE_COORDENADOR);

        LocalDate novoPrazo = prazoService.calcularPrazoEmDiasUteis(LocalDate.now(), 3);
        lancamento.setDataPrazo(novoPrazo);
        lancamento.setUltUpdate(LocalDateTime.now());

        return lancamentoRepository.save(lancamento);
    }

    @Override
    @Transactional(readOnly = true)
    public Lancamento getLancamentoById(Long id) {
        return lancamentoRepository.findByIdWithDetails(id)
                .orElseThrow(() -> new EntityNotFoundException("Lançamento não encontrado com o ID: " + id));
    }

    @Override
    @Transactional
    public Lancamento aprovarExtensaoPrazo(Long lancamentoId, Long controllerId) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Lançamento não encontrado com ID: " + lancamentoId));

        if (lancamento.getSituacaoAprovacao() != SituacaoAprovacao.AGUARDANDO_EXTENSAO_PRAZO) {
            throw new BusinessException("Este lançamento não está aguardando uma decisão sobre o prazo.");
        }

        lancamento.setDataPrazo(lancamento.getDataPrazoProposta());
        lancamento.setDataPrazoProposta(null);
        lancamento.setSituacaoAprovacao(SituacaoAprovacao.PENDENTE_COORDENADOR);
        lancamento.setUltUpdate(LocalDateTime.now());

        // TODO: Adicionar um comentário automático informando que o prazo foi aprovado pelo Controller.

        return lancamentoRepository.save(lancamento);
    }

    @Override
    @Transactional
    public Lancamento rejeitarExtensaoPrazo(Long lancamentoId, Long controllerId, String motivoRejeicao) {
        Lancamento lancamento = lancamentoRepository.findById(lancamentoId)
                .orElseThrow(() -> new EntityNotFoundException("Lançamento não encontrado com ID: " + lancamentoId));

        Usuario controller = usuarioRepository.findById(controllerId)
                .orElseThrow(() -> new EntityNotFoundException("Controller não encontrado com ID: " + controllerId));

        if (lancamento.getSituacaoAprovacao() != SituacaoAprovacao.AGUARDANDO_EXTENSAO_PRAZO) {
            throw new BusinessException("Este lançamento não está aguardando uma decisão sobre o prazo.");
        }

        // Limpa a data proposta
        lancamento.setDataPrazoProposta(null);
        // Devolve para a fila do Coordenador, mantendo o prazo original
        lancamento.setSituacaoAprovacao(SituacaoAprovacao.PENDENTE_COORDENADOR);

        // Adiciona o comentário explicando a recusa da extensão
        Comentario comentarioRecusa = new Comentario();
        comentarioRecusa.setLancamento(lancamento);
        comentarioRecusa.setAutor(controller);
        comentarioRecusa.setTexto("Solicitação de novo prazo rejeitada. Motivo: " + motivoRejeicao);
        lancamento.getComentarios().add(comentarioRecusa);

        lancamento.setUltUpdate(LocalDateTime.now());

        return lancamentoRepository.save(lancamento);
    }
}