package com.hyundai.dms.security;

import com.hyundai.dms.entity.Employee;
import lombok.Getter;
import org.springframework.security.core.GrantedAuthority;
import org.springframework.security.core.userdetails.User;

import java.util.Collection;

@Getter
public class UserPrincipal extends User {
    private final Long dealerId;
    private final boolean isSuperAdmin;
    private final String employeeCode;

    public UserPrincipal(Employee employee, Collection<? extends GrantedAuthority> authorities) {
        super(employee.getEmail(), employee.getPasswordHash(), authorities);
        this.dealerId = (employee.getDealer() != null) ? employee.getDealer().getId() : null;
        this.isSuperAdmin = "SUPER_ADMIN".equals(employee.getRole().getName());
        this.employeeCode = employee.getEmployeeCode();
    }
}
