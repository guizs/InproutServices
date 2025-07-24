package br.com.inproutservices.inproutsystem.config;

import br.com.inproutservices.inproutsystem.entities.usuario.Usuario;
import br.com.inproutservices.inproutsystem.repositories.usuarios.UsuarioRepository;
import br.com.inproutservices.inproutsystem.services.usuarios.TokenService;
import jakarta.servlet.FilterChain;
import jakarta.servlet.ServletException;
import jakarta.servlet.http.Cookie;
import jakarta.servlet.http.HttpServletRequest;
import jakarta.servlet.http.HttpServletResponse;
import org.springframework.security.authentication.UsernamePasswordAuthenticationToken;
import org.springframework.security.core.context.SecurityContextHolder;
import org.springframework.stereotype.Component;
import org.springframework.web.filter.OncePerRequestFilter;

import java.io.IOException;
import java.util.Optional;

@Component
public class JwtRequestFilter extends OncePerRequestFilter {

    private final TokenService tokenService;
    private final UsuarioRepository usuarioRepository;

    public JwtRequestFilter(TokenService tokenService, UsuarioRepository usuarioRepository) {
        this.tokenService = tokenService;
        this.usuarioRepository = usuarioRepository;
    }

    @Override
    protected void doFilterInternal(HttpServletRequest request, HttpServletResponse response, FilterChain filterChain)
            throws ServletException, IOException {

        String jwt = null;
        String userEmail = null;

        // Tenta extrair o token do cookie
        if (request.getCookies() != null) {
            for (Cookie cookie : request.getCookies()) {
                if ("jwt-token".equals(cookie.getName())) {
                    jwt = cookie.getValue();
                }
            }
        }

        if (jwt != null) {
            userEmail = tokenService.extractUsername(jwt);
        }

        if (userEmail != null && SecurityContextHolder.getContext().getAuthentication() == null) {
            Optional<Usuario> userDetailsOpt = this.usuarioRepository.findByEmail(userEmail);
            if (userDetailsOpt.isPresent()) {
                Usuario userDetails = userDetailsOpt.get();
                if (tokenService.isTokenValid(jwt, userDetails)) {
                    UsernamePasswordAuthenticationToken authToken = new UsernamePasswordAuthenticationToken(
                            userDetails, null, userDetails.getAuthorities());
                    SecurityContextHolder.getContext().setAuthentication(authToken);
                }
            }
        }
        filterChain.doFilter(request, response);
    }
}