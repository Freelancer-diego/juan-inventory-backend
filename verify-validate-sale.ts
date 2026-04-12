import { Product } from './src/domain/entities/product.entity';
import { Sale, SaleStatus, SaleItem } from './src/domain/entities/sale.entity';
import { ProductRepository } from './src/domain/repositories/product.repository';
import { SaleRepository } from './src/domain/repositories/sale.repository';
import { ValidateSale } from './src/application/use-cases/validate-sale.usecase';

// -- Mocks --
class MockProductRepo implements ProductRepository {
  private products = new Map<string, Product>();

  constructor() {
    this.products.set('p1', new Product('p1', 'Product 1', 10, 100, '', 'cat-test')); // Sufficient stock
    this.products.set('p2', new Product('p2', 'Product 2', 20, 5, '', 'cat-test'));   // Low stock
  }

  async save(product: Product): Promise<void> { this.products.set(product.id, product); }
  async findById(id: string): Promise<Product | null> { return this.products.get(id) || null; }
  async findAll(): Promise<Product[]> { return Array.from(this.products.values()); }
  async update(product: Product): Promise<void> { this.products.set(product.id, product); }
  async delete(id: string): Promise<void> { this.products.delete(id); }
}

class MockSaleRepo implements SaleRepository {
  private sales = new Map<string, Sale>();

  constructor() {
    // Sale 1: Valid
    this.sales.set('s1', new Sale('s1', [{ productId: 'p1', quantity: 10, unitPrice: 10, subtotal: 100 }], 100, SaleStatus.PENDIENTE, 'Cliente Test', '0000000000'));
    // Sale 2: Already Validated
    this.sales.set('s2', new Sale('s2', [{ productId: 'p1', quantity: 1, unitPrice: 10, subtotal: 10 }], 10, SaleStatus.VALIDADA, 'Cliente Test', '0000000000'));
    // Sale 3: Insufficient Stock (Needs 6 of p2, has 5)
    this.sales.set('s3', new Sale('s3', [{ productId: 'p2', quantity: 6, unitPrice: 20, subtotal: 120 }], 120, SaleStatus.PENDIENTE, 'Cliente Test', '0000000000'));
    // Sale 4: Product Not Found
    this.sales.set('s4', new Sale('s4', [{ productId: 'p99', quantity: 1, unitPrice: 10, subtotal: 10 }], 10, SaleStatus.PENDIENTE, 'Cliente Test', '0000000000'));
  }

  async save(sale: Sale): Promise<void> { this.sales.set(sale.id, sale); }
  async findById(id: string): Promise<Sale | null> { return this.sales.get(id) || null; }
  async findAll(): Promise<Sale[]> { return Array.from(this.sales.values()); }
  async update(sale: Sale): Promise<void> { this.sales.set(sale.id, sale); }
}

// -- Test Runner --
async function run() {
  const productRepo = new MockProductRepo();
  const saleRepo = new MockSaleRepo();
  const validateSale = new ValidateSale(saleRepo, productRepo);

  console.log('--- Test 1: Successful Validation ---');
  try {
    await validateSale.execute('s1');
    const sale = await saleRepo.findById('s1');
    const product = await productRepo.findById('p1');
    
    if (sale?.status === SaleStatus.VALIDADA && product?.stock === 90) {
      console.log('PASSED: Sale validated and stock deducted (100 -> 90)');
    } else {
      console.error('FAILED: Incorrect state', { saleStatus: sale?.status, productStock: product?.stock });
    }
  } catch (e: any) {
    console.error('FAILED: Unexpected error', e.message);
  }

  console.log('\n--- Test 2: Sale Not Found ---');
  try {
    await validateSale.execute('s-unknown');
    console.error('FAILED: Should have thrown SaleNotFoundError');
  } catch (e: any) {
    if (e.name === 'SaleNotFoundError') console.log('PASSED: Caught SaleNotFoundError');
    else console.error(`FAILED: Caught wrong error ${e.name}: ${e.message}`);
  }

  console.log('\n--- Test 3: Invalid Sale State ---');
  try {
    await validateSale.execute('s2');
    console.error('FAILED: Should have thrown InvalidSaleStateError');
  } catch (e: any) {
    if (e.name === 'InvalidSaleStateError') console.log('PASSED: Caught InvalidSaleStateError');
    else console.error(`FAILED: Caught wrong error ${e.name}: ${e.message}`);
  }

  console.log('\n--- Test 4: Insufficient Stock ---');
  try {
    await validateSale.execute('s3');
    console.error('FAILED: Should have thrown InsufficientStockError');
  } catch (e: any) {
    if (e.name === 'InsufficientStockError') console.log('PASSED: Caught InsufficientStockError');
    else console.error(`FAILED: Caught wrong error ${e.name}: ${e.message}`);
    
    // START CHECK: Verify stock was NOT deducted partialy
    const p2 = await productRepo.findById('p2');
    if (p2?.stock === 5) console.log('PASSED: Stock remains unchanged (5)');
    else console.error('FAILED: Stock was modified despite error!', p2?.stock);
  }

  console.log('\n--- Test 5: Product Not Found ---');
  try {
    await validateSale.execute('s4');
    console.error('FAILED: Should have thrown ProductNotFoundError');
  } catch (e: any) {
    if (e.name === 'ProductNotFoundError') console.log('PASSED: Caught ProductNotFoundError');
    else console.error(`FAILED: Caught wrong error ${e.name}: ${e.message}`);
  }
}

run();
