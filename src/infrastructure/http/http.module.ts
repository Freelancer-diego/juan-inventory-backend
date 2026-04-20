import { Module } from '@nestjs/common';
import { MongooseModule } from '@nestjs/mongoose';
import { CloudinaryService } from '../services/cloudinary.service';
import { BcryptService } from '../services/bcrypt.service';
import { CreateProduct } from '../../application/use-cases/create-product.usecase';
import { CreateSale } from '../../application/use-cases/create-sale.usecase';
import { ValidateSale } from '../../application/use-cases/validate-sale.usecase';
import { GetAllProducts } from '../../application/use-cases/get-all-products.usecase';
import { GetProductById } from '../../application/use-cases/get-product-by-id.usecase';
import { UpdateProduct } from '../../application/use-cases/update-product.usecase';
import { DeleteProduct } from '../../application/use-cases/delete-product.usecase';
import { GetAllSales } from '../../application/use-cases/get-all-sales.usecase';
import { CreateCategory } from '../../application/use-cases/create-category.usecase';
import { GetAllCategories } from '../../application/use-cases/get-all-categories.usecase';
import { GetDashboardData } from '../../application/use-cases/get-dashboard-data.usecase';
import { CreateUser } from '../../application/use-cases/create-user.usecase';
import { GetAllUsers } from '../../application/use-cases/get-all-users.usecase';
import { GetUserById } from '../../application/use-cases/get-user-by-id.usecase';
import { UpdateUser } from '../../application/use-cases/update-user.usecase';
import { DeleteUser } from '../../application/use-cases/delete-user.usecase';
import { MongoDatabaseModule } from '../database/mongo/mongo.module';
import { MongoProductRepository } from '../repositories/mongo-product.repository';
import { MongoSaleRepository } from '../repositories/mongo-sale.repository';
import { MongoCategoryRepository } from '../repositories/mongo-category.repository';
import { MongoAdminRepository } from '../repositories/mongo-admin.repository';
import { ProductController } from './controllers/product.controller';
import { SaleController } from './controllers/sale.controller';
import { CategoryController } from './controllers/category.controller';
import { DashboardController } from './controllers/dashboard.controller';
import { UserController } from './controllers/user.controller';
import { Admin, AdminSchema } from '../database/mongo/schemas/admin.schema';

@Module({
  imports: [
    MongoDatabaseModule,
    MongooseModule.forFeature([{ name: Admin.name, schema: AdminSchema }]),
  ],
  controllers: [ProductController, SaleController, CategoryController, DashboardController, UserController],
  providers: [
    CloudinaryService,
    BcryptService,
    MongoAdminRepository,
    {
      provide: CreateProduct,
      useFactory: (productRepo: MongoProductRepository, categoryRepo: MongoCategoryRepository) =>
        new CreateProduct(productRepo, categoryRepo),
      inject: [MongoProductRepository, MongoCategoryRepository],
    },
    {
      provide: CreateSale,
      useFactory: (saleRepo: MongoSaleRepository, productRepo: MongoProductRepository) =>
        new CreateSale(saleRepo, productRepo),
      inject: [MongoSaleRepository, MongoProductRepository],
    },
    {
      provide: ValidateSale,
      useFactory: (saleRepo: MongoSaleRepository, productRepo: MongoProductRepository) =>
        new ValidateSale(saleRepo, productRepo),
      inject: [MongoSaleRepository, MongoProductRepository],
    },
    {
      provide: GetAllProducts,
      useFactory: (productRepo: MongoProductRepository) => new GetAllProducts(productRepo),
      inject: [MongoProductRepository],
    },
    {
      provide: GetProductById,
      useFactory: (productRepo: MongoProductRepository) => new GetProductById(productRepo),
      inject: [MongoProductRepository],
    },
    {
      provide: UpdateProduct,
      useFactory: (productRepo: MongoProductRepository, categoryRepo: MongoCategoryRepository) =>
        new UpdateProduct(productRepo, categoryRepo),
      inject: [MongoProductRepository, MongoCategoryRepository],
    },
    {
      provide: DeleteProduct,
      useFactory: (productRepo: MongoProductRepository) => new DeleteProduct(productRepo),
      inject: [MongoProductRepository],
    },
    {
      provide: GetAllSales,
      useFactory: (saleRepo: MongoSaleRepository) => new GetAllSales(saleRepo),
      inject: [MongoSaleRepository],
    },
    {
      provide: CreateCategory,
      useFactory: (categoryRepo: MongoCategoryRepository) => new CreateCategory(categoryRepo),
      inject: [MongoCategoryRepository],
    },
    {
      provide: GetAllCategories,
      useFactory: (categoryRepo: MongoCategoryRepository) => new GetAllCategories(categoryRepo),
      inject: [MongoCategoryRepository],
    },
    {
      provide: GetDashboardData,
      useFactory: (productRepo: MongoProductRepository, saleRepo: MongoSaleRepository) =>
        new GetDashboardData(productRepo, saleRepo),
      inject: [MongoProductRepository, MongoSaleRepository],
    },
    {
      provide: CreateUser,
      useFactory: (adminRepo: MongoAdminRepository, hasher: BcryptService) =>
        new CreateUser(adminRepo, hasher),
      inject: [MongoAdminRepository, BcryptService],
    },
    {
      provide: GetAllUsers,
      useFactory: (adminRepo: MongoAdminRepository) => new GetAllUsers(adminRepo),
      inject: [MongoAdminRepository],
    },
    {
      provide: GetUserById,
      useFactory: (adminRepo: MongoAdminRepository) => new GetUserById(adminRepo),
      inject: [MongoAdminRepository],
    },
    {
      provide: UpdateUser,
      useFactory: (adminRepo: MongoAdminRepository, hasher: BcryptService) =>
        new UpdateUser(adminRepo, hasher),
      inject: [MongoAdminRepository, BcryptService],
    },
    {
      provide: DeleteUser,
      useFactory: (adminRepo: MongoAdminRepository) => new DeleteUser(adminRepo),
      inject: [MongoAdminRepository],
    },
  ],
})
export class HttpModule {}
