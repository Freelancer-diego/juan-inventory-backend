import { Module } from '@nestjs/common';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { MongooseModule } from '@nestjs/mongoose';
import { Product, ProductSchema } from './schemas/product.schema';
import { Sale, SaleSchema } from './schemas/sale.schema';
import { Category, CategorySchema } from './schemas/category.schema';
import { MongoProductRepository } from '../../repositories/mongo-product.repository';
import { MongoSaleRepository } from '../../repositories/mongo-sale.repository';
import { MongoCategoryRepository } from '../../repositories/mongo-category.repository';

@Module({
  imports: [
    MongooseModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: async (configService: ConfigService) => ({
        uri: configService.get<string>('MONGODB_URI'),
      }),
      inject: [ConfigService],
    }),
    MongooseModule.forFeature([
      { name: Product.name, schema: ProductSchema },
      { name: Sale.name, schema: SaleSchema },
      { name: Category.name, schema: CategorySchema },
    ]),
  ],
  providers: [
    MongoProductRepository,
    MongoSaleRepository,
    MongoCategoryRepository,
  ],
  exports: [
    MongooseModule,
    MongoProductRepository,
    MongoSaleRepository,
    MongoCategoryRepository,
  ],
})
export class MongoDatabaseModule {}
