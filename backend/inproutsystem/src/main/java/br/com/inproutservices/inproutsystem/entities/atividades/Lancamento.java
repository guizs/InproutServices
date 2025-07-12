package br.com.inproutservices.inproutsystem.entities.atividades;

import br.com.inproutservices.inproutsystem.entities.os.OS;
import br.com.inproutservices.inproutsystem.entities.usuario.Usuario;
import br.com.inproutservices.inproutsystem.enums.atividades.SituacaoAprovacao;
import com.fasterxml.jackson.annotation.JsonFormat;
import com.fasterxml.jackson.annotation.JsonIgnore;
import jakarta.persistence.*;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.ArrayList;
import java.util.List;

@Entity
@Table(name = "lancamento")
public class Lancamento {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "os_id", nullable = false)
    @JsonIgnore
    private OS os;

    // --- CAMPOS ADICIONADOS PARA O FLUXO DE APROVAÇÃO ---
    @Enumerated(EnumType.STRING)
    @Column(name = "situacao_aprovacao", length = 30)
    private SituacaoAprovacao situacaoAprovacao;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "manager_id", nullable = false)
    private Usuario manager;

    @Column(name = "data_submissao")
    private LocalDateTime dataSubmissao;

    @Column(name = "data_prazo")
    private LocalDate dataPrazo;

    @Column(name = "data_prazo_proposta")
    private LocalDate dataPrazoProposta; // Armazena a data sugerida pelo Coordenador

    @OneToMany(mappedBy = "lancamento", cascade = CascadeType.ALL, orphanRemoval = true)
    private List<Comentario> comentarios = new ArrayList<>();

    // --- SEUS CAMPOS EXISTENTES ---
    private String equipe;
    private String vistoria;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate planoVistoria;
    private String desmobilizacao;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate planoDesmobilizacao;
    private String instalacao;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate planoInstalacao;
    private String ativacao;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate planoAtivacao;
    private String documentacao;
    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate planoDocumentacao;
    private String etapaGeral;
    private String etapaDetalhada;
    private String status;
    private String detalheDiario;
    private String codigoPrestador;
    private String prestador;
    private BigDecimal valor;
    private String coordenador;
    private String situacao;
    private LocalDateTime ultUpdate;

    @Column(name = "data_criacao", nullable = false, updatable = false)
    private LocalDateTime dataCriacao;

    public Lancamento() {
    }

    /**
     * Este método com a anotação @PrePersist garante que o campo
     * dataCriacao seja preenchido automaticamente apenas uma vez,
     * no momento em que o lançamento é criado no banco.
     */
    @PrePersist
    protected void onCreate() {
        this.dataCriacao = LocalDateTime.now();
        // Define um estado inicial padrão sempre que um novo lançamento é criado
        if (this.situacaoAprovacao == null) {
            this.situacaoAprovacao = SituacaoAprovacao.RASCUNHO;
        }
    }

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

    public SituacaoAprovacao getSituacaoAprovacao() {
        return situacaoAprovacao;
    }

    public void setSituacaoAprovacao(SituacaoAprovacao situacaoAprovacao) {
        this.situacaoAprovacao = situacaoAprovacao;
    }

    public Usuario getManager() {
        return manager;
    }

    public void setManager(Usuario manager) {
        this.manager = manager;
    }

    public LocalDateTime getDataSubmissao() {
        return dataSubmissao;
    }

    public void setDataSubmissao(LocalDateTime dataSubmissao) {
        this.dataSubmissao = dataSubmissao;
    }

    public LocalDate getDataPrazo() {
        return dataPrazo;
    }

    public void setDataPrazo(LocalDate dataPrazo) {
        this.dataPrazo = dataPrazo;
    }

    public List<Comentario> getComentarios() {
        return comentarios;
    }

    public void setComentarios(List<Comentario> comentarios) {
        this.comentarios = comentarios;
    }

    public String getEquipe() {
        return equipe;
    }

    public void setEquipe(String equipe) {
        this.equipe = equipe;
    }

    public String getVistoria() {
        return vistoria;
    }

    public void setVistoria(String vistoria) {
        this.vistoria = vistoria;
    }

    public LocalDate getPlanoVistoria() {
        return planoVistoria;
    }

    public void setPlanoVistoria(LocalDate planoVistoria) {
        this.planoVistoria = planoVistoria;
    }

    public String getDesmobilizacao() {
        return desmobilizacao;
    }

    public void setDesmobilizacao(String desmobilizacao) {
        this.desmobilizacao = desmobilizacao;
    }

    public LocalDate getPlanoDesmobilizacao() {
        return planoDesmobilizacao;
    }

    public void setPlanoDesmobilizacao(LocalDate planoDesmobilizacao) {
        this.planoDesmobilizacao = planoDesmobilizacao;
    }

    public String getInstalacao() {
        return instalacao;
    }

    public void setInstalacao(String instalacao) {
        this.instalacao = instalacao;
    }

    public LocalDate getPlanoInstalacao() {
        return planoInstalacao;
    }

    public void setPlanoInstalacao(LocalDate planoInstalacao) {
        this.planoInstalacao = planoInstalacao;
    }

    public String getAtivacao() {
        return ativacao;
    }

    public void setAtivacao(String ativacao) {
        this.ativacao = ativacao;
    }

    public LocalDate getPlanoAtivacao() {
        return planoAtivacao;
    }

    public void setPlanoAtivacao(LocalDate planoAtivacao) {
        this.planoAtivacao = planoAtivacao;
    }

    public String getDocumentacao() {
        return documentacao;
    }

    public void setDocumentacao(String documentacao) {
        this.documentacao = documentacao;
    }

    public LocalDate getPlanoDocumentacao() {
        return planoDocumentacao;
    }

    public void setPlanoDocumentacao(LocalDate planoDocumentacao) {
        this.planoDocumentacao = planoDocumentacao;
    }

    public String getEtapaGeral() {
        return etapaGeral;
    }

    public void setEtapaGeral(String etapaGeral) {
        this.etapaGeral = etapaGeral;
    }

    public String getEtapaDetalhada() {
        return etapaDetalhada;
    }

    public void setEtapaDetalhada(String etapaDetalhada) {
        this.etapaDetalhada = etapaDetalhada;
    }

    public String getStatus() {
        return status;
    }

    public void setStatus(String status) {
        this.status = status;
    }

    public String getDetalheDiario() {
        return detalheDiario;
    }

    public void setDetalheDiario(String detalheDiario) {
        this.detalheDiario = detalheDiario;
    }

    public String getCodigoPrestador() {
        return codigoPrestador;
    }

    public void setCodigoPrestador(String codigoPrestador) {
        this.codigoPrestador = codigoPrestador;
    }

    public String getPrestador() {
        return prestador;
    }

    public void setPrestador(String prestador) {
        this.prestador = prestador;
    }

    public BigDecimal getValor() {
        return valor;
    }

    public void setValor(BigDecimal valor) {
        this.valor = valor;
    }

    public String getCoordenador() {
        return coordenador;
    }

    public void setCoordenador(String coordenador) {
        this.coordenador = coordenador;
    }

    public String getSituacao() {
        return situacao;
    }

    public void setSituacao(String situacao) {
        this.situacao = situacao;
    }

    public LocalDateTime getUltUpdate() {
        return ultUpdate;
    }

    public void setUltUpdate(LocalDateTime ultUpdate) {
        this.ultUpdate = ultUpdate;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public void setDataCriacao(LocalDateTime dataCriacao) {
        this.dataCriacao = dataCriacao;
    }

    public LocalDate getDataPrazoProposta() {
        return dataPrazoProposta;
    }

    public void setDataPrazoProposta(LocalDate dataPrazoProposta) {
        this.dataPrazoProposta = dataPrazoProposta;
    }
}