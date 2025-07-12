package br.com.inproutservices.inproutsystem.entities.materiais;

import br.com.inproutservices.inproutsystem.entities.index.Lpu;
import br.com.inproutservices.inproutsystem.entities.os.OS;
import br.com.inproutservices.inproutsystem.enums.materiais.StatusSolicitacao;
import jakarta.persistence.*;

import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;
import java.util.Objects;

@Entity
@Table(name = "solicitacoes")
public class Solicitacao {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    // --- RELACIONAMENTOS ADICIONADOS ---
    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "os_id", nullable = false)
    private OS os;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "lpu_id", nullable = false)
    private Lpu lpu;
    // --- FIM DOS RELACIONAMENTOS ---

    @Column(name = "id_solicitante", nullable = false)
    private Long idSolicitante;

    @Column(name = "data_solicitacao", nullable = false, updatable = false)
    private LocalDateTime dataSolicitacao;

    @Column(columnDefinition = "TEXT")
    private String justificativa;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    private StatusSolicitacao status;

    @OneToMany(
            mappedBy = "solicitacao",
            cascade = CascadeType.ALL,
            orphanRemoval = true,
            fetch = FetchType.LAZY
    )
    private List<ItemSolicitacao> itens = new ArrayList<>();

    @Column(name = "id_aprovador")
    private Long idAprovador;

    @Column(name = "data_aprovacao")
    private LocalDateTime dataAprovacao;

    @Column(name = "obs_aprovador", columnDefinition = "TEXT")
    private String obsAprovador;

    public Solicitacao() {
    }

    @PrePersist
    public void prePersist() {
        this.dataSolicitacao = LocalDateTime.now();
        this.status = StatusSolicitacao.PENDENTE;
    }

    // --- GETTERS E SETTERS ---

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public OS getOs() {
        return os;
    }

    public void setOs(OS os) {
        this.os = os;
    }

    public Lpu getLpu() {
        return lpu;
    }

    public void setLpu(Lpu lpu) {
        this.lpu = lpu;
    }

    public Long getIdSolicitante() {
        return idSolicitante;
    }

    public void setIdSolicitante(Long idSolicitante) {
        this.idSolicitante = idSolicitante;
    }

    public LocalDateTime getDataSolicitacao() {
        return dataSolicitacao;
    }

    public void setDataSolicitacao(LocalDateTime dataSolicitacao) {
        this.dataSolicitacao = dataSolicitacao;
    }

    public String getJustificativa() {
        return justificativa;
    }

    public void setJustificativa(String justificativa) {
        this.justificativa = justificativa;
    }

    public StatusSolicitacao getStatus() {
        return status;
    }

    public void setStatus(StatusSolicitacao status) {
        this.status = status;
    }

    public List<ItemSolicitacao> getItens() {
        return itens;
    }

    public void setItens(List<ItemSolicitacao> itens) {
        this.itens = itens;
    }

    public Long getIdAprovador() {
        return idAprovador;
    }

    public void setIdAprovador(Long idAprovador) {
        this.idAprovador = idAprovador;
    }

    public LocalDateTime getDataAprovacao() {
        return dataAprovacao;
    }

    public void setDataAprovacao(LocalDateTime dataAprovacao) {
        this.dataAprovacao = dataAprovacao;
    }

    public String getObsAprovador() {
        return obsAprovador;
    }

    public void setObsAprovador(String obsAprovador) {
        this.obsAprovador = obsAprovador;
    }

    @Override
    public boolean equals(Object o) {
        if (this == o) return true;
        if (o == null || getClass() != o.getClass()) return false;
        Solicitacao that = (Solicitacao) o;
        return Objects.equals(id, that.id);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id);
    }
}