# Hyundai Dealer Management System (DMS)

> Production-grade, full-stack enterprise application for a Hyundai dealership.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Frontend | Angular 17, Angular Material, Chart.js |
| Backend | Spring Boot 3.2, Spring Security + JWT |
| Database | MySQL 8.x |
| ORM | Spring Data JPA (Hibernate) |
| Build | Maven (backend), npm / Angular CLI (frontend) |

---

## Quick Start

### 1. Database Setup (MySQL Workbench)
```sql
-- Run in order:
source database/schema.sql
source database/sample_data.sql
```

### 2. Backend
```bash
cd backend

# Edit application.properties – update MySQL password
# spring.datasource.password=your_password

./mvnw spring-boot:run
# API available at: http://localhost:8080/api/v1
```

### 3. Frontend
```bash
cd frontend
npm install
npm start
# App available at: http://localhost:4200
```

### 4. Default Login Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@hyundaidms.in | Password@123 |
| Sales Manager | sm@hyundaidms.in | Password@123 |
| Sales Executive | deepika@hyundaidms.in | Password@123 |
| Service Advisor | preethi@hyundaidms.in | Password@123 |
| Mechanic | murugan@hyundaidms.in | Password@123 |
| Inventory Manager | lakshmi@hyundaidms.in | Password@123 |
| Accounts | vijay@hyundaidms.in | Password@123 |

---

## Project Structure

```
Hyundai-DMS/
├── database/
│   ├── schema.sql        ← Full normalized MySQL schema (~30 tables)
│   ├── sample_data.sql   ← Realistic seed data
│   └── queries.sql       ← 11 named analytical SQL queries
│
├── backend/              ← Spring Boot 3.2 application
│   ├── pom.xml
│   └── src/main/java/com/hyundai/dms/
│       ├── config/       ← SecurityConfig, CorsConfig
│       ├── security/     ← JwtTokenProvider, JwtAuthFilter, UserDetailsServiceImpl
│       ├── entity/       ← JPA entities (20+ classes)
│       ├── repository/   ← Spring Data JPA repositories
│       ├── dto/          ← Request/Response DTOs
│       ├── service/impl/ ← Business logic (AuthService, EmployeeService, VehicleService…)
│       ├── controller/   ← REST controllers (Auth, Employee, Vehicle, Customer, Lead,
│       │                    Service, Report, Lookup)
│       └── exception/    ← GlobalExceptionHandler, ResourceNotFoundException
│
└── frontend/             ← Angular 17 application
    └── src/app/
        ├── core/
        │   ├── models/       ← TypeScript interfaces
        │   ├── services/     ← AuthService, ApiService (typed http calls)
        │   ├── interceptors/ ← JwtInterceptor
        │   └── guards/       ← AuthGuard, RoleGuard
        ├── shared/
        │   └── components/   ← Sidebar (role-filtered nav), Header
        └── features/
            ├── auth/         ← Premium split-panel login
            ├── dashboard/    ← KPI cards + 4 live charts
            ├── employees/    ← CRUD with department/role API dropdowns
            ├── inventory/    ← CRUD with status/model filters, color swatches
            ├── customers/    ← CRUD with debounced search, type badge
            ├── leads/        ← CRUD with cascading model→variant dropdowns
            ├── service/      ← Appointment list with status filter
            ├── reports/      ← 4 Chart.js charts + tabular summary
            └── sales/parts/finance/ ← Stubs ready for extension
```

---

## Key REST API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/auth/login` | Login, returns JWT |
| GET | `/employees?search=&page=&size=` | Paginated employee list |
| GET/POST/PUT/DELETE | `/vehicles` | Vehicle CRUD |
| GET/POST/PUT/DELETE | `/customers` | Customer CRUD |
| GET/POST/PUT/DELETE | `/leads` | Lead CRUD |
| GET | `/leads/funnel-summary` | Lead pipeline counts |
| GET/POST | `/service/appointments` | Service center |
| GET | `/lookup/vehicle-models` | Dropdown: models |
| GET | `/lookup/vehicle-variants/{modelId}` | Dropdown: variants by model |
| GET | `/lookup/colors` | Dropdown: colors |
| GET | `/lookup/lead-sources` | Dropdown: lead sources |
| GET | `/lookup/banks` | Dropdown: banks |
| GET | `/reports/monthly-bookings` | Monthly revenue chart |
| GET | `/reports/top-selling-models` | Top models chart |
| GET | `/reports/sales-pipeline` | Pipeline funnel |
| GET | `/reports/inventory-status` | Inventory status chart |

---

## Role-Based Access Control

| Role | Access |
|------|--------|
| ADMIN | Everything |
| SALES_MANAGER | Employees, Vehicles, Customers, Leads, Bookings, Reports |
| SALES_EXECUTIVE | Vehicles, Customers, Leads |
| SERVICE_ADVISOR | Service appointments, Job cards |
| MECHANIC | Service (limited) |
| INVENTORY_MANAGER | Vehicles, Parts |
| ACCOUNTS | Invoices, Payments |

---

## Data Flow

```
Customer Enquiry → Lead Created → Test Drive → Booking → Payment → Vehicle Allocated → Invoice → Delivery

Service: Appointment → Job Card → Mechanic Assigned → Parts Used → Service Completed → Invoice
```

---

## Extending the System

The **Sales, Parts, and Finance** modules are scaffolded as stubs. To add full CRUD to any stub:

1. Add a list + form component (follow `InventoryModule` pattern)
2. All `ApiService` methods are already available
3. Add route to the module's `RouterModule.forChild()`

That's it – the backend APIs, JWT auth, interceptors, and guards are all in place.