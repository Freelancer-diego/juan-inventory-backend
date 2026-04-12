import { SaleStatus } from '../../domain/entities/sale.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { SaleRepository } from '../../domain/repositories/sale.repository';
import { 
  SaleNotFoundError, 
  InvalidSaleStateError, 
  ProductNotFoundError, 
  InsufficientStockError 
} from '../../domain/errors/domain-errors';

export class ValidateSale {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(saleId: string): Promise<void> {
    // 1. Fetch sale
    const sale = await this.saleRepository.findById(saleId);
    if (!sale) {
      throw new SaleNotFoundError(saleId);
    }

    // 2. Validate status
    if (sale.status !== SaleStatus.PENDIENTE) {
      throw new InvalidSaleStateError(sale.status);
    }

    // 3. Verify products and stock availability (Read-only check first)
    // We need to fetch all products first to ensure they exist and have stock
    // Check for EACH item independently to fail fast or gather all products.
    // To ensure atomicity (logically), we shouldn't modify anything until we know EVERYTHING is valid.
    
    // Strategy: Load all involved products into a map or list to avoid re-fetching
    const productUpdates: { product: any; quantityToDeduct: number }[] = [];

    for (const item of sale.items) {
      const product = await this.productRepository.findById(item.productId);
      
      if (!product) {
        throw new ProductNotFoundError(item.productId);
      }

      if (product.stock < item.quantity) {
        throw new InsufficientStockError(product.id, item.quantity, product.stock);
      }

      productUpdates.push({ product, quantityToDeduct: item.quantity });
    }

    // 4. Apply changes (Deduct stock and update status)
    // If we are here, everything is valid.
    
    // Deduct stock
    for (const update of productUpdates) {
      update.product.stock -= update.quantityToDeduct;
      await this.productRepository.update(update.product);
    }

    // Update sale status
    sale.status = SaleStatus.VALIDADA;
    await this.saleRepository.update(sale);
  }
}
