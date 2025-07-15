package br.com.inproutservices.inproutsystem.tasks;

import br.com.inproutservices.inproutsystem.services.atividades.LancamentoService;
import org.slf4j.Logger;
import org.slf4j.LoggerFactory;
import org.springframework.scheduling.annotation.Scheduled;
import org.springframework.stereotype.Component;

@Component
public class LancamentoScheduledTasks {

    private static final Logger log = LoggerFactory.getLogger(LancamentoScheduledTasks.class);
    private final LancamentoService lancamentoService;

    public LancamentoScheduledTasks(LancamentoService lancamentoService) {
        this.lancamentoService = lancamentoService;
    }

    /**
     * Este método será executado automaticamente todos os dias à meia-noite (00:00).
     * A expressão cron "0 0 0 * * *" significa:
     * (segundo minuto hora dia-do-mês mês dia-da-semana)
     * O timezone garante que ele rode no horário de São Paulo.
     */
    @Scheduled(cron = "0 0 0 * * *", zone = "America/Sao_Paulo")
    public void submeterLancamentosPendentes() {
        log.info("Iniciando tarefa agendada: Submissão diária de lançamentos.");
        try {
            lancamentoService.submeterLancamentosDiarios();
            log.info("Tarefa de submissão diária de lançamentos concluída com sucesso.");
        } catch (Exception e) {
            log.error("Erro ao executar a tarefa de submissão diária de lançamentos.", e);
        }
    }
}