
import { Product } from './src/domain/entities/product.entity';
import { Sale, SaleStatus, SaleItem } from './src/domain/entities/sale.entity';
import { Category } from './src/domain/entities/category.entity';
import { ProductRepository } from './src/domain/repositories/product.repository';
import { SaleRepository } from './src/domain/repositories/sale.repository';
import { CategoryRepository } from './src/domain/repositories/category.repository';
import { CreateProduct } from './src/application/use-cases/create-product.usecase';
import { CreateSale } from './src/application/use-cases/create-sale.usecase';

// Mock Repositories
class MockProductRepo implements ProductRepository {
  async save(product: Product): Promise<void> { console.log('Product saved', product.name); }
  async findById(id: string): Promise<Product | null> { return null; }
  async findAll(): Promise<Product[]> { return []; }
  async update(product: Product): Promise<void> {}
  async delete(id: string): Promise<void> {}
}

class MockSaleRepo implements SaleRepository {
  async save(sale: Sale): Promise<void> { console.log('Sale saved', sale.id); }
  async findById(id: string): Promise<Sale | null> { return null; }
  async findAll(): Promise<Sale[]> { return []; }
  async update(sale: Sale): Promise<void> {}
}

class MockCategoryRepo implements CategoryRepository {
  async save(category: Category): Promise<void> {}
  async findById(id: string): Promise<Category | null> { return new Category(id, 'Test Category'); }
  async findAll(): Promise<Category[]> { return []; }
}

async function run() {
  console.log('Verifying Architecture...');

  const productRepo = new MockProductRepo();
  const categoryRepo = new MockCategoryRepo();
  const createProduct = new CreateProduct(productRepo, categoryRepo);
  await createProduct.execute('p1', 'Test Product', 100, 10, '', 'cat1');

  const saleRepo = new MockSaleRepo();
  const createSale = new CreateSale(saleRepo, productRepo);
  const items: SaleItem[] = [{ productId: 'p1', quantity: 1, unitPrice: 100, subtotal: 100 }];
  await createSale.execute('s1', items, 'Test Customer', '123456789');

  console.log('Architecture verified: Use cases instantiated and executed without framework dependencies.');
}

run();
