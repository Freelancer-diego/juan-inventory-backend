import { Product } from '../entities/product.entity';

export interface ProductRepository {
  save(product: Product): Promise<void>;
  findById(id: string): Promise<Product | null>;
  findByName(name: string, categoryId: string, excludeId?: string): Promise<Product | null>;
  findAll(): Promise<Product[]>;
  update(product: Product): Promise<void>;
  delete(id: string): Promise<void>;
}
