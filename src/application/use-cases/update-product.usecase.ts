import { Injectable, NotFoundException } from '@nestjs/common';
import { Product } from '../../domain/entities/product.entity';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import type { CategoryRepository } from '../../domain/repositories/category.repository';
import { ProductNotFoundError, DuplicateProductNameError } from '../../domain/errors/domain-errors';

@Injectable()
export class UpdateProduct {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly categoryRepository: CategoryRepository,
  ) {}

  async execute(id: string, name: string, price: number, stock: number, image: string, categoryId: string): Promise<Product> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }

    const category = await this.categoryRepository.findById(categoryId);
    if (!category) {
      throw new NotFoundException(`Category with ID ${categoryId} not found`);
    }

    // Check for duplicate name within the same category, excluding the current product
    const duplicate = await this.productRepository.findByName(name, categoryId, id);
    if (duplicate) {
      throw new DuplicateProductNameError(name);
    }

    product.name = name;
    product.price = price;
    product.stock = stock;
    product.image = image;
    product.categoryId = categoryId;

    await this.productRepository.update(product);
    return product;
  }
}
