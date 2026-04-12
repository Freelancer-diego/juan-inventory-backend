import { Injectable } from '@nestjs/common';
import { InjectModel } from '@nestjs/mongoose';
import { Model } from 'mongoose';
import { Sale, SaleStatus, SaleItem } from '../../domain/entities/sale.entity';
import { SaleRepository } from '../../domain/repositories/sale.repository';
import { Sale as SaleModel, SaleDocument } from '../database/mongo/schemas/sale.schema';

@Injectable()
export class MongoSaleRepository implements SaleRepository {
  constructor(
    @InjectModel(SaleModel.name) private readonly saleModel: Model<SaleDocument>,
  ) {}

  async save(sale: Sale): Promise<void> {
    const newSale = new this.saleModel({
      _id: sale.id,
      items: sale.items.map(item => ({...item})),
      total: sale.total,
      status: sale.status,
      customerName: sale.customerName,
      customerPhone: sale.customerPhone,
      saleCode: sale.saleCode,
      orderSummary: sale.orderSummary,
    });
    await newSale.save();
  }

  async findById(id: string): Promise<Sale | null> {
    const found = await this.saleModel.findById(id).exec();
    if (!found) return null;
    
    // Casting status string to Enum if needed, assuming validation handles correct strings
    return new Sale(
      found._id,
      found.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, subtotal: i.subtotal })),
      found.total,
      found.status as SaleStatus,
      found.customerName,
      found.customerPhone,
      found.saleCode ?? '',
      found.orderSummary ?? '',
      found.createdAt,
    );
  }

  async findAll(): Promise<Sale[]> {
    const found = await this.saleModel.find().exec();
    return found.map(s => new Sale(
      s._id,
      s.items.map(i => ({ productId: i.productId, quantity: i.quantity, unitPrice: i.unitPrice, subtotal: i.subtotal })),
      s.total,
      s.status as SaleStatus,
      s.customerName,
      s.customerPhone,
      s.saleCode ?? '',
      s.orderSummary ?? '',
      s.createdAt,
    ));
  }

  async update(sale: Sale): Promise<void> {
    await this.saleModel.findByIdAndUpdate(
      sale.id,
      {
        items: sale.items,
        total: sale.total,
        status: sale.status,
        customerName: sale.customerName,
        customerPhone: sale.customerPhone
      },
      { new: true }
    ).exec();
  }
}
