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

### 1. Database Setup (Choose ONE path)

#### Path A: Full Migration (Recommended for your new laptop)
Use this if you want everything exactly as it is now (Schema + All 2025/2026 Data + Stored Procedures).
```sql
source database/hyundai_dms_full_migration.sql
```

#### Path B: Fresh Development Start
Use this for a clean setup with basic sample records.
```sql
source database/schema.sql
source database/sample_data.sql
```

#### Optional: Additional History
If you chose Path B and want to add the extra realistic data manually:
- `source database/2025_historical_data.sql` (184 sales for 2025 reports)
- `source database/realistic_2026_data.sql` (Detailed 2026 sales overhaul)

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

## Windows Setup Guide (Step-by-Step)

If you are setting this up on a Windows machine, follow these precise steps:

### 1. Install Prerequisites
- **Git**: Download and install [Git for Windows](https://git-scm.com/download/win).
- **Java 17**: Install [OpenJDK 17](https://adoptium.net/temurin/releases/?version=17) (MSI installer is easiest). Ensure `JAVA_HOME` is set in Environment Variables.
- **MySQL**: Install [MySQL Community Server 8.0](https://dev.mysql.com/downloads/installer/). During setup, remember your **root password**.
- **Node.js**: Install the latest [LTS version (v18 or v20)](https://nodejs.org/).

### 2. Prepare Database
1. Open **MySQL Workbench**.
2. Connect to your local instance.
3. Open `database/schema.sql` and click the **Lightning Bolt** (Execute) icon.
4. Open `database/sample_data.sql` and execute it to populate the data.

### 3. Configure & Run Backend
1. Open a terminal (PowerShell or Command Prompt) in the `backend` folder.
2. Open `src/main/resources/application.properties`.
3. Update `spring.datasource.password` with the password you set during MySQL installation.
4. Run the application:
   ```cmd
   mvnw.cmd spring-boot:run
   ```
   *(The app is ready when you see "Started DmsApplication" in the logs)*

### 4. Run Frontend
1. Open a **new** terminal in the `frontend` folder.
2. Install dependencies:
   ```cmd
   npm install
   ```
3. Start the dev server:
   ```cmd
   npm start
   ```
4. Open your browser to `http://localhost:4200`.

---

## Extending the System

The **Sales, Parts, and Finance** modules are scaffolded as stubs. To add full CRUD to any stub:

1. Add a list + form component (follow `InventoryModule` pattern)
2. All `ApiService` methods are already available
3. Add route to the module's `RouterModule.forChild()`

That's it – the backend APIs, JWT auth, interceptors, and guards are all in place.