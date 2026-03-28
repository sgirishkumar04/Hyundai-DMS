-- ============================================================
--  HYUNDAI DMS – SQL QUERY REFERENCE GUIDE
--  Purpose: Comprehensive list of key queries used by the 
--           Java Backend (Spring Boot) for Hyundai DMS.
-- ============================================================

/*
   NOTE ON MULTI-TENANCY:
   Almost every query below includes 'dealer_id = ?'. 
   This is the security backbone of our system, ensuring that 
   Showroom A can NEVER see the data of Showroom B.
*/

-- ─────────────────────────────────────────────
--  MODULE 1: DASHBOARD & ANALYTICS
-- ─────────────────────────────────────────────

-- 1.1 Fetch Monthly Sales Trend
-- Used for the primary "Sales Growth" bar chart on the dashboard.
-- Input: Year, Dealer ID
CALL GetMonthlyBookings(2026, 1);

-- 1.2 Top Selling Models
-- Used for the "Popularity" pie chart to see which cars are moving fastest.
-- Input: Year, Month (optional), Dealer ID
CALL GetTopSellingModels(2026, 3, 1);

-- 1.3 Lead Conversion Funnel
-- Visualizes how many leads are in each stage (New -> Contacted -> Booked).
-- Input: Year, Month, Dealer ID
CALL GetLeadFunnelCounts(2026, 3, 1);

-- 1.4 Central Inventory Status
-- Quick summary of In Stock vs. Allocated vs. Sold vehicles.
CALL GetInventoryStatusSummary(2026, 3, 1);


-- ─────────────────────────────────────────────
--  MODULE 2: AUTHENTICATION & STAFF
-- ─────────────────────────────────────────────

-- 2.1 Employee Login
-- Finds a specific employee and their Role/Dealer details.
SELECT e.*, r.name as role_name 
FROM employees e 
JOIN roles r ON e.role_id = r.id 
WHERE e.email = 'admin@hyundaidms.in' AND e.is_active = 1;

-- 2.2 Generate Next Employee Code
-- Finds the last code (e.g., EMP045) to auto-generate EMP046.
SELECT MAX(employee_code) FROM employees WHERE dealer_id = 1;


-- ─────────────────────────────────────────────
--  MODULE 3: SALES PIPELINE (Leads & Bookings)
-- ─────────────────────────────────────────────

-- 3.1 Advanced Lead Search
-- Filters leads by customer name, status, or assigned executive.
SELECT l.*, c.first_name, c.last_name 
FROM leads l 
JOIN customers c ON l.customer_id = c.id 
WHERE l.dealer_id = 1 
  AND (c.first_name LIKE '%Arjun%' OR l.lead_number = 'L2026-001');

-- 3.2 Booking Search with Customer Details
-- Fetches booking data including total price calculations.
SELECT b.*, c.phone, vv.variant_name 
FROM bookings b 
JOIN customers c ON b.customer_id = c.id 
JOIN vehicle_variants vv ON b.variant_id = vv.id 
WHERE b.dealer_id = 1 AND b.status = 'BOOKED';


-- ─────────────────────────────────────────────
--  MODULE 4: INVENTORY MANAGEMENT
-- ─────────────────────────────────────────────

-- 4.1 Stock Availability Check
-- Finds actual cars matching a customer's specific preference.
SELECT v.* 
FROM vehicles v 
WHERE v.variant_id = 2 
  AND v.color_id = 1 
  AND v.status = 'IN_STOCK' 
  AND v.allocated_dealer_id = 1;

-- 4.2 Low Spare Part Alert
-- Finds parts that need reordering based on threshold.
SELECT sp.name, spi.quantity, spi.reorder_level 
FROM spare_parts sp 
JOIN spare_part_inventory spi ON sp.id = spi.part_id 
WHERE sp.dealer_id = 1 AND spi.quantity <= spi.reorder_level;


-- ─────────────────────────────────────────────
--  MODULE 5: SUPER ADMIN (Platform Level)
-- ─────────────────────────────────────────────

-- 5.1 List All Pending Showroom Registrations
-- Used by Super Admin to approve/decline new dealers.
SELECT * FROM dealer_registrations WHERE status = 'PENDING' ORDER BY created_at DESC;

-- 5.2 System Audit Trail
-- Tracks who changed what across the entire platform.
SELECT * FROM audit_logs ORDER BY created_at DESC LIMIT 100;

-- 5.3 Multi-Dealer Performance Overview
-- Compares sales across different cities.
SELECT d.city, COUNT(b.id) as sales_count 
FROM dealers d 
LEFT JOIN bookings b ON d.id = b.dealer_id 
GROUP BY d.city;
