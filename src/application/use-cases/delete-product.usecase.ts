import { Injectable } from '@nestjs/common';
import type { ProductRepository } from '../../domain/repositories/product.repository';
import { ProductNotFoundError } from '../../domain/errors/domain-errors';

@Injectable()
export class DeleteProduct {
  constructor(private readonly productRepository: ProductRepository) {}

  async execute(id: string): Promise<void> {
    const product = await this.productRepository.findById(id);
    if (!product) {
      throw new ProductNotFoundError(id);
    }
    await this.productRepository.delete(id);
  }
}
