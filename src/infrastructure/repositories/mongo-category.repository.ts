import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Category } from '../../domain/entities/category.entity';
import { CategoryRepository } from '../../domain/repositories/category.repository';
import { Category as CategoryModel, CategoryDocument } from '../database/mongo/schemas/category.schema';

@Injectable()
export class MongoCategoryRepository implements CategoryRepository {
  constructor(
    @InjectModel(CategoryModel.name) private readonly categoryModel: Model<CategoryDocument>,
  ) {}

  async save(category: Category): Promise<void> {
    const newCategory = new this.categoryModel({
      _id: category.id,
      name: category.name,
    });
    await newCategory.save();
  }

  async findById(id: string): Promise<Category | null> {
    const found = await this.categoryModel.findById(id).exec();
    if (!found) return null;
    return new Category(found._id, found.name);
  }

  async findAll(): Promise<Category[]> {
    const found = await this.categoryModel.find().exec();
    return found.map((c) => new Category(c._id, c.name));
  }
}
