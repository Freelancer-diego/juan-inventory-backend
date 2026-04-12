import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { DuplicateProductNameError } from '../../domain/errors/domain-errors';

@Injectable()
export class CreateProduct {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(id: string, name: string, price: number, stock: number, image: string, categoryId: string): Promise<Product> {
    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    const existing = await this.productRepository.findByName(name, categoryId);
    if (existing) {
      throw new DuplicateProductNameError(name);
    }

    const product = new Product(id, name, price, stock, image, categoryId);
    await this.productRepository.save(product);
    return product;
  }
}
