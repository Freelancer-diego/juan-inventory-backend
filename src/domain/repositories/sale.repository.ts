import { Sale } from '../entities/sale.entity';

export interface SaleRepository {
  save(sale: Sale): Promise<void>;
  findById(id: string): Promise<Sale | null>;
  findAll(): Promise<Sale[]>;
  update(sale: Sale): Promise<void>;
}
