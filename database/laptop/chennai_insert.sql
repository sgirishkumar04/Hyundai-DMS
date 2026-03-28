-- ============================================================
--  HYUNDAI CHENNAI CENTRAL – 2026 ENRICHED SAMPLE DATA
--  Target: Dealer ID #1 (Hyundai Chennai Central)
--  Volume: 25+ Leads, 15+ Bookings, 20+ Vehicles
-- ============================================================

USE hyundai_dms;

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────
--  1. CATALOGUE (Comprehensive Lineup)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO vehicle_models (id, model_code, model_name, segment) VALUES 
(1, 'MDL001', 'Creta', 'SUV'),
(2, 'MDL002', 'Venue', 'Compact SUV'),
(3, 'MDL003', 'Verna', 'Sedan'),
(4, 'MDL004', 'i20', 'Hatchback'),
(5, 'MDL005', 'Tucson', 'Premium SUV'),
(6, 'MDL006', 'Ioniq 5', 'EV'),
(7, 'MDL007', 'Exter', 'Micro SUV'),
(8, 'MDL008', 'Alcazar', 'Premium 7-Seater');

INSERT IGNORE INTO engine_types (id, name, fuel_category) VALUES 
(1, '1.5L MPi Petrol', 'PETROL'),
(2, '1.5L CRDi Diesel', 'DIESEL'),
(3, '1.0L Turbo GDi', 'PETROL'),
(4, '72.6kWh Battery', 'ELECTRIC'),
(5, '1.2L Kappa Petrol', 'PETROL');

INSERT IGNORE INTO vehicle_variants (id, model_id, variant_code, variant_name, engine_type_id, transmission, ex_showroom_price) VALUES 
(1, 1, 'CRT-SX-D', 'Creta SX Diesel', 2, 'Manual', 1650000.00),
(2, 1, 'CRT-SXO-D-AT', 'Creta SX(O) Diesel AT', 2, 'Automatic', 1920000.00),
(3, 2, 'VNU-SX-T', 'Venue SX Turbo', 3, 'iMT', 1150000.00),
(4, 3, 'VRN-SXO-T', 'Verna SX(O) Turbo', 3, 'DCT', 1740000.00),
(5, 4, 'I20-ASTA', 'i20 Asta', 1, 'Manual', 950000.00),
(6, 6, 'IONQ5-RWD', 'Ioniq 5 Long Range', 4, 'Automatic', 4500000.00),
(7, 7, 'EXT-SX-O', 'Exter SX Connect', 5, 'Manual', 850000.00),
(8, 8, 'ALC-SIGN-D', 'Alcazar Signature Diesel', 2, 'Automatic', 2050000.00);

-- ─────────────────────────────────────────────
--  2. STAFF (Role IDs: 2-Mgr, 3-Exec, 4-Advisor, 5-Mech)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO employees (id, employee_code, first_name, last_name, email, phone, password_hash, department_id, role_id, dealer_id) VALUES 
(2, 'EMP002', 'Priya', 'Sharma', 'priya.sharma@hyundaidms.in', '9876543102', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 2, 2, 1),
(3, 'EMP003', 'Rahul', 'Varma', 'rahul.v@hyundaidms.in', '9876543103', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 2, 3, 1),
(4, 'EMP004', 'Anita', 'Nair', 'anita.n@hyundaidms.in', '9876543104', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 2, 3, 1),
(11, 'EMP011', 'Siddharth', 'Malhotra', 'sid.m@hyundaidms.in', '9876543111', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 2, 3, 1),
(12, 'EMP012', 'Kavita', 'Krishnan', 'kavita.k@hyundaidms.in', '9876543112', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 2, 3, 1),
(5, 'EMP005', 'Vikram', 'Singh', 'vikram.s@hyundaidms.in', '9876543105', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 3, 4, 1),
(6, 'EMP006', 'Suresh', 'Kumar', 'suresh.k@hyundaidms.in', '9876543106', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 3, 5, 1),
(13, 'EMP013', 'Ganesh', 'Prasad', 'ganesh.p@hyundaidms.in', '9876543113', '$2a$10$uHYn5GiNxBxHgyp3hxNA9eqHc2Puhy6NniF.C/gWZgqjdnKlRjyLW', 3, 5, 1);

INSERT IGNORE INTO mechanics (employee_id, speciality) VALUES (6, 'Engine & Transmission'), (13, 'Body Shop & Paint');

-- ─────────────────────────────────────────────
--  3. INVENTORY (Extensive Stock)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO colors (id, name, hex_code) VALUES 
(1, 'Abyss Black', '#000000'), (2, 'Atlas White', '#FFFFFF'), (3, 'Fiery Red', '#FF0000'), 
(4, 'Starry Night', '#191970'), (5, 'Titan Grey', '#808080');

INSERT IGNORE INTO inventory_locations (id, name, address) VALUES (1, 'Main Showroom Yard', 'Anna Salai, Chennai');

INSERT IGNORE INTO vehicles (id, vin, engine_number, chassis_number, variant_id, color_id, location_id, status, dealer_cost) VALUES 
(1, 'VIN26H001', 'ENG101', 'CHS101', 1, 1, 1, 'SOLD', 1450000.00),
(2, 'VIN26H002', 'ENG102', 'CHS102', 2, 2, 1, 'SOLD', 1720000.00),
(3, 'VIN26H003', 'ENG103', 'CHS103', 3, 3, 1, 'ALLOCATED', 1050000.00),
(4, 'VIN26H004', 'ENG104', 'CHS104', 4, 1, 1, 'SOLD', 1540000.00),
(5, 'VIN26H005', 'ENG105', 'CHS105', 6, 2, 1, 'ALLOCATED', 4100000.00),
(6, 'VIN26H006', 'ENG106', 'CHS106', 7, 3, 1, 'IN_STOCK', 780000.00),
(7, 'VIN26H007', 'ENG107', 'CHS107', 8, 4, 1, 'IN_STOCK', 1850000.00),
(8, 'VIN26H008', 'ENG108', 'CHS108', 1, 2, 1, 'IN_STOCK', 1450000.00),
(9, 'VIN26H009', 'ENG109', 'CHS109', 2, 5, 1, 'IN_STOCK', 1720000.00),
(10, 'VIN26H010', 'ENG110', 'CHS110', 3, 1, 1, 'IN_STOCK', 1050000.00),
(11, 'VIN26H011', 'ENG111', 'CHS111', 4, 2, 1, 'IN_STOCK', 1540000.00),
(12, 'VIN26H012', 'ENG112', 'CHS112', 5, 3, 1, 'IN_STOCK', 850000.00),
(13, 'VIN26H013', 'ENG113', 'CHS113', 1, 4, 1, 'IN_STOCK', 1450000.00),
(14, 'VIN26H014', 'ENG114', 'CHS114', 2, 1, 1, 'IN_STOCK', 1720000.00),
(15, 'VIN26H015', 'ENG115', 'CHS115', 7, 2, 1, 'IN_STOCK', 780000.00);

-- ─────────────────────────────────────────────
--  4. CUSTOMERS & LEADS (Multi-Month Dashboard Funnel)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO customers (id, customer_code, first_name, last_name, email, phone, dealer_id) VALUES 
(1, 'C101', 'Arjun', 'Reddy', 'arjun@gmail.com', '9900110001', 1),
(2, 'C102', 'Saritha', 'Mehta', 'saritha@outlook.com', '9900110002', 1),
(3, 'C103', 'Karthik', 'N', 'karthik@gmail.com', '9900110003', 1),
(4, 'C104', 'Sneha', 'Gupta', 'sneha@yahoo.com', '9900110004', 1),
(5, 'C105', 'Vijay', 'M', 'vijay@gmail.com', '9900110005', 1),
(6, 'C106', 'Anjali', 'K', 'anjali@outlook.com', '9900110006', 1),
(7, 'C107', 'Rohan', 'B', 'rohan@gmail.com', '9900110007', 1),
(8, 'C108', 'Pooja', 'L', 'pooja@gmail.com', '9900110008', 1),
(9, 'C109', 'Sanjay', 'V', 'sanjay@yahoo.com', '9900110009', 1),
(10, 'C110', 'Deepika', 'P', 'deepika@gmail.com', '9900110010', 1),
(11, 'C111', 'Manoj', 'T', 'manoj@outlook.com', '9900110011', 1),
(12, 'C112', 'Bhavana', 'S', 'bhavana@gmail.com', '9900110012', 1),
(13, 'C113', 'Gautam', 'K', 'gautam@gmail.com', '9900110013', 1),
(14, 'C114', 'Harini', 'R', 'harini@yahoo.com', '9900110014', 1),
(15, 'C115', 'Nithin', 'D', 'nithin@gmail.com', '9900110015', 1),
(16, 'C116', 'Pavithra', 'W', 'pavithra@gmail.com', '9900110016', 1),
(17, 'C117', 'Rajesh', 'H', 'rajesh@outlook.com', '9900110017', 1),
(18, 'C118', 'Shruti', 'J', 'shruti@gmail.com', '9900110018', 1),
(19, 'C119', 'Zoya', ' Khan', 'zoya@gmail.com', '9900110019', 1),
(20, 'C120', 'Varun', 'Y', 'varun@yahoo.com', '9900110020', 1);

