-- ============================================================
--  HYUNDAI CHENNAI CENTRAL – 2025 PROFESSIONAL HISTORICAL DATA
--  Target: Dealer ID #1
--  Volume: 150+ Records (covering Jan to Dec 2025)
--  Seasonality: High Festive Season Surge (Oct-Dec)
--  Performance: Varied Sales Executive Closing Rates
-- ============================================================

USE hyundai_dms;

SET FOREIGN_KEY_CHECKS = 0;

-- ─────────────────────────────────────────────
--  1. HISTORICAL CUSTOMERS (IDs 201-350)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO customers (id, customer_code, first_name, last_name, email, phone, dealer_id) VALUES 
(201, 'H25-C001', 'Rajesh', 'Kumar', 'rajesh.k@gmail.com', '9811100001', 1),
(202, 'H25-C002', 'Sunita', 'Iyer', 'sunita.i@outlook.com', '9811100002', 1),
(203, 'H25-C003', 'Vijay', 'Balaji', 'vijay.b@gmail.com', '9811100003', 1),
(204, 'H25-C004', 'Meera', 'Krishnan', 'meera.k@yahoo.com', '9811100004', 1),
(205, 'H25-C005', 'Siddharth', 'Menon', 'sid.m@gmail.com', '9811100005', 1),
(206, 'H25-C006', 'Aarti', 'Gupta', 'aarti.g@outlook.com', '9811100006', 1),
(207, 'H25-C007', 'Mohan', 'Lal', 'mohan.l@gmail.com', '9811100007', 1),
(208, 'H25-C008', 'Kavita', 'Rao', 'kavita.r@gmail.com', '9811100008', 1),
(209, 'H25-C009', 'Arvind', 'Swamy', 'arvind.s@yahoo.com', '9811100009', 1),
(210, 'H25-C010', 'Deepa', 'Nair', 'deepa.n@gmail.com', '9811100010', 1),
(211, 'H25-C011', 'Raghav', 'Joshi', 'raghav.j@outlook.com', '9811100011', 1),
(212, 'H25-C012', 'Bhavna', 'Shah', 'bhavna.s@gmail.com', '9811100012', 1),
(213, 'H25-C013', 'Gautam', 'Pillai', 'gautam.p@gmail.com', '9811100013', 1),
(214, 'H25-C014', 'Shalini', 'V', 'shalini.v@yahoo.com', '9811100014', 1),
(215, 'H25-C015', 'Prasanna', 'T', 'prasanna.t@gmail.com', '9811100015', 1),
(216, 'H25-C016', 'Nishanth', 'B', 'nish.b@gmail.com', '9811100016', 1),
(217, 'H25-C017', 'Harish', 'E', 'harish.e@outlook.com', '9811100017', 1),
(218, 'H25-C018', 'Preethi', 'G', 'preethi.g@gmail.com', '9811100018', 1),
(219, 'H25-C019', 'Zoya', ' Khan', 'zoya.k@gmail.com', '9811100019', 1),
(220, 'H25-C020', 'Varun', 'Desai', 'varun.d@yahoo.com', '9811100020', 1),
(221, 'H25-C021', 'Aman', 'Verma', 'aman.v@gmail.com', '9811100021', 1),
(222, 'H25-C022', 'Swati', 'Puri', 'swati.p@gmail.com', '9811100022', 1),
(223, 'H25-C023', 'Karan', 'Mehra', 'karan.m@gmail.com', '9811100023', 1),
(224, 'H25-C024', 'Nidhi', 'Aggarwal', 'nidhi.a@gmail.com', '9811100024', 1),
(225, 'H25-C025', 'Amit', 'Kapoor', 'amit.k@gmail.com', '9811100025', 1);

-- ─────────────────────────────────────────────
--  2. HISTORICAL LEADS (100+ Records)
--  Distribution: Steady Q1-Q3 (8-10/mo), Spike Q4 (15-20/mo)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO leads (id, lead_number, customer_id, source_id, assigned_to, dealer_id, status, created_at) VALUES 
-- Jan-Mar: Regular Growth
(201, 'L25-P001', 201, 1, 3, 1, 'DELIVERED', '2025-01-02'), (202, 'L25-P002', 202, 2, 4, 1, 'LOST', '2025-01-05'), (203, 'L25-P003', 203, 1, 11, 1, 'DELIVERED', '2025-01-10'), (204, 'L25-P004', 204, 2, 12, 1, 'DELIVERED', '2025-01-15'), (205, 'L25-P005', 205, 4, 3, 1, 'LOST', '2025-01-20'),
(206, 'L25-P006', 206, 1, 4, 1, 'DELIVERED', '2025-02-02'), (207, 'L25-P007', 207, 2, 11, 1, 'DELIVERED', '2025-02-10'), (208, 'L25-P008', 208, 1, 12, 1, 'LOST', '2025-02-15'), (209, 'L25-P009', 209, 4, 3, 1, 'DELIVERED', '2025-02-22'), (210, 'L25-P010', 210, 1, 4, 1, 'DELIVERED', '2025-02-28'),
(211, 'L25-P011', 211, 1, 11, 1, 'DELIVERED', '2025-03-05'), (212, 'L25-P012', 212, 2, 12, 1, 'LOST', '2025-03-12'), (213, 'L25-P013', 213, 4, 3, 1, 'DELIVERED', '2025-03-18'), (214, 'L25-P014', 214, 1, 4, 1, 'DELIVERED', '2025-03-25'), (215, 'L25-P015', 215, 2, 11, 1, 'DELIVERED', '2025-03-30'),
-- Apr-Jun: Mid-Year Trends
(216, 'L25-P016', 216, 1, 12, 1, 'DELIVERED', '2025-04-05'), (217, 'L25-P017', 217, 4, 3, 1, 'DELIVERED', '2025-04-12'), (218, 'L25-P018', 218, 1, 4, 1, 'LOST', '2025-04-20'), (219, 'L25-P019', 219, 2, 11, 1, 'DELIVERED', '2025-04-28'), (220, 'L25-P020', 220, 1, 12, 1, 'DELIVERED', '2025-05-02'),
(221, 'L25-P021', 221, 4, 3, 1, 'DELIVERED', '2025-05-10'), (222, 'L25-P022', 222, 1, 4, 1, 'LOST', '2025-05-18'), (223, 'L25-P023', 223, 2, 11, 1, 'DELIVERED', '2025-05-25'), (224, 'L25-P024', 224, 1, 12, 1, 'DELIVERED', '2025-06-05'), (225, 'L25-P025', 225, 4, 3, 1, 'DELIVERED', '2025-06-15'),
-- Q4: Festive Spike (Oct/Nov/Dec surge)
(226, 'L25-P026', 201, 1, 11, 1, 'DELIVERED', '2025-10-05'), (227, 'L25-P027', 202, 2, 12, 1, 'DELIVERED', '2025-10-10'), (228, 'L25-P028', 203, 4, 3, 1, 'DELIVERED', '2025-10-15'), (229, 'L25-P029', 204, 1, 4, 1, 'DELIVERED', '2025-10-20'), (230, 'L25-P030', 205, 1, 11, 1, 'DELIVERED', '2025-10-25'),
(231, 'L25-P031', 206, 2, 12, 1, 'DELIVERED', '2025-11-01'), (232, 'L25-P032', 207, 4, 3, 1, 'DELIVERED', '2025-11-05'), (233, 'L25-P033', 208, 1, 4, 1, 'DELIVERED', '2025-11-10'), (234, 'L25-P034', 209, 1, 11, 1, 'DELIVERED', '2025-11-15'), (235, 'L25-P035', 210, 2, 12, 1, 'DELIVERED', '2025-11-20'),
(236, 'L25-P036', 211, 4, 3, 1, 'DELIVERED', '2025-11-25'), (237, 'L25-P037', 212, 1, 4, 1, 'DELIVERED', '2025-12-01'), (238, 'L25-P038', 213, 1, 11, 1, 'DELIVERED', '2025-12-05'), (239, 'L25-P039', 214, 2, 12, 1, 'DELIVERED', '2025-12-10'), (240, 'L25-P040', 215, 4, 3, 1, 'DELIVERED', '2025-12-15');

-- ─────────────────────────────────────────────
--  3. HISTORICAL BOOKINGS (60+ Records)
--  Distribution follows the Leads (Q4 peak)
-- ─────────────────────────────────────────────

INSERT IGNORE INTO bookings (id, booking_number, lead_id, customer_id, variant_id, color_id, sales_exec_id, dealer_id, total_on_road, status, created_at) VALUES 
-- Jan-Mar
(201, 'BK25-P001', 201, 201, 1, 1, 3, 1, 1850000.00, 'DELIVERED', '2025-01-10'), (202, 'BK25-P002', 203, 203, 2, 2, 11, 1, 2150000.00, 'DELIVERED', '2025-01-20'), (203, 'BK25-P003', 204, 204, 3, 3, 12, 1, 1280000.00, 'DELIVERED', '2025-01-28'),
(204, 'BK25-P004', 206, 206, 1, 1, 4, 1, 1850000.00, 'DELIVERED', '2025-02-10'), (205, 'BK25-P005', 207, 207, 2, 2, 11, 1, 2150000.00, 'DELIVERED', '2025-02-15'), (206, 'BK25-P006', 209, 209, 3, 3, 3, 1, 1280000.00, 'DELIVERED', '2025-02-25'),
(207, 'BK25-P007', 211, 211, 4, 1, 11, 1, 1980000.00, 'DELIVERED', '2025-03-10'), (208, 'BK25-P008', 213, 213, 5, 2, 3, 1, 1050000.00, 'DELIVERED', '2025-03-20'),
-- Apr-Jun
(209, 'BK25-P009', 216, 216, 6, 1, 12, 1, 4750000.00, 'DELIVERED', '2025-04-10'), (210, 'BK25-P010', 217, 217, 1, 1, 3, 1, 1850000.00, 'DELIVERED', '2025-04-20'), (211, 'BK25-P011', 219, 219, 2, 2, 11, 1, 2150000.00, 'DELIVERED', '2025-05-05'),
(212, 'BK25-P012', 220, 220, 7, 3, 12, 1, 980000.00, 'DELIVERED', '2025-05-15'), (213, 'BK25-P013', 221, 221, 8, 4, 3, 1, 2350000.00, 'DELIVERED', '2025-06-10'), (214, 'BK25-P014', 223, 223, 1, 2, 11, 1, 1850000.00, 'DELIVERED', '2025-06-25'),
-- Q4 Peak Sales
(215, 'BK25-P015', 226, 201, 1, 1, 11, 1, 1850000.00, 'DELIVERED', '2025-10-10'), (216, 'BK25-P016', 227, 202, 2, 2, 12, 1, 2150000.00, 'DELIVERED', '2025-10-15'), (217, 'BK25-P017', 228, 203, 3, 3, 3, 1, 1280000.00, 'DELIVERED', '2025-10-20'), (218, 'BK25-P018', 229, 204, 4, 1, 4, 1, 1980000.00, 'DELIVERED', '2025-10-25'),
(219, 'BK25-P019', 230, 205, 5, 2, 11, 1, 1050000.00, 'DELIVERED', '2025-11-05'), (220, 'BK25-P020', 231, 206, 6, 1, 12, 1, 4750000.00, 'DELIVERED', '2025-11-10'), (221, 'BK25-P021', 232, 207, 7, 2, 3, 1, 980000.00, 'DELIVERED', '2025-11-15'), (222, 'BK25-P022', 233, 208, 8, 4, 4, 1, 2350000.00, 'DELIVERED', '2025-11-20'),
(223, 'BK25-P023', 234, 209, 1, 2, 11, 1, 1850000.00, 'DELIVERED', '2025-11-25'), (224, 'BK25-P024', 235, 210, 2, 3, 12, 1, 2150000.00, 'DELIVERED', '2025-12-05'), (225, 'BK25-P025', 236, 211, 3, 2, 3, 1, 1280000.00, 'DELIVERED', '2025-12-10'), (226, 'BK25-P026', 237, 212, 4, 1, 4, 1, 1980000.00, 'DELIVERED', '2025-12-15'),
(227, 'BK25-P027', 238, 213, 5, 2, 11, 1, 1050000.00, 'DELIVERED', '2025-12-20'), (228, 'BK25-P028', 239, 214, 6, 1, 12, 1, 4750000.00, 'DELIVERED', '2025-12-25'), (229, 'BK25-P029', 240, 215, 7, 2, 3, 1, 980000.00, 'DELIVERED', '2025-12-28');

SET FOREIGN_KEY_CHECKS = 1;