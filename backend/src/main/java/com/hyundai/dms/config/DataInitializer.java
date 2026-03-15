package com.hyundai.dms.config;

import com.hyundai.dms.entity.*;
import com.hyundai.dms.repository.*;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.boot.CommandLineRunner;
import org.springframework.security.crypto.password.PasswordEncoder;
import org.springframework.stereotype.Component;

import java.time.LocalDate;
import java.util.Optional;

/**
 * Inserts seed data on startup if the database is empty.
 * Also ensures the admin user always has the correct password.
 * Runs AFTER Hibernate creates/updates tables.
 */
@Component
@RequiredArgsConstructor
@Slf4j
public class DataInitializer implements CommandLineRunner {

    private final RoleRepository roleRepo;
    private final DepartmentRepository deptRepo;
    private final EmployeeRepository employeeRepo;
    private final PasswordEncoder passwordEncoder;

    private static final String DEFAULT_PASSWORD  = "Password@123";
    private static final String ADMIN_EMAIL        = "admin@hyundaidms.in";

    @Override
    public void run(String... args) {
        // Always ensure admin password is correct (fixes existing wrong-hash scenario)
        Optional<Employee> existingAdmin = employeeRepo.findByEmailAndIsActiveTrue(ADMIN_EMAIL);
        existingAdmin.ifPresent(emp -> {
            if (!passwordEncoder.matches(DEFAULT_PASSWORD, emp.getPasswordHash())) {
                log.warn("DataInitializer: admin password hash is wrong – resetting …");
                emp.setPasswordHash(passwordEncoder.encode(DEFAULT_PASSWORD));
                employeeRepo.save(emp);
                log.info("DataInitializer: admin password reset to '" + DEFAULT_PASSWORD + "' ✓");
            } else {
                log.info("DataInitializer: admin password hash OK.");
            }
        });

        if (roleRepo.count() > 0) {
            log.info("DataInitializer: seed data present – skipping full seed.");
            return;
        }

        log.info("DataInitializer: inserting seed roles, departments and users …");

        // ── Roles ──────────────────────────────────────────────────────────────
        Role admin      = roleRepo.save(Role.builder().name("ADMIN")             .description("Full system access").build());
        Role salesMgr   = roleRepo.save(Role.builder().name("SALES_MANAGER")     .description("Manage sales team and targets").build());
        Role salesExec  = roleRepo.save(Role.builder().name("SALES_EXECUTIVE")   .description("Handle leads and bookings").build());
        Role svcAdvisor = roleRepo.save(Role.builder().name("SERVICE_ADVISOR")   .description("Manage service appointments").build());
        Role mechanic   = roleRepo.save(Role.builder().name("MECHANIC")          .description("Perform vehicle service").build());
        Role invMgr     = roleRepo.save(Role.builder().name("INVENTORY_MANAGER") .description("Manage vehicle & parts stock").build());
        Role accounts   = roleRepo.save(Role.builder().name("ACCOUNTS")          .description("Handle invoices and payments").build());

        // ── Departments ────────────────────────────────────────────────────────
        Department administration = deptRepo.save(Department.builder().name("Administration").description("Admin & HR").build());
        Department sales          = deptRepo.save(Department.builder().name("Sales")         .description("Vehicle sales department").build());
        Department service        = deptRepo.save(Department.builder().name("Service")       .description("After-sales service center").build());
        Department parts          = deptRepo.save(Department.builder().name("Parts")         .description("Spare parts department").build());
        Department finance        = deptRepo.save(Department.builder().name("Finance")       .description("Accounts and finance").build());

        String pwd = passwordEncoder.encode(DEFAULT_PASSWORD);

        // ── Employees ─────────────────────────────────────────────────────────
        employeeRepo.save(Employee.builder()
            .employeeCode("EMP001").firstName("S").lastName("GIRISH KUMAR")
            .email(ADMIN_EMAIL).phone("9000000001")
            .passwordHash(pwd).department(administration).role(admin)
            .dateOfJoin(LocalDate.of(2020, 1, 1)).isActive(true).build());

        employeeRepo.save(Employee.builder()
            .employeeCode("EMP002").firstName("Karthik").lastName("Rajan")
            .email("sm@hyundaidms.in").phone("9000000002")
            .passwordHash(pwd).department(sales).role(salesMgr)
            .dateOfJoin(LocalDate.of(2020, 3, 15)).isActive(true).build());

        employeeRepo.save(Employee.builder()
            .employeeCode("EMP003").firstName("Deepika").lastName("Menon")
            .email("deepika@hyundaidms.in").phone("9000000003")
            .passwordHash(pwd).department(sales).role(salesExec)
            .dateOfJoin(LocalDate.of(2021, 6, 1)).isActive(true).build());

        employeeRepo.save(Employee.builder()
            .employeeCode("EMP004").firstName("Rahul").lastName("Verma")
            .email("rahul@hyundaidms.in").phone("9000000004")
            .passwordHash(pwd).department(sales).role(salesExec)
            .dateOfJoin(LocalDate.of(2021, 9, 10)).isActive(true).build());

        employeeRepo.save(Employee.builder()
            .employeeCode("EMP005").firstName("Preethi").lastName("Srinivasan")
            .email("preethi@hyundaidms.in").phone("9000000005")
            .passwordHash(pwd).department(service).role(svcAdvisor)
            .dateOfJoin(LocalDate.of(2020, 7, 20)).isActive(true).build());

        employeeRepo.save(Employee.builder()
            .employeeCode("EMP006").firstName("Murugan").lastName("Selvaraj")
            .email("murugan@hyundaidms.in").phone("9000000006")
            .passwordHash(pwd).department(service).role(mechanic)
            .dateOfJoin(LocalDate.of(2019, 11, 11)).isActive(true).build());

        employeeRepo.save(Employee.builder()
            .employeeCode("EMP007").firstName("Lakshmi").lastName("Narayanan")
            .email("lakshmi@hyundaidms.in").phone("9000000007")
            .passwordHash(pwd).department(parts).role(invMgr)
            .dateOfJoin(LocalDate.of(2022, 1, 3)).isActive(true).build());

        employeeRepo.save(Employee.builder()
            .employeeCode("EMP008").firstName("Vijay").lastName("Anand")
            .email("vijay@hyundaidms.in").phone("9000000008")
            .passwordHash(pwd).department(finance).role(accounts)
            .dateOfJoin(LocalDate.of(2020, 5, 18)).isActive(true).build());

        log.info("DataInitializer: ✓ All seed data inserted.");
        log.info("  admin@hyundaidms.in  / Password@123  → ADMIN");
        log.info("  sm@hyundaidms.in     / Password@123  → SALES_MANAGER");
    }
}
