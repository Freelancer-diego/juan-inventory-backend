import { Injectable } from '@nestjs/common';
import { Category } from '../../domain/entities/category.entity';
import type { CategoryRepository } from '../../domain/repositories/category.repository';

@Injectable()
export class GetAllCategories {
  constructor(private readonly categoryRepository: CategoryRepository) {}

  async execute(): Promise<Category[]> {
    return this.categoryRepository.findAll();
  }
}
