import { Sale, SaleStatus, SaleItem } from '../../domain/entities/sale.entity';
import { SaleRepository } from '../../domain/repositories/sale.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { SaleItemDto } from '../dto/create-sale.dto';
import { 
  EmptySaleError, 
  InvalidQuantityError, 
  ProductNotFoundError 
} from '../../domain/errors/domain-errors';

export class CreateSale {
  constructor(
    private readonly saleRepository: SaleRepository,
    private readonly productRepository: ProductRepository,
  ) {}

  async execute(id: string, items: SaleItemDto[], customerName: string, customerPhone: string, saleCode: string = '', orderSummary: string = ''): Promise<void> {
    if (!items || items.length === 0) {
      throw new EmptySaleError();
    }

    const saleItems: SaleItem[] = [];
    let total = 0;

    for (const item of items) {
      if (item.quantity <= 0) {
        throw new InvalidQuantityError(item.productId, item.quantity);
      }

      const product = await this.productRepository.findById(item.productId);
      if (!product) {
        throw new ProductNotFoundError(item.productId);
      }

      const subtotal = product.price * item.quantity;
      total += subtotal;

      saleItems.push({
        productId: item.productId,
        quantity: item.quantity,
        unitPrice: product.price, // Freeze price
        subtotal: subtotal,
      });
    }

    const sale = new Sale(id, saleItems, total, SaleStatus.PENDIENTE, customerName, customerPhone, saleCode, orderSummary);
    await this.saleRepository.save(sale);
  }
}
