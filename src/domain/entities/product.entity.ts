export class Product {
  constructor(
    public readonly id: string,
    public name: string,
    public price: number,
    public stock: number,
    public image: string,
    public categoryId: string,
  ) {}
}
