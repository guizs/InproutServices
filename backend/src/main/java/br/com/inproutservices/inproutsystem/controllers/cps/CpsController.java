package br.com.inproutservices.inproutsystem.controllers.cps;

import br.com.inproutservices.inproutsystem.dtos.atividades.LancamentoResponseDTO;
import br.com.inproutservices.inproutsystem.dtos.cps.FechamentoCpsPrestadorDTO;
import br.com.inproutservices.inproutsystem.services.cps.CpsService;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/cps")
@CrossOrigin(origins = "*")
public class CpsController {

    private final CpsService cpsService;

    public CpsController(CpsService cpsService) {
        this.cpsService = cpsService;
    }

    // Endpoint para a ABA 1 (Detalhes dos Lançamentos)
    @GetMapping("/lancamentos")
    public ResponseEntity<List<LancamentoResponseDTO>> getLancamentosAprovadosPorMes(
            @RequestParam int mes,
            @RequestParam int ano) {
        List<LancamentoResponseDTO> lancamentos = cpsService.findLancamentosAprovados(mes, ano);
        return ResponseEntity.ok(lancamentos);
    }

    // Endpoint para a ABA 2 (Resumo por Prestador)
    @GetMapping("/prestadores")
    public ResponseEntity<List<FechamentoCpsPrestadorDTO>> getResumoPrestadoresPorMes(
            @RequestParam int mes,
            @RequestParam int ano) {
        List<FechamentoCpsPrestadorDTO> resumo = cpsService.findResumoCpsPrestador(mes, ano);
        return ResponseEntity.ok(resumo);
    }

    @GetMapping("/resumo-segmentos")
    public ResponseEntity<List<Map<String, Object>>> getResumoSegmentosPorMes(
            @RequestParam int mes,
            @RequestParam int ano) {
        List<Map<String, Object>> resumo = cpsService.getResumoPorSegmento(mes, ano);
        return ResponseEntity.ok(resumo);
    }
}