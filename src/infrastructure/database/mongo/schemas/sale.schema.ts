import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type SaleDocument = Sale & Document;

@Schema()
class SaleItem {
  @Prop({ required: true })
  productId: string;

  @Prop({ required: true })
  quantity: number;

  @Prop({ required: true })
  unitPrice: number;

  @Prop({ required: true })
  subtotal: number;
}

const SaleItemSchema = SchemaFactory.createForClass(SaleItem);

@Schema({ collection: 'sales', timestamps: true })
export class Sale {
  @Prop({ required: true })
  _id: string;

  // Embedding items for simplicity and atomicity
  @Prop({ type: [SaleItemSchema], default: [] })
  items: SaleItem[];

  @Prop({ required: true })
  total: number;

  @Prop({ required: true })
  status: string;

  @Prop({ required: true })
  customerName: string;

  @Prop({ required: true })
  customerPhone: string;

  @Prop({ default: '' })
  saleCode: string;

  @Prop({ default: '' })
  orderSummary: string;

  // auto-set by mongoose timestamps: true
  createdAt?: Date;
}

export const SaleSchema = SchemaFactory.createForClass(Sale);
