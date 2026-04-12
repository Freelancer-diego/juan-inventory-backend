import { Injectable, ConflictException } from '@nestjs/common';
import { Category } from '../../domain/entities/category.entity';
import type { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable()
export class CreateCategory {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(id: string, name: string): Promise<void> {
    const existingCategory = await this.categoryRepository.findById(id);
    if (existingCategory) {
      throw new ConflictException(`Category with ID ${id} already exists`);
    }

    const category = new Category(id, name);
    await this.categoryRepository.save(category);
  }
}
