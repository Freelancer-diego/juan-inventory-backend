import { CreateSale } from '../create-sale.usecase';
import { Product } from '../../../domain/entities/product.entity';
import { Sale, SaleStatus } from '../../../domain/entities/sale.entity';
import { ProductRepository } from '../../../domain/repositories/product.repository';
import { SaleRepository } from '../../../domain/repositories/sale.repository';
import {
  EmptySaleError,
  ProductNotFoundError,
  InvalidQuantityError,
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

  async findAll(): Promise<Product[]> { return Array.from(this.products.values()); }
  async update(product: Product): Promise<void> { this.products.set(product.id, product); }
}

class InMemorySaleRepository implements SaleRepository {
  public sales: Map<string, Sale> = new Map();

  async save(sale: Sale): Promise<void> {
    this.sales.set(sale.id, sale);
  }

  async findById(id: string): Promise<Sale | null> {
    const sale = this.sales.get(id);
    return sale ? new Sale(sale.id, sale.items, sale.total, sale.status, sale.customerName, sale.customerPhone) : null;
  }

  async findAll(): Promise<Sale[]> { return Array.from(this.sales.values()); }
  async update(sale: Sale): Promise<void> { this.sales.set(sale.id, sale); }
}

// --- Tests ---

describe('CreateSaleUseCase', () => {
  let productRepo: InMemoryProductRepository;
  let saleRepo: InMemorySaleRepository;
  let useCase: CreateSale;

  beforeEach(() => {
    productRepo = new InMemoryProductRepository();
    saleRepo = new InMemorySaleRepository();
    useCase = new CreateSale(saleRepo, productRepo);
  });

  it('should create a sale successfully with calculated total', async () => {
    // Arrange
    const product = new Product('prod-1', 'Laptop', 1000, 10, '', 'cat-test');
    await productRepo.save(product);

    const items = [{ productId: 'prod-1', quantity: 2, unitPrice: 0, subtotal: 0 }]; // unitPrice and subtotal ignored/recalculated

    // Act
    await useCase.execute('sale-1', items, 'Test Customer', '555-1234');

    // Assert
    const savedSale = await saleRepo.findById('sale-1');
    expect(savedSale).toBeDefined();
    expect(savedSale?.status).toBe(SaleStatus.PENDIENTE);
    expect(savedSale?.total).toBe(2000); // 1000 * 2
    expect(savedSale?.items[0].unitPrice).toBe(1000); // Frozen price
    expect(savedSale?.items[0].subtotal).toBe(2000);
  });

  it('should throw EmptySaleError if items are empty', async () => {
    await expect(useCase.execute('sale-2', [], 'Test', '555-0000')).rejects.toThrow(EmptySaleError);
  });

  it('should throw ProductNotFoundError if product does not exist', async () => {
    const items = [{ productId: 'missing', quantity: 1, unitPrice: 0, subtotal: 0 }];
    await expect(useCase.execute('sale-3', items, 'Test', '555-0000')).rejects.toThrow(ProductNotFoundError);
  });

  it('should throw InvalidQuantityError if quantity is 0 or negative', async () => {
    const items = [{ productId: 'prod-1', quantity: 0, unitPrice: 0, subtotal: 0 }];
    await expect(useCase.execute('sale-4', items, 'Test', '555-0000')).rejects.toThrow(InvalidQuantityError);
  });

  it('should NOT deduct stock when creating a sale', async () => {
    // Arrange
    const product = new Product('prod-stock', 'Mouse', 50, 100, '', 'cat-test');
    await productRepo.save(product);
    const items = [{ productId: 'prod-stock', quantity: 10, unitPrice: 0, subtotal: 0 }];

    // Act
    await useCase.execute('sale-stock', items, 'Test', '555-0000');

    // Assert
    const checkProduct = await productRepo.findById('prod-stock');
    expect(checkProduct?.stock).toBe(100); // Stock must remain unchanged
  });
});
