import { Product } from './Product';
import { Customer } from './Quotation';

export interface Invoice {
  customer: Customer;
  saleOrderTemplate: string;
  invoicePeriod: string;
  invoiceDate: string;
  salesDate: string;
  pricelist: string;
  paymentTerm: string;
  currency: {
    code: string;
    symbol: string;
  };
  journal: string;
  name: string;
  numberOfDays: string;
  mailTemplateId: boolean;
  clientName: string;
  projectName: string;
  projectManager: string;
  products: Product[];
}