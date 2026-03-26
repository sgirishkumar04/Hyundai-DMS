-- Suppliers
INSERT INTO suppliers (name, contact_name, phone, email, address, gst_number, created_at) VALUES
('Genuine Hyundai Spares', 'Anil Kumar', '9845012345', 'sales@hyundaispares.com', 'Chennai, Tamil Nadu', '33AAACH1234A1Z1', NOW()),
('Metro Auto Parts', 'Suresh Raina', '9845012346', 'info@metroautos.com', 'Bangalore, Karnataka', '29BBBCI5678B1Z2', NOW()),
('Bosch Automotive India', 'Meera Nair', '9845012347', 'support@bosch-ind.com', 'Pune, Maharashtra', '27CCCDJ9012C1Z3', NOW()),
('Castrol Lubricants', 'Rajesh Gupta', '9845012348', 'orders@castrol.in', 'Mumbai, Maharashtra', '27DDDKK3456D1Z4', NOW());

-- Spare Parts
INSERT INTO spare_parts (part_number, name, category, unit, unit_price, gst_rate, supplier_id, is_active, created_at) VALUES
('P-BRK-PAD-02', 'Brake Pads (Front)', 'Brakes', 'Set', 1850.00, 18.00, 1, 1, NOW()),
('P-BRK-DSK-01', 'Brake Disk (Front)', 'Brakes', 'Piece', 3200.00, 18.00, 1, 1, NOW()),
('P-OIL-FLT-01', 'Oil Filter', 'Engine', 'Piece', 450.00, 12.00, 1, 1, NOW()),
('P-AIR-FLT-03', 'Air Filter (Standard)', 'Engine', 'Piece', 650.00, 12.00, 1, 1, NOW()),
('P-CLNT-03', 'Coolant (5L)', 'Consumables', 'Can', 850.00, 18.00, 2, 1, NOW()),
('P-ENG-OIL-5W30', 'Engine Oil (5W30) - 4L', 'Consumables', 'Can', 2100.00, 18.00, 4, 1, NOW()),
('P-SPK-PLG-04', 'Spark Plug (Iridium)', 'Engine', 'Piece', 580.00, 18.00, 3, 1, NOW()),
('P-WPR-05', 'Wiper Blades (Pair)', 'Accessories', 'Set', 950.00, 12.00, 2, 1, NOW()),
('P-BAT-60AH', 'Battery (60AH)', 'Electrical', 'Piece', 6500.00, 28.00, 3, 1, NOW()),
('P-HED-LMP-LH', 'Headlight Assembly (Left)', 'Body', 'Piece', 8500.00, 28.00, 1, 1, NOW()),
('P-TAI-LMP-RH', 'Tail Light Assembly (Right)', 'Body', 'Piece', 4200.00, 28.00, 1, 1, NOW()),
('P-AC-FLT-01', 'AC Cabin Filter', 'Consumables', 'Piece', 750.00, 18.00, 2, 1, NOW()),
('P-BEL-DRV-02', 'Drive Belt', 'Engine', 'Piece', 1250.00, 18.00, 3, 1, NOW()),
('P-FUS-KIT-10', 'Fuse Kit (Assorted)', 'Electrical', 'Kit', 350.00, 12.00, 2, 1, NOW()),
('P-CLU-PLY-01', 'Clutch Plate Assembly', 'Transmission', 'Set', 12400.00, 18.00, 1, 1, NOW());
