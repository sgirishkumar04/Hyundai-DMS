// ── Core TypeScript models matching backend entities ──────────

export interface Role { id: number; name: string; description: string; }
export interface Department { id: number; name: string; description: string; }

export interface Employee {
  id: number; employeeCode: string; firstName: string; lastName: string;
  email: string; phone: string;
  department: Department; role: Role;
  manager?: Employee; dateOfJoin: string; isActive: boolean;
}

export interface VehicleModel { id: number; modelCode: string; modelName: string; segment: string; isActive: boolean; }
export interface VehicleVariant {
  id: number; model: VehicleModel; variantCode: string; variantName: string;
  engineType: EngineType; transmission: string; exShowroomPrice: number; isActive: boolean;
}
export interface EngineType { id: number; name: string; fuelCategory: string; }
export interface Color { id: number; name: string; hexCode: string; }
export interface InventoryLocation { id: number; name: string; address: string; }
export interface Vehicle {
  id: number; vin: string; variant: VehicleVariant; color: Color;
  location: InventoryLocation; mfgYear: number; status: string;
  invoiceDate: string; dealerCost: number;
}

export interface Customer {
  id: number; customerCode: string; firstName: string; lastName: string;
  email: string; phone: string; alternatePhone: string;
  gender: string; customerType: string; companyName: string;
}

export interface LeadSource { id: number; name: string; }
export interface Lead {
  id: number; leadNumber: string; customer: Customer; source: LeadSource;
  assignedTo: Employee; preferredModel?: VehicleModel; preferredVariant?: VehicleVariant;
  preferredColor?: Color; status: string; remarks: string; expectedCloseDate: string;
  createdAt: string;
}

export interface Booking {
  id: number; bookingNumber: string; customer: Customer; variant: VehicleVariant;
  color: Color; salesExec: Employee; exShowroom: number; discount: number;
  totalOnRoad: number; status: string; expectedDelivery: string;
}

export interface ServiceAppointment {
  id: number; appointmentNo: string; customer: Customer;
  vehicleRegNo: string; appointedBy: Employee;
  appointmentDate: string; serviceType: string; status: string; remarks: string;
}

export interface SparePart {
  id: number; partNumber: string; name: string; category: string;
  unit: string; unitPrice: number; gstRate: number; supplier: Supplier;
  isActive: boolean;
}
export interface Supplier { id: number; name: string; phone: string; email: string; }
export interface Bank { id: number; name: string; }

export interface FinanceLoan {
  id: number; loanNumber: string; customer: Customer; bank: Bank;
  loanAmount: number; tenureMonths: number; interestRate: number;
  emiAmount: number; status: string;
}

export interface AuthResponse { token: string; email: string; role: string; fullName: string; employeeId: number; dealerId?: number; isSuperAdmin?: boolean; permissions?: string[]; }

export interface Page<T> {
  content: T[];
  totalElements: number; totalPages: number;
  size: number; number: number;
}
