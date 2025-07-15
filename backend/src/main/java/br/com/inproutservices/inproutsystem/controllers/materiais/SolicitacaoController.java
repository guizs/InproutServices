package br.com.inproutservices.inproutsystem.controllers.materiais;

import br.com.inproutservices.inproutsystem.dtos.materiais.AprovacaoRejeicaoDTO;
import br.com.inproutservices.inproutsystem.dtos.materiais.SolicitacaoRequestDTO;
import br.com.inproutservices.inproutsystem.dtos.materiais.SolicitacaoResponseDTO;
import br.com.inproutservices.inproutsystem.entities.materiais.Solicitacao;
import br.com.inproutservices.inproutsystem.services.materiais.SolicitacaoService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;
import org.springframework.web.servlet.support.ServletUriComponentsBuilder;

import java.net.URI;
import java.util.List;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/solicitacoes")
@CrossOrigin(origins = "*")
public class SolicitacaoController {

    private final SolicitacaoService solicitacaoService;

    public SolicitacaoController(SolicitacaoService solicitacaoService) {
        this.solicitacaoService = solicitacaoService;
    }

    @PostMapping
    public ResponseEntity<SolicitacaoResponseDTO> criarSolicitacao(@RequestBody SolicitacaoRequestDTO dto) {
        Solicitacao solicitacaoSalva = solicitacaoService.criarSolicitacao(dto);
        URI location = ServletUriComponentsBuilder.fromCurrentRequest().path("/{id}")
                .buildAndExpand(solicitacaoSalva.getId()).toUri();
        return ResponseEntity.created(location).body(new SolicitacaoResponseDTO(solicitacaoSalva));
    }

    @GetMapping("/pendentes")
    public ResponseEntity<List<SolicitacaoResponseDTO>> listarSolicitacoesPendentes() {
        List<SolicitacaoResponseDTO> list = solicitacaoService.listarPendentes()
                .stream()
                .map(SolicitacaoResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @GetMapping("/historico")
    public ResponseEntity<List<SolicitacaoResponseDTO>> listarHistoricoDeSolicitacoes() {
        List<SolicitacaoResponseDTO> list = solicitacaoService.listarHistorico()
                .stream()
                .map(SolicitacaoResponseDTO::new)
                .collect(Collectors.toList());
        return ResponseEntity.ok(list);
    }

    @PostMapping("/{id}/aprovar")
    public ResponseEntity<SolicitacaoResponseDTO> aprovarSolicitacao(@PathVariable Long id, @RequestBody AprovacaoRejeicaoDTO dto) {
        Solicitacao solicitacaoAprovada = solicitacaoService.aprovarSolicitacao(id, dto.aprovadorId());
        return ResponseEntity.ok(new SolicitacaoResponseDTO(solicitacaoAprovada));
    }

    @PostMapping("/{id}/rejeitar")
    public ResponseEntity<SolicitacaoResponseDTO> rejeitarSolicitacao(@PathVariable Long id, @RequestBody AprovacaoRejeicaoDTO dto) {
        Solicitacao solicitacaoRejeitada = solicitacaoService.rejeitarSolicitacao(id, dto.aprovadorId(), dto.observacao());
        return ResponseEntity.ok(new SolicitacaoResponseDTO(solicitacaoRejeitada));
    }
}