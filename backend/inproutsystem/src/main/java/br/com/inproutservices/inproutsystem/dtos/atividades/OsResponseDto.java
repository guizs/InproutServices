package br.com.inproutservices.inproutsystem.dtos.atividades;

import br.com.inproutservices.inproutsystem.entities.atividades.Lancamento;
import br.com.inproutservices.inproutsystem.entities.index.Lpu;
import br.com.inproutservices.inproutsystem.entities.os.OS;
import com.fasterxml.jackson.annotation.JsonFormat;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.util.List;

public class OsResponseDto {

    private Long id;
    private String os;
    private String site;
    private String contrato;
    private String segmento;
    private String projeto;
    private String gestorTim;
    private String regional;
    private Lpu lpu; // Incluindo o objeto LPU completo
    private String lote;
    private String boq;
    private String po;
    private String item;
    private String objetoContratado;
    private String unidade;
    private Integer quantidade;
    private BigDecimal valorTotal;
    private String observacoes;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate dataPo;

    private List<Lancamento> lancamentos; // Incluindo a lista de Lançamentos

    private String faturamento;
    private String solitIdFat;
    private String recebIdFat;
    private String idFaturamento;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate dataFatInprout;

    private String solitFsPortal;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy")
    private LocalDate dataFs;

    private String numFs;
    private String gate;
    private String gateId;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime dataCriacao;

    @JsonFormat(shape = JsonFormat.Shape.STRING, pattern = "dd/MM/yyyy HH:mm:ss")
    private LocalDateTime dataAtualizacao;

    private String usuarioCriacao;
    private String usuarioAtualizacao;
    private String statusRegistro;

    public OsResponseDto(OS os) {
        this.id = os.getId();
        this.os = os.getOs();
        this.site = os.getSite();
        this.contrato = os.getContrato();
        this.segmento = os.getSegmento();
        this.projeto = os.getProjeto();
        this.gestorTim = os.getGestorTim();
        this.regional = os.getRegional();
        this.lpu = os.getLpu();
        this.lote = os.getLote();
        this.boq = os.getBoq();
        this.po = os.getPo();
        this.item = os.getItem();
        this.objetoContratado = os.getObjetoContratado();
        this.unidade = os.getUnidade();
        this.quantidade = os.getQuantidade();
        this.valorTotal = os.getValorTotal();
        this.observacoes = os.getObservacoes();
        this.dataPo = os.getDataPo();
        this.lancamentos = os.getLancamentos();
        this.faturamento = os.getFaturamento();
        this.solitIdFat = os.getSolitIdFat();
        this.recebIdFat = os.getRecebIdFat();
        this.idFaturamento = os.getIdFaturamento();
        this.dataFatInprout = os.getDataFatInprout();
        this.solitFsPortal = os.getSolitFsPortal();
        this.dataFs = os.getDataFs();
        this.numFs = os.getNumFs();
        this.gate = os.getGate();
        this.gateId = os.getGateId();
        this.dataCriacao = os.getDataCriacao();
        this.dataAtualizacao = os.getDataAtualizacao();
        this.usuarioCriacao = os.getUsuarioCriacao();
        this.usuarioAtualizacao = os.getUsuarioAtualizacao();
        this.statusRegistro = os.getStatusRegistro();
    }

    public Long getId() {
        return id;
    }

    public String getOs() {
        return os;
    }

    public String getSite() {
        return site;
    }

    public String getContrato() {
        return contrato;
    }

    public String getSegmento() {
        return segmento;
    }

    public String getProjeto() {
        return projeto;
    }

    public String getGestorTim() {
        return gestorTim;
    }

    public String getRegional() {
        return regional;
    }

    public Lpu getLpu() {
        return lpu;
    }

    public String getLote() {
        return lote;
    }

    public String getBoq() {
        return boq;
    }

    public String getPo() {
        return po;
    }

    public String getItem() {
        return item;
    }

    public String getObjetoContratado() {
        return objetoContratado;
    }

    public String getUnidade() {
        return unidade;
    }

    public Integer getQuantidade() {
        return quantidade;
    }

    public BigDecimal getValorTotal() {
        return valorTotal;
    }

    public String getObservacoes() {
        return observacoes;
    }

    public LocalDate getDataPo() {
        return dataPo;
    }

    public List<Lancamento> getLancamentos() {
        return lancamentos;
    }

    public String getFaturamento() {
        return faturamento;
    }

    public String getSolitIdFat() {
        return solitIdFat;
    }

    public String getRecebIdFat() {
        return recebIdFat;
    }

    public String getIdFaturamento() {
        return idFaturamento;
    }

    public LocalDate getDataFatInprout() {
        return dataFatInprout;
    }

    public String getSolitFsPortal() {
        return solitFsPortal;
    }

    public LocalDate getDataFs() {
        return dataFs;
    }

    public String getNumFs() {
        return numFs;
    }

    public String getGate() {
        return gate;
    }

    public String getGateId() {
        return gateId;
    }

    public LocalDateTime getDataCriacao() {
        return dataCriacao;
    }

    public LocalDateTime getDataAtualizacao() {
        return dataAtualizacao;
    }

    public String getUsuarioCriacao() {
        return usuarioCriacao;
    }

    public String getUsuarioAtualizacao() {
        return usuarioAtualizacao;
    }

    public String getStatusRegistro() {
        return statusRegistro;
    }
}