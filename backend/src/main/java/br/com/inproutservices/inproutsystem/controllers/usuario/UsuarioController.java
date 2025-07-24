package br.com.inproutservices.inproutsystem.controllers.usuario;

import br.com.inproutservices.inproutsystem.dtos.login.LoginRequest;
import br.com.inproutservices.inproutsystem.dtos.usuario.UsuarioRequestDTO;
import br.com.inproutservices.inproutsystem.entities.usuario.Usuario;
import br.com.inproutservices.inproutsystem.repositories.usuarios.UsuarioRepository;
import br.com.inproutservices.inproutsystem.services.usuarios.PasswordService;
import br.com.inproutservices.inproutsystem.services.usuarios.TokenService;
import br.com.inproutservices.inproutsystem.services.usuarios.UsuarioService;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.beans.factory.annotation.Autowired;
import br.com.inproutservices.inproutsystem.entities.index.Segmento;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.security.crypto.bcrypt.BCryptPasswordEncoder;
import org.springframework.web.bind.annotation.*;

import java.util.*;
import java.util.stream.Collectors;

@RestController
@RequestMapping("/usuarios")
public class UsuarioController {

    private final UsuarioRepository usuarioRepo;
    private final PasswordService passwordService;
    private final UsuarioService usuarioService;
    private final TokenService tokenService;

    public UsuarioController(UsuarioRepository usuarioRepo, PasswordService passwordService, UsuarioService usuarioService, TokenService tokenService) {
        this.usuarioRepo = usuarioRepo;
        this.passwordService = passwordService;
        this.usuarioService = usuarioService;
        this.tokenService = tokenService;
    }

    // Criar usuário
    @PostMapping
    public Usuario criar(@RequestBody UsuarioRequestDTO usuarioDTO) {
        return usuarioService.criarUsuario(usuarioDTO);
    }

    // Listar usuários ativos
    @GetMapping
    public List<Usuario> listar() {
        return usuarioRepo.findAll().stream()
                .filter(usuario -> Boolean.TRUE.equals(usuario.getAtivo()))
                .toList();
    }

    // Alterar senha via email
    @PutMapping("/senha")
    public String alterarSenha(@RequestParam String email, @RequestParam String novaSenha) {
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            usuario.setSenha(passwordService.encode(novaSenha));
            usuarioRepo.save(usuario);
            return "Senha atualizada com sucesso.";
        } else {
            return "Usuário não encontrado.";
        }
    }

    // Desativar usuário (soft delete) via email
    @DeleteMapping
    public String desativarUsuario(@RequestParam String email) {
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (!usuario.getAtivo()) {
                return "Usuário já está desativado.";
            }
            usuario.setAtivo(false);
            usuarioRepo.save(usuario);
            return "Usuário desativado com sucesso.";
        } else {
            return "Usuário não encontrado.";
        }
    }

    // Ativar usuário via email
    @PutMapping("/ativar")
    public String ativarUsuario(@RequestParam String email) {
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            if (usuario.getAtivo()) {
                return "Usuário já está ativo.";
            }
            usuario.setAtivo(true);
            usuarioRepo.save(usuario);
            return "Usuário ativado com sucesso.";
        } else {
            return "Usuário não encontrado.";
        }
    }

    @Autowired
    private UsuarioRepository usuarioRepository;

    @PostMapping("/login")
    public ResponseEntity<?> login(@RequestBody LoginRequest loginRequest, HttpServletResponse response) {
        Optional<Usuario> usuarioOpt = usuarioRepository.findByEmail(loginRequest.getEmail());

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            BCryptPasswordEncoder encoder = new BCryptPasswordEncoder();

            // VERIFICA SENHA E SE O USUÁRIO ESTÁ ATIVO
            if (encoder.matches(loginRequest.getSenha(), usuario.getSenha()) && usuario.getAtivo()) {
                String token = tokenService.generateToken(usuario);

                Cookie sessionCookie = new Cookie("jwt-token", token);
                sessionCookie.setHttpOnly(true);
                sessionCookie.setPath("/");
                sessionCookie.setMaxAge(60 * 60);
                response.addCookie(sessionCookie);

                if (loginRequest.isLembrarMe()) {
                    Cookie rememberMeCookie = new Cookie("remember-me", loginRequest.getEmail());
                    rememberMeCookie.setPath("/");
                    rememberMeCookie.setMaxAge(7 * 24 * 60 * 60);
                    response.addCookie(rememberMeCookie);
                } else {
                    Cookie rememberMeCookie = new Cookie("remember-me", null);
                    rememberMeCookie.setPath("/");
                    rememberMeCookie.setMaxAge(0);
                    response.addCookie(rememberMeCookie);
                }

                Map<String, Object> responseBody = new HashMap<>();
                responseBody.put("id", usuario.getId());
                responseBody.put("usuario", usuario.getNome());
                responseBody.put("email", usuario.getEmail());
                responseBody.put("role", usuario.getRole());
                List<Long> segmentoIds = usuario.getSegmentos().stream().map(Segmento::getId).collect(Collectors.toList());
                responseBody.put("segmentos", segmentoIds);

                return ResponseEntity.ok(responseBody);
            }
        }
        return ResponseEntity.status(HttpStatus.UNAUTHORIZED).body("Usuário ou senha inválidos");
    }

    @PostMapping("/logout")
    public ResponseEntity<?> logout(HttpServletResponse response) {
        Cookie sessionCookie = new Cookie("jwt-token", null);
        sessionCookie.setHttpOnly(true);
        sessionCookie.setPath("/");
        sessionCookie.setMaxAge(0);
        response.addCookie(sessionCookie);

        Cookie rememberMeCookie = new Cookie("remember-me", null);
        rememberMeCookie.setPath("/");
        rememberMeCookie.setMaxAge(0);
        response.addCookie(rememberMeCookie);

        return ResponseEntity.ok("Logout realizado com sucesso.");
    }

    @PutMapping("/email")
    public ResponseEntity<String> alterarEmail(@RequestParam String emailAtual, @RequestParam String novoEmail) {
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(emailAtual);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();

            Optional<Usuario> emailExistente = usuarioRepo.findByEmail(novoEmail);
            if (emailExistente.isPresent()) {
                return ResponseEntity.status(HttpStatus.CONFLICT).body("Novo e-mail já está em uso.");
            }

            usuario.setEmail(novoEmail);
            usuarioRepo.save(usuario);
            return ResponseEntity.ok("E-mail atualizado com sucesso.");
        } else {
            return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
        }
    }

    @GetMapping("/{email}")
    public ResponseEntity<?> buscarUsuarioPorEmail(@PathVariable String email) {
        Optional<Usuario> usuarioOpt = usuarioRepo.findByEmail(email);

        if (usuarioOpt.isPresent()) {
            Usuario usuario = usuarioOpt.get();
            Map<String, Object> response = new HashMap<>();
            response.put("nome", usuario.getNome());
            response.put("email", usuario.getEmail());
            return ResponseEntity.ok(response);
        }

        return ResponseEntity.status(HttpStatus.NOT_FOUND).body("Usuário não encontrado.");
    }
}