import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Product } from '../../domain/entities/product.entity';
import { ProductRepository } from '../../domain/repositories/product.repository';
import { DuplicateProductNameError } from '../../domain/errors/domain-errors';
import { Product as ProductModel, ProductDocument } from '../database/mongo/schemas/product.schema';

const MONGO_DUPLICATE_KEY_CODE = 11000;

@Injectable()
export class MongoProductRepository implements ProductRepository {
  constructor(
    @InjectModel(ProductModel.name) private readonly productModel: Model<ProductDocument>,
  ) {}

  async save(product: Product): Promise<void> {
    try {
      const newProduct = new this.productModel({
        _id: product.id,
        name: product.name,
        price: product.price,
        stock: product.stock,
        image: product.image,
        categoryId: product.categoryId,
      });
      await newProduct.save();
    } catch (err: any) {
      if (err?.code === MONGO_DUPLICATE_KEY_CODE) {
        throw new DuplicateProductNameError(product.name);
      }
      throw err;
    }
  }

  async findById(id: string): Promise<Product | null> {
    const found = await this.productModel.findById(id).exec();
    if (!found) return null;
    return new Product(found._id, found.name, found.price, found.stock, found.image, found.categoryId);
  }

  async findByName(name: string, categoryId: string, excludeId?: string): Promise<Product | null> {
    // Escape special regex characters to avoid injection
    const escaped = name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const query: Record<string, unknown> = {
      name: { $regex: new RegExp(`^${escaped}$`, 'i') },
      categoryId,
    };
    if (excludeId) {
      query._id = { $ne: excludeId };
    }
    const found = await this.productModel.findOne(query).exec();
    if (!found) return null;
    return new Product(found._id, found.name, found.price, found.stock, found.image, found.categoryId);
  }

  async findAll(): Promise<Product[]> {
    const found = await this.productModel.find().exec();
    return found.map(
      (p) => new Product(p._id, p.name, p.price, p.stock, p.image, p.categoryId),
    );
  }

  async update(product: Product): Promise<void> {
    try {
      await this.productModel.findByIdAndUpdate(
        product.id,
        {
          name: product.name,
          price: product.price,
          stock: product.stock,
          image: product.image,
          categoryId: product.categoryId,
        },
        { new: true },
      ).exec();
    } catch (err: any) {
      if (err?.code === MONGO_DUPLICATE_KEY_CODE) {
        throw new DuplicateProductNameError(product.name);
      }
      throw err;
    }
  }

  async delete(id: string): Promise<void> {
    await this.productModel.findByIdAndDelete(id).exec();
  }
}
