import { Product } from './Product';

export interface QuotationTemplate {
  name: string;
  numberOfDays: string;
  mailTemplateId: boolean;
  clientName: string;
  projectName: string;
  projectManager: string;
  currency: {
    code: string;
    symbol: string;
  };
  products: Product[];
}
