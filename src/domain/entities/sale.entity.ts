export enum SaleStatus {
  PENDIENTE = 'PENDIENTE',
  VALIDADA = 'VALIDADA',
  CANCELADA = 'CANCELADA',
}

export interface SaleItem {
  productId: string;
  quantity: number;
  unitPrice: number;
  subtotal: number;
}

export class Sale {
  constructor(
    public readonly id: string,
    public items: SaleItem[],
    public total: number,
    public status: SaleStatus,
    public customerName: string,
    public customerPhone: string,
    public saleCode: string = '',
    public orderSummary: string = '',
    public readonly createdAt?: Date,
  ) {}
}
