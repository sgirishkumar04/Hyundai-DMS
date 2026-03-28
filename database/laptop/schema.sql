-- ============================================================
--  HYUNDAI DEALER MANAGEMENT SYSTEM – PRODUCTION-READY SCHEMA
--  Target: Office Laptop Migration (100% Comprehensive)
--  Includes Multi-Dealer Support & Analytics Procedures
-- ============================================================

CREATE DATABASE IF NOT EXISTS hyundai_dms CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
USE hyundai_dms;

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────
--  1. SYSTEM & GLOBAL (Multi-Dealer Architecture)
-- ─────────────────────────────────────────────

CREATE TABLE IF NOT EXISTS dealers (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    dealer_code     VARCHAR(20)  NOT NULL UNIQUE,
    name            VARCHAR(150) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    address         TEXT,
    gst_number      VARCHAR(20)  UNIQUE,
    contact_name    VARCHAR(150),
    contact_phone   VARCHAR(20),
    contact_email   VARCHAR(150),
    status          ENUM('PENDING','ACTIVE','DECLINED','DEACTIVATED') NOT NULL DEFAULT 'PENDING',
    created_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at      DATETIME     NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE IF NOT EXISTS dealer_registrations (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    dealer_name     VARCHAR(150) NOT NULL,
    city            VARCHAR(100) NOT NULL,
    state           VARCHAR(100) NOT NULL,
    address         TEXT,
    gst_number      VARCHAR(20),
    contact_name    VARCHAR(150) NOT NULL,
    contact_phone   VARCHAR(20)  NOT NULL,
    admin_email     VARCHAR(150) NOT NULL UNIQUE,
    admin_full_name VARCHAR(150) NOT NULL,
    admin_password_hash VARCHAR(255) NOT NULL,
    status          ENUM('PENDING','ACTIVE','DECLINED') NOT NULL DEFAULT 'PENDING',
    rejection_reason TEXT,
    reviewed_by     BIGINT,
    reviewed_at     DATETIME,
    dealer_id       BIGINT,
    created_at      DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_reg_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4;

CREATE TABLE audit_logs (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    dealer_id       BIGINT,
    user_id         BIGINT,
    user_name       VARCHAR(150),
    entity_name     VARCHAR(100) NOT NULL,
    entity_id       BIGINT,
    action          VARCHAR(20) NOT NULL,
    old_value       TEXT,
    new_value       TEXT,
    ip_address      VARCHAR(50),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    INDEX idx_audit_dealer (dealer_id)
);

-- ─────────────────────────────────────────────
--  2. LOOKUP / REFERENCE TABLES
-- ─────────────────────────────────────────────

CREATE TABLE roles (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(50)  NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE permissions (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255)
);

CREATE TABLE role_permissions (
    role_id       BIGINT NOT NULL,
    permission_id BIGINT NOT NULL,
    PRIMARY KEY (role_id, permission_id),
    CONSTRAINT fk_rp_role FOREIGN KEY (role_id) REFERENCES roles(id) ON DELETE CASCADE,
    CONSTRAINT fk_rp_perm FOREIGN KEY (permission_id) REFERENCES permissions(id) ON DELETE CASCADE
);

CREATE TABLE departments (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    name        VARCHAR(100) NOT NULL UNIQUE,
    description VARCHAR(255),
    created_at  TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE lead_sources (
    id   BIGINT AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(100) NOT NULL UNIQUE
);

CREATE TABLE colors (
    id        BIGINT AUTO_INCREMENT PRIMARY KEY,
    name      VARCHAR(50)  NOT NULL,
    hex_code  VARCHAR(10),
    UNIQUE KEY uq_color_name (name)
);

CREATE TABLE engine_types (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(100) NOT NULL UNIQUE,
    fuel_category VARCHAR(30)
);

CREATE TABLE inventory_locations (
    id       BIGINT AUTO_INCREMENT PRIMARY KEY,
    name     VARCHAR(100) NOT NULL UNIQUE,
    address  VARCHAR(255)
);

CREATE TABLE banks (
    id      BIGINT AUTO_INCREMENT PRIMARY KEY,
    name    VARCHAR(150) NOT NULL UNIQUE,
    ifsc_prefix VARCHAR(10),
    contact VARCHAR(20)
);

CREATE TABLE suppliers (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    name         VARCHAR(150) NOT NULL,
    contact_name VARCHAR(100),
    phone        VARCHAR(20),
    email        VARCHAR(100),
    address      VARCHAR(255),
    gst_number   VARCHAR(20),
    dealer_id    BIGINT,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    UNIQUE KEY uq_supplier_name (name)
);

-- ─────────────────────────────────────────────
--  3. EMPLOYEE CORE
-- ─────────────────────────────────────────────

CREATE TABLE employees (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_code VARCHAR(20) NOT NULL UNIQUE,
    first_name    VARCHAR(80) NOT NULL,
    last_name     VARCHAR(80) NOT NULL,
    email         VARCHAR(150) NOT NULL UNIQUE,
    phone         VARCHAR(20),
    password_hash VARCHAR(255) NOT NULL,
    department_id BIGINT NOT NULL,
    role_id       BIGINT NOT NULL,
    dealer_id     BIGINT NULL,
    manager_id    BIGINT,
    date_of_join  DATE,
    is_active     BOOLEAN DEFAULT TRUE,
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_emp_dept   FOREIGN KEY (department_id) REFERENCES departments(id),
    CONSTRAINT fk_emp_role   FOREIGN KEY (role_id)       REFERENCES roles(id),
    CONSTRAINT fk_emp_dealer FOREIGN KEY (dealer_id)     REFERENCES dealers(id)
);

-- ─────────────────────────────────────────────
--  4. VEHICLE CATALOGUE & INVENTORY
-- ─────────────────────────────────────────────

CREATE TABLE vehicle_models (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_code   VARCHAR(20) NOT NULL UNIQUE,
    model_name   VARCHAR(100) NOT NULL,
    segment      VARCHAR(50),
    is_active    BOOLEAN DEFAULT TRUE,
    created_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

CREATE TABLE vehicle_variants (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    model_id      BIGINT NOT NULL,
    variant_code  VARCHAR(20) NOT NULL UNIQUE,
    variant_name  VARCHAR(100) NOT NULL,
    engine_type_id BIGINT NOT NULL,
    transmission  VARCHAR(30),
    ex_showroom_price DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_vv_model  FOREIGN KEY (model_id)       REFERENCES vehicle_models(id),
    CONSTRAINT fk_vv_engine FOREIGN KEY (engine_type_id) REFERENCES engine_types(id)
);

CREATE TABLE vehicles (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    vin             VARCHAR(17) NOT NULL UNIQUE,
    engine_number   VARCHAR(50) UNIQUE,
    chassis_number  VARCHAR(50) UNIQUE,
    variant_id      BIGINT NOT NULL,
    color_id        BIGINT NOT NULL,
    location_id     BIGINT NOT NULL,
    status          ENUM('IN_STOCK','ALLOCATED','SOLD','IN_TRANSIT','DEMO') DEFAULT 'IN_STOCK',
    allocated_dealer_id BIGINT NULL,
    dealer_cost     DECIMAL(12,2),
    created_at      TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_v_variant  FOREIGN KEY (variant_id)  REFERENCES vehicle_variants(id),
    CONSTRAINT fk_v_color    FOREIGN KEY (color_id)    REFERENCES colors(id),
    CONSTRAINT fk_v_location FOREIGN KEY (location_id) REFERENCES inventory_locations(id)
);

-- ─────────────────────────────────────────────
--  5. CUSTOMERS & LEADS
-- ─────────────────────────────────────────────

CREATE TABLE customers (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_code  VARCHAR(20) NOT NULL UNIQUE,
    first_name     VARCHAR(80) NOT NULL,
    last_name      VARCHAR(80) NOT NULL,
    phone          VARCHAR(20) NOT NULL,
    email          VARCHAR(150),
    dealer_id      BIGINT NOT NULL,
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cust_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id)
);

CREATE TABLE customer_addresses (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    customer_id BIGINT NOT NULL,
    type        ENUM('HOME','OFFICE','OTHER') DEFAULT 'HOME',
    line1       VARCHAR(255) NOT NULL,
    city        VARCHAR(100) NOT NULL,
    state       VARCHAR(100) NOT NULL,
    pincode     VARCHAR(10) NOT NULL,
    CONSTRAINT fk_ca_customer FOREIGN KEY (customer_id) REFERENCES customers(id) ON DELETE CASCADE
);

CREATE TABLE leads (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    lead_number      VARCHAR(20) NOT NULL UNIQUE,
    customer_id      BIGINT NOT NULL,
    source_id        BIGINT NOT NULL,
    assigned_to      BIGINT NOT NULL,
    dealer_id        BIGINT NOT NULL,
    status           ENUM('NEW','CONTACTED','TEST_DRIVE','NEGOTIATION','BOOKED','LOST','DELIVERED') DEFAULT 'NEW',
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_lead_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id)
);

CREATE TABLE test_drives (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    lead_id       BIGINT NOT NULL,
    vehicle_id    BIGINT NOT NULL,
    scheduled_at  DATETIME NOT NULL,
    conducted_by  BIGINT NOT NULL,
    status        ENUM('SCHEDULED','COMPLETED','CANCELLED') DEFAULT 'SCHEDULED',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_td_lead FOREIGN KEY (lead_id) REFERENCES leads(id)
);

-- ─────────────────────────────────────────────
--  6. BOOKINGS & SALES
-- ─────────────────────────────────────────────

CREATE TABLE bookings (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_number   VARCHAR(20) NOT NULL UNIQUE,
    lead_id          BIGINT NOT NULL,
    customer_id      BIGINT NOT NULL,
    variant_id       BIGINT NOT NULL,
    color_id         BIGINT NOT NULL,
    sales_exec_id    BIGINT NOT NULL,
    dealer_id        BIGINT NOT NULL,
    total_on_road    DECIMAL(12,2) NOT NULL,
    status           ENUM('BOOKED','ALLOCATED','INVOICED','DELIVERED','CANCELLED') DEFAULT 'BOOKED',
    vehicle_id       BIGINT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_bk_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id)
);

CREATE TABLE booking_payments (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id     BIGINT NOT NULL,
    amount         DECIMAL(12,2) NOT NULL,
    payment_mode   ENUM('CASH','CHEQUE','NEFT','RTGS','UPI','CARD') NOT NULL,
    payment_date   DATE NOT NULL,
    reference_no   VARCHAR(100),
    recorded_by    BIGINT NOT NULL,
    CONSTRAINT fk_bp_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE vehicle_allocations (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    booking_id   BIGINT NOT NULL UNIQUE,
    vehicle_id   BIGINT NOT NULL UNIQUE,
    allocated_by BIGINT NOT NULL,
    allocated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_va_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ─────────────────────────────────────────────
--  7. INVOICING
-- ─────────────────────────────────────────────

CREATE TABLE invoices (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_number VARCHAR(20) NOT NULL UNIQUE,
    booking_id     BIGINT NOT NULL UNIQUE,
    customer_id    BIGINT NOT NULL,
    dealer_id      BIGINT NOT NULL,
    invoice_date   DATE NOT NULL,
    total_amount   DECIMAL(12,2) NOT NULL,
    status         ENUM('DRAFT','ISSUED','PAID','CANCELLED') DEFAULT 'DRAFT',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_inv_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id)
);

CREATE TABLE invoice_items (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    invoice_id  BIGINT NOT NULL,
    description VARCHAR(255) NOT NULL,
    quantity    DECIMAL(10,3) DEFAULT 1,
    unit_price  DECIMAL(12,2) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    CONSTRAINT fk_ii_invoice FOREIGN KEY (invoice_id) REFERENCES invoices(id) ON DELETE CASCADE
);

-- ─────────────────────────────────────────────
--  8. SERVICE CENTER
-- ─────────────────────────────────────────────

CREATE TABLE mechanics (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    employee_id BIGINT NOT NULL UNIQUE,
    speciality  VARCHAR(100),
    CONSTRAINT fk_mech_emp FOREIGN KEY (employee_id) REFERENCES employees(id)
);

CREATE TABLE service_appointments (
    id               BIGINT AUTO_INCREMENT PRIMARY KEY,
    appointment_no   VARCHAR(20) NOT NULL UNIQUE,
    customer_id      BIGINT NOT NULL,
    vehicle_reg_no   VARCHAR(20) NOT NULL,
    vehicle_variant_id BIGINT,
    dealer_id        BIGINT NOT NULL,
    appointed_by     BIGINT NOT NULL,
    appointment_date DATETIME NOT NULL,
    service_type     ENUM('PERIODIC','REPAIR','ACCIDENTAL','WARRANTY','RECALL','GENERAL_CHECKUP') NOT NULL,
    status           ENUM('SCHEDULED','IN_PROGRESS','COMPLETED','CANCELLED') DEFAULT 'SCHEDULED',
    remarks          TEXT,
    created_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    updated_at       TIMESTAMP DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_sa_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id),
    CONSTRAINT fk_sa_variant FOREIGN KEY (vehicle_variant_id) REFERENCES vehicle_variants(id),
    INDEX idx_svc_dealer (dealer_id)
);

CREATE TABLE job_cards (
    id                  BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_card_no         VARCHAR(20) NOT NULL UNIQUE,
    appointment_id      BIGINT NOT NULL UNIQUE,
    mechanic_id         BIGINT NOT NULL,
    labour_cost         DECIMAL(10,2) DEFAULT 0,
    parts_cost          DECIMAL(10,2) DEFAULT 0,
    total_cost          DECIMAL(10,2) DEFAULT 0,
    status              ENUM('OPEN','IN_PROGRESS','PENDING_PARTS','COMPLETED','BILLED') DEFAULT 'OPEN',
    created_at          TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_jc_appointment FOREIGN KEY (appointment_id) REFERENCES service_appointments(id)
);

CREATE TABLE service_history (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_card_id   BIGINT NOT NULL,
    description   VARCHAR(255) NOT NULL,
    action_taken  TEXT,
    recorded_at   TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_sh_jobcard FOREIGN KEY (job_card_id) REFERENCES job_cards(id)
);

-- ─────────────────────────────────────────────
--  9. SPARE PARTS
-- ─────────────────────────────────────────────

CREATE TABLE spare_parts (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_number  VARCHAR(50) NOT NULL UNIQUE,
    name         VARCHAR(150) NOT NULL,
    dealer_id    BIGINT NOT NULL,
    unit_price   DECIMAL(12,2) NOT NULL,
    is_active    BOOLEAN DEFAULT TRUE,
    CONSTRAINT fk_sp_dealer FOREIGN KEY (dealer_id) REFERENCES dealers(id)
);

CREATE TABLE spare_part_inventory (
    id           BIGINT AUTO_INCREMENT PRIMARY KEY,
    part_id      BIGINT NOT NULL UNIQUE,
    location_id  BIGINT NOT NULL,
    quantity     DECIMAL(10,3) NOT NULL DEFAULT 0,
    reorder_level DECIMAL(10,3) DEFAULT 5,
    CONSTRAINT fk_spi_part FOREIGN KEY (part_id) REFERENCES spare_parts(id)
);

CREATE TABLE spare_part_usage (
    id          BIGINT AUTO_INCREMENT PRIMARY KEY,
    job_card_id BIGINT NOT NULL,
    part_id     BIGINT NOT NULL,
    quantity    DECIMAL(10,3) NOT NULL,
    total_price DECIMAL(12,2) NOT NULL,
    used_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_spu_jobcard FOREIGN KEY (job_card_id) REFERENCES job_cards(id)
);

-- ─────────────────────────────────────────────
--  10. FINANCE & INSURANCE
-- ─────────────────────────────────────────────

CREATE TABLE finance_loans (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    loan_number    VARCHAR(30) NOT NULL UNIQUE,
    booking_id     BIGINT NOT NULL,
    customer_id    BIGINT NOT NULL,
    bank_id        BIGINT NOT NULL,
    loan_amount    DECIMAL(12,2) NOT NULL,
    status         ENUM('APPLIED','APPROVED','DISBURSED','REJECTED','CLOSED') DEFAULT 'APPLIED',
    created_at     TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_fl_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

CREATE TABLE insurance_policies (
    id              BIGINT AUTO_INCREMENT PRIMARY KEY,
    policy_number   VARCHAR(50) NOT NULL UNIQUE,
    booking_id      BIGINT NOT NULL,
    customer_id     BIGINT NOT NULL,
    insurer_name    VARCHAR(150) NOT NULL,
    premium_amount  DECIMAL(10,2) NOT NULL,
    end_date        DATE NOT NULL,
    status          ENUM('ACTIVE','EXPIRED','CANCELLED') DEFAULT 'ACTIVE',
    CONSTRAINT fk_ip_booking FOREIGN KEY (booking_id) REFERENCES bookings(id)
);

-- ─────────────────────────────────────────────
--  11. PAYMENTS & RECEIPTS
-- ─────────────────────────────────────────────

CREATE TABLE payments (
    id            BIGINT AUTO_INCREMENT PRIMARY KEY,
    payment_ref   VARCHAR(30) NOT NULL UNIQUE,
    invoice_id    BIGINT,
    customer_id   BIGINT NOT NULL,
    amount        DECIMAL(12,2) NOT NULL,
    payment_mode  ENUM('CASH','CHEQUE','NEFT','RTGS','UPI','CARD') NOT NULL,
    status        ENUM('PENDING','COMPLETED','FAILED','REFUNDED') DEFAULT 'PENDING',
    created_at    TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_pay_customer FOREIGN KEY (customer_id) REFERENCES customers(id)
);

CREATE TABLE receipts (
    id             BIGINT AUTO_INCREMENT PRIMARY KEY,
    receipt_number VARCHAR(20) NOT NULL UNIQUE,
    payment_id     BIGINT NOT NULL UNIQUE,
    issued_date    DATE NOT NULL,
    issued_by      BIGINT NOT NULL,
    CONSTRAINT fk_rec_payment FOREIGN KEY (payment_id) REFERENCES payments(id)
);

-- ─────────────────────────────────────────────
--  12. STORED PROCEDURES
-- ─────────────────────────────────────────────

DELIMITER //

DROP PROCEDURE IF EXISTS GetMonthlyBookings;
CREATE PROCEDURE GetMonthlyBookings(IN p_year INT)
BEGIN
    SELECT 
        DATE_FORMAT(created_at, '%Y-%m') AS month_label,
        COUNT(*) AS booking_count,
        SUM(total_on_road) AS total_revenue
    FROM bookings
    WHERE status <> 'CANCELLED'
      AND (p_year IS NULL OR YEAR(created_at) = p_year)
    GROUP BY month_label
    ORDER BY month_label DESC
    LIMIT 12;
END //

DROP PROCEDURE IF EXISTS GetTopSellingModels;
CREATE PROCEDURE GetTopSellingModels(IN p_year INT, IN p_month INT)
BEGIN
    SELECT vm.model_name,
           COUNT(b.id) AS total_bookings,
           SUM(b.total_on_road) AS total_revenue
    FROM bookings b
    JOIN vehicle_variants vv ON b.variant_id = vv.id
    JOIN vehicle_models vm ON vv.model_id = vm.id
    WHERE b.status <> 'CANCELLED'
      AND (p_year IS NULL OR YEAR(b.created_at) = p_year)
      AND (p_month IS NULL OR MONTH(b.created_at) = p_month)
    GROUP BY vm.model_name
    ORDER BY total_bookings DESC
    LIMIT 8;
END //

DROP PROCEDURE IF EXISTS GetLeadFunnelCounts;
CREATE PROCEDURE GetLeadFunnelCounts(IN p_year INT, IN p_month INT)
BEGIN
    SELECT status AS lead_status, COUNT(*) AS lead_count
    FROM leads
    WHERE (p_year IS NULL OR YEAR(created_at) = p_year)
      AND (p_month IS NULL OR MONTH(created_at) = p_month)
    GROUP BY status
    ORDER BY lead_count DESC;
END //

DROP PROCEDURE IF EXISTS GetInventoryStatusSummary;
CREATE PROCEDURE GetInventoryStatusSummary(IN p_year INT, IN p_month INT)
BEGIN
    SELECT status AS vehicle_status, COUNT(*) AS vehicle_count
    FROM vehicles
    GROUP BY status;
END //

DELIMITER ;

-- ─────────────────────────────────────────────
--  13. SEED DATA
-- ─────────────────────────────────────────────

INSERT IGNORE INTO roles (id, name, description) VALUES 
(1, 'ADMIN', 'Showroom Administrator'),
(2, 'SALES_MANAGER', 'Sales Manager'),
(3, 'SALES_EXECUTIVE', 'Sales Executive'),
(4, 'SERVICE_ADVISOR', 'Service Advisor'),
(5, 'MECHANIC', 'Mechanic'),
(6, 'INVENTORY_MANAGER', 'Inventory Manager'),
(7, 'ACCOUNTS', 'Accounts'),
(8, 'SUPER_ADMIN', 'Platform Administrator');

INSERT IGNORE INTO departments (id, name) VALUES 
(1, 'Administration'), (2, 'Sales'), (3, 'Service'), (4, 'Inventory'), (5, 'Accounts');

INSERT IGNORE INTO dealers (id, dealer_code, name, city, state, address, status) VALUES 
(1, 'DLR-CHN-001', 'Hyundai Chennai Central', 'Chennai', 'Tamil Nadu', 'Anna Salai, Chennai', 'ACTIVE');

INSERT IGNORE INTO employees (id, employee_code, first_name, last_name, email, password_hash, department_id, role_id, dealer_id) VALUES 
(10, 'SA001', 'DMS', 'SuperAdmin', 'superadmin@hyundaidms.in', '$2a$10$XvhacGRPMsWhAlkEaf7e4ehLnRBfuZOtySYoFamAlky7aLXAkOWgm', 1, 8, NULL),
(1, 'EMP001', 'Girish', 'Kumar', 'admin@hyundaidms.in', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 1, 1, 1);

SET FOREIGN_KEY_CHECKS = 1;