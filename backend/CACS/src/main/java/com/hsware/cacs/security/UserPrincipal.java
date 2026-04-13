package com.hsware.cacs.security;

import com.hsware.cacs.entity.User;
import lombok.AllArgsConstructor;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.authority.SimpleGrantedAuthority;
import org.springframework.security.core.userdetails.UserDetails;

import java.util.Collection;
import java.util.LinkedHashSet;
import java.util.Set;
import java.util.stream.Collectors;

@Getter
@AllArgsConstructor
public class UserPrincipal implements UserDetails {

    private final Integer id;
    private final String email;
    private final String password;
    private final Set<String> roles;
    private final String status;
    private final Collection<? extends GrantedAuthority> authorities;

    public static UserPrincipal create(User user) {
        Set<String> roleNames = user.getRoles().stream()
            .map(role -> role.getName().toUpperCase())
            .collect(Collectors.toCollection(LinkedHashSet::new));

        if (roleNames.isEmpty() && user.getRole() != null && !user.getRole().isBlank()) {
            roleNames.add(user.getRole().toUpperCase());
        }

        Set<GrantedAuthority> authorities = roleNames.stream()
            .map(roleName -> new SimpleGrantedAuthority("ROLE_" + roleName))
            .collect(Collectors.toCollection(LinkedHashSet::new));

        return new UserPrincipal(
            user.getId(),
            user.getEmail(),
            user.getPassword(),
            roleNames,
            user.getStatus(),
            authorities
        );
    }

    @Override
    public String getUsername() {
        return email;
    }

    @Override
    public boolean isAccountNonExpired() {
        return true;
    }

    @Override
    public boolean isAccountNonLocked() {
        return true;
    }

    @Override
    public boolean isCredentialsNonExpired() {
        return true;
    }

    @Override
    public boolean isEnabled() {
        return "ACTIVE".equals(status);
    }
}
