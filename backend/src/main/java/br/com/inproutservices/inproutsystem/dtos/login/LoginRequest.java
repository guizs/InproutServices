package br.com.inproutservices.inproutsystem.dtos.login;

public class LoginRequest {
    private String email;
    private String senha;
    private boolean lembrarMe; // NOVO CAMPO

    // Getters e Setters
    public String getEmail() { return email; }
    public void setEmail(String email) { this.email = email; }

    public String getSenha() { return senha; }
    public void setSenha(String senha) { this.senha = senha; }

    public boolean isLembrarMe() { return lembrarMe; }
    public void setLembrarMe(boolean lembrarMe) { this.lembrarMe = lembrarMe; }
}