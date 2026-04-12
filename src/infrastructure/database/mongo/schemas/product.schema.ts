import { Prop, Schema, SchemaFactory } from '@nestjs/mongoose';
import { Document } from 'mongoose';

export type ProductDocument = Product & Document;

@Schema({ collection: 'products' })
export class Product {
  // We use string for ID as per Domain Entity generic ID concept, 
  // but Mongo usually handles _id. We'll map _id to id.
  // For simplicity, we can trust Mongo _id or enforce our own ID.
  // Standard practice: Domain ID maps to Mongo _id (if string/uuid) or we use a separate field.
  // Here assuming we match domain ID to _id for simplicity or map it.
  // Let's rely on default Mongo _id for now and map it, unless domain enforces UUID generation.
  // The domain entity has 'id' in constructor. Use case generates it? 
  // Wait, CreateProduct use case receives 'id'. So ID is user-provided or generated upstream.
  // So we should use strictly that ID.
  
  @Prop({ required: true })
  _id: string; // Override default _id to be string to match domain ID exactly

  @Prop({ required: true })
  name: string;

  @Prop({ required: true })
  price: number;

  @Prop({ required: true })
  stock: number;

  @Prop({ required: false }) // Optional in DB to support legacy docs
  image: string;

  @Prop({ required: true })
  categoryId: string;
}

export const ProductSchema = SchemaFactory.createForClass(Product);

// Unique compound index (name + categoryId) with case-insensitive collation.
// Allows the same name in different categories; prevents duplicates within the same one.
// Acts as last line of defense against race conditions.
ProductSchema.index(
  { name: 1, categoryId: 1 },
  { unique: true, collation: { locale: 'es', strength: 2 } },
);
