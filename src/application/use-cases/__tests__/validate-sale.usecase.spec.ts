import { ValidateSale } from '../validate-sale.usecase';
import { Product } from '../../../domain/entities/product.entity';
import { Sale, SaleStatus } from '../../../domain/entities/sale.entity';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { SaleRepository } from '../../../domain/repositories/sale.repository';
import {
  InvalidSaleStateError,
  ProductNotFoundError,
  SaleNotFoundError,
  InsufficientStockError,
} from '../../../domain/errors/domain-errors';

// --- Fakes (In-Memory Repositories) ---

class InMemoryProductRepository implements ProductRepository {
  public products: Map<string, Product> = new Map();

  async save(product: Product): Promise<void> {
    this.products.set(product.id, product);
  }

  async findById(id: string): Promise<Product | null> {
    const product = this.products.get(id);
    return product ? new Product(product.id, product.name, product.price, product.stock, '', 'cat-test') : null;
  }

  async findAll(): Promise<Product[]> {
    return Array.from(this.products.values());
  }

  async update(product: Product): Promise<void> {
    if (this.products.has(product.id)) {
      this.products.set(product.id, product);
    }
  }
}

class InMemorySaleRepository implements SaleRepository {
  public sales: Map<string, Sale> = new Map();

  async save(sale: Sale): Promise<void> {
    this.sales.set(sale.id, sale);
  }

  async findById(id: string): Promise<Sale | null> {
    const sale = this.sales.get(id);
    // Clone to simulate DB retrieval (avoid reference issues)
    return sale
      ? new Sale(
          sale.id,
          sale.items.map((i) => ({ ...i })),
          sale.total,
          sale.status,
          sale.customerName,
          sale.customerPhone,
        )
      : null;
  }

  async findAll(): Promise<Sale[]> {
    return Array.from(this.sales.values());
  }

  async update(sale: Sale): Promise<void> {
    if (this.sales.has(sale.id)) {
      this.sales.set(sale.id, sale);
    }
  }
}

// --- Tests ---

describe('ValidateSaleUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let saleRepo: InMemorySaleRepository;
  let useCase: ValidateSale;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    saleRepo = new InMemorySaleRepository();
    useCase = new ValidateSale(saleRepo, productRepo);
  });

  it('should validate a pending sale with sufficient stock', async () => {
    // Arrange
    const product = new Product('prod-1', 'Laptop', 1000, 10, '', 'cat-test');
    await productRepo.save(product);

    const sale = new Sale(
      'sale-1',
      [{ productId: 'prod-1', quantity: 2, unitPrice: 1000, subtotal: 2000 }],
      2000,
      SaleStatus.PENDIENTE,
      'Test Customer',
      '555-1234',
    );
    await saleRepo.save(sale);

    // Act
    await useCase.execute('sale-1');

    // Assert
    const updatedSale = await saleRepo.findById('sale-1');
    const updatedProduct = await productRepo.findById('prod-1');

    expect(updatedSale?.status).toBe(SaleStatus.VALIDADA);
    expect(updatedProduct?.stock).toBe(8); // 10 - 2
  });

  it('should throw SaleNotFoundError if sale does not exist', async () => {
    await expect(useCase.execute('invalid-id')).rejects.toThrow(SaleNotFoundError);
  });

  it('should throw InvalidSaleStateError if sale is not PENDING', async () => {
    // Arrange
    const sale = new Sale('sale-2', [], 0, SaleStatus.VALIDADA, 'Test', '555-0000');
    await saleRepo.save(sale);

    // Act & Assert
    await expect(useCase.execute('sale-2')).rejects.toThrow(InvalidSaleStateError);
  });

  it('should throw ProductNotFoundError if a product in the sale does not exist', async () => {
    // Arrange
    const sale = new Sale(
      'sale-3',
      [{ productId: 'missing-prod', quantity: 1, unitPrice: 10, subtotal: 10 }],
      10,
      SaleStatus.PENDIENTE,
      'Test',
      '555-0000',
    );
    await saleRepo.save(sale);

    // Act & Assert
    await expect(useCase.execute('sale-3')).rejects.toThrow(ProductNotFoundError);
  });

  it('should throw InsufficientStockError if stock is insufficient', async () => {
    // Arrange
    const product = new Product('prod-2', 'Mouse', 50, 5, '', 'cat-test'); // Stock 5
    await productRepo.save(product);

    const sale = new Sale(
      'sale-4',
      [{ productId: 'prod-2', quantity: 10, unitPrice: 50, subtotal: 500 }], // Request 10
      500,
      SaleStatus.PENDIENTE,
      'Test',
      '555-0000',
    );
    await saleRepo.save(sale);

    // Act & Assert
    await expect(useCase.execute('sale-4')).rejects.toThrow(InsufficientStockError);
  });

  it('should NOT deduct stock if validation fails', async () => {
    // Arrange: Create scenario where 1st item has stock, 2nd item causes error
    const prod1 = new Product('p1', 'Item 1', 10, 100, '', 'cat-test');
    const prod2 = new Product('p2', 'Item 2', 20, 5, '', 'cat-test'); // Low stock
    await productRepo.save(prod1);
    await productRepo.save(prod2);

    const sale = new Sale(
      'sale-fail',
      [
        { productId: 'p1', quantity: 10, unitPrice: 10, subtotal: 100 }, // Valid
        { productId: 'p2', quantity: 10, unitPrice: 20, subtotal: 200 }, // Invalid (needs 10, has 5)
      ],
      300,
      SaleStatus.PENDIENTE,
      'Test',
      '555-0000',
    );
    await saleRepo.save(sale);

    // Act & Assert
    await expect(useCase.execute('sale-fail')).rejects.toThrow(InsufficientStockError);

    const checkProd1 = await productRepo.findById('p1');
    const checkProd2 = await productRepo.findById('p2');
    const checkSale = await saleRepo.findById('sale-fail');

    expect(checkSale?.status).toBe(SaleStatus.PENDIENTE); // Should remain pending
    expect(checkProd1?.stock).toBe(100); // 100 - 0 (No change)
    expect(checkProd2?.stock).toBe(5);   // 5 - 0 (No change)
  });
});
