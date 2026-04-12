import { SaleRepository } from '../../domain/repositories/sale.repository';

export class GetAllSales {
  constructor(private readonly saleRepository: SaleRepository) {}

  async execute() {
    return this.saleRepository.findAll();
  }
}
