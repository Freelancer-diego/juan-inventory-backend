import { Category } from '../entities/category.entity';

export interface CategoryRepository {
  save(category: Category): Promise<void>;
  findById(id: string): Promise<Category | null>;
  findAll(): Promise<Category[]>;
}
