import { NestFactory } from '@nestjs/core';
import { AppModule } from './src/app.module';
import { getModelToken } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { ProductDocument, Product } from './src/infrastructure/database/mongo/schemas/product.schema';
import { CategoryDocument, Category } from './src/infrastructure/database/mongo/schemas/category.schema';

async function bootstrap() {
  const app = await NestFactory.createApplicationContext(AppModule);
  const productModel = app.get<Model<ProductDocument>>(getModelToken(Product.name));
  const categoryModel = app.get<Model<CategoryDocument>>(getModelToken(Category.name));

  console.log('Seeding categories...');

  const categories = [
    {
      _id: 'cat-ferreteria',
      name: 'Ferreteria',
    },
    {
      _id: 'cat-chatarreria',
      name: 'Chatarreria',
    },
  ];

  for (const c of categories) {
    await categoryModel.findOneAndUpdate(
      { _id: c._id },
      c,
      { upsert: true, new: true }
    );
    console.log(`Upserted category: ${c.name}`);
  }

  console.log('Seeding products...');

  // Clear existing products (Optional: Remove if you want to keep them)
  // await productModel.deleteMany({});

  const products = [
    {
      _id: 'prod-demo-001',
      name: 'Martillo de Acero',
      price: 25000,
      stock: 15,
      image: '/products/martillo.png',
      categoryId: 'cat-ferreteria'
    },
    {
      _id: 'prod-demo-002',
      name: 'Destornillador Set',
      price: 18000,
      stock: 50,
      image: '/products/destornillador.png',
      categoryId: 'cat-ferreteria'
    },
    {
      _id: 'prod-demo-003',
      name: 'Chatarra de Cobre',
      price: 12000,
      stock: 100,
      image: '/products/cobre.png',
      categoryId: 'cat-chatarreria'
    },
    {
      _id: 'prod-demo-004',
      name: 'Chatarra de Aluminio',
      price: 8000,
      stock: 75,
      image: '/products/aluminio.png',
      categoryId: 'cat-chatarreria'
    }
  ];

  for (const p of products) {
    await productModel.findOneAndUpdate(
      { _id: p._id },
      p,
      { upsert: true, new: true }
    );
    console.log(`Upserted: ${p.name}`);
  }

  console.log('Seeding complete!');
  await app.close();
}

bootstrap();

