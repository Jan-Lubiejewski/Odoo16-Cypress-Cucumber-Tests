export interface Quotation {
    customer: Customer;
    saleOrderTemplate: string;
    invoicePeriod: string;
    pricelist: string;
    paymentTerm: string;
    currency: {
      code: string;
      symbol: string;
    };
    journal: string;
    salesperson: string;
    availabilityData: UserAvailability[];
  }
  
  export interface Customer {
    name: string;
    address: Addres;
  }
  
  export interface Addres {
    street: string;
    city: string;
    zip: string;
  }
  
  export interface RoleData {
    isOvertime: boolean;
    unitPrice: number;
    quantity: number;
    baseOvertimeRate?: number;
    subTotal: string;
    role: string;
  }
  
  export interface UserAvailability {
    name: string;
    expectedAvailability: string;
    netPrice: string;
  }