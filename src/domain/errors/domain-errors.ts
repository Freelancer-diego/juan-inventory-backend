export class SaleNotFoundError extends Error {
  constructor(id: string) {
    super(`Sale with ID ${id} not found`);
    this.name = 'SaleNotFoundError';
  }
}

export class InvalidSaleStateError extends Error {
  constructor(currentStatus: string) {
    super(`Sale cannot be validated because it is in state ${currentStatus}`);
    this.name = 'InvalidSaleStateError';
  }
}

export class ProductNotFoundError extends Error {
  constructor(id: string) {
    super(`Product with ID ${id} not found`);
    this.name = 'ProductNotFoundError';
  }
}

export class InsufficientStockError extends Error {
  constructor(productId: string, requested: number, available: number) {
    super(`Insufficient stock for product ${productId}. Requested: ${requested}, Available: ${available}`);
    this.name = 'InsufficientStockError';
  }
}

export class EmptySaleError extends Error {
  constructor() {
    super('The sale must contain at least one item');
    this.name = 'EmptySaleError';
  }
}

export class InvalidQuantityError extends Error {
  constructor(productId: string, quantity: number) {
    super(`Invalid quantity ${quantity} for product ${productId}. Quantity must be greater than 0.`);
    this.name = 'InvalidQuantityError';
  }
}

export class DuplicateProductNameError extends Error {
  constructor(name: string) {
    super(
      `No es posible registrar el producto: ya existe otro producto con el nombre "${name}" en esta categoría. Por favor, elige un nombre diferente o selecciona otra categoría.`,
    );
    this.name = 'DuplicateProductNameError';
  }
}