-- Leads Spread across Q1 2026
INSERT IGNORE INTO lead_sources (id, name) VALUES (1, 'Showroom Walk-in'), (2, 'Website'), (4, 'Social Media');

INSERT IGNORE INTO leads (id, lead_number, customer_id, source_id, assigned_to, dealer_id, status, created_at) VALUES 
(1, 'L26-001', 1, 1, 3, 1, 'DELIVERED', '2026-01-05'), (2, 'L26-002', 2, 1, 3, 1, 'DELIVERED', '2026-01-12'),
(3, 'L26-003', 3, 2, 4, 1, 'BOOKED', '2026-01-20'), (4, 'L26-004', 4, 4, 11, 1, 'DELIVERED', '2026-01-28'),
(5, 'L26-005', 5, 1, 12, 1, 'BOOKED', '2026-02-02'), (6, 'L26-006', 6, 2, 3, 1, 'DELIVERED', '2026-02-10'),
(7, 'L26-007', 7, 4, 4, 1, 'BOOKED', '2026-02-18'), (8, 'L26-008', 8, 1, 11, 1, 'NEGOTIATION', '2026-02-25'),
(9, 'L26-009', 9, 2, 12, 1, 'TEST_DRIVE', '2026-03-01'), (10, 'L26-010', 10, 4, 3, 1, 'BOOKED', '2026-03-05'),
(11, 'L26-011', 11, 1, 4, 1, 'CONTACTED', '2026-03-10'), (12, 'L26-012', 12, 2, 11, 1, 'NEW', '2026-03-12'),
(13, 'L26-013', 13, 1, 12, 1, 'NEGOTIATION', '2026-03-15'), (14, 'L26-014', 14, 4, 3, 1, 'TEST_DRIVE', '2026-03-18'),
(15, 'L26-015', 15, 2, 4, 1, 'NEW', '2026-03-20'), (16, 'L26-016', 16, 1, 11, 1, 'NEW', '2026-03-22'),
(17, 'L26-017', 17, 4, 12, 1, 'NEW', '2026-03-24'), (18, 'L26-018', 18, 1, 3, 1, 'NEW', '2026-03-26'),
(19, 'L26-019', 19, 2, 4, 1, 'NEW', '2026-03-27'), (20, 'L26-020', 20, 1, 11, 1, 'NEW', '2026-03-28');

-- ─────────────────────────────────────────────
--  5. BOOKINGS (High Volume Sales Visualization)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO bookings (id, booking_number, lead_id, customer_id, variant_id, color_id, sales_exec_id, dealer_id, total_on_road, status, vehicle_id, created_at) VALUES 
(1, 'BK26-001', 1, 1, 1, 1, 3, 1, 1850000.00, 'DELIVERED', 1, '2026-01-10'),
(2, 'BK26-002', 2, 2, 2, 2, 3, 1, 2150000.00, 'DELIVERED', 2, '2026-01-20'),
(3, 'BK26-003', 3, 3, 3, 3, 4, 1, 1280000.00, 'ALLOCATED', 3, '2026-01-28'),
(4, 'BK26-004', 4, 4, 4, 1, 11, 1, 1980000.00, 'DELIVERED', 4, '2026-02-05'),
(5, 'BK26-005', 5, 5, 6, 2, 12, 1, 4750000.00, 'ALLOCATED', 5, '2026-02-15'),
(6, 'BK26-006', 6, 6, 7, 3, 3, 1, 980000.00, 'DELIVERED', 6, '2026-02-25'),
(7, 'BK26-007', 7, 7, 8, 4, 4, 1, 2350000.00, 'BOOKED', NULL, '2026-03-05'),
(8, 'BK26-010', 10, 10, 1, 2, 3, 1, 1850000.00, 'BOOKED', NULL, '2026-03-15');

-- ─────────────────────────────────────────────
--  6. SERVICE (Workshop Busy State)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO service_appointments (id, appointment_no, customer_id, vehicle_reg_no, dealer_id, appointed_by, appointment_date, service_type, status) VALUES 
(1, 'SA2026-001', 1, 'TN-01-AX-1011', 1, 5, '2026-03-28 09:00:00', 'PERIODIC', 'IN_PROGRESS'),
(2, 'SA2026-002', 2, 'TN-01-BY-2022', 1, 5, '2026-03-28 11:00:00', 'REPAIR', 'SCHEDULED'),
(3, 'SA2026-003', 4, 'TN-01-CZ-3033', 1, 5, '2026-03-28 14:00:00', 'PERIODIC', 'SCHEDULED');

INSERT IGNORE INTO job_cards (id, job_card_no, appointment_id, mechanic_id, status, created_at) VALUES 
(1, 'JC26-001', 1, 6, 'IN_PROGRESS', '2026-03-28 09:30');

SET FOREIGN_KEY_CHECKS = 1;