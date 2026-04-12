import { Sale, SaleStatus } from '../../domain/entities/sale.entity';
import { Product } from '../../domain/entities/product.entity';
import { SaleRepository } from '../../domain/repositories/sale.repository';
import { ProductRepository } from '../../domain/repositories/product.repository';

export interface DashboardSummary {
  revenue: number;
  revenueGrowth: number;
  orders: number;
  products: number;
  stockAlerts: number;
}

export interface StockRiskItem {
  id: string;
  name: string;
  stock: number;
  price: number;
}

export interface SalesTrendPoint {
  date: string;
  pending: number;
  validated: number;
  canceled: number;
}

export interface TopProductItem {
  name: string;
  sold: number;
}

export interface DashboardData {
  summary: DashboardSummary;
  stockRisks: StockRiskItem[];
  salesTrend: SalesTrendPoint[];
  topProducts: TopProductItem[];
}

export class GetDashboardData {
  constructor(
    private readonly productRepository: ProductRepository,
    private readonly saleRepository: SaleRepository,
  ) {}

  async execute(from?: Date, to?: Date): Promise<DashboardData> {
    const [products, sales] = await Promise.all([
      this.productRepository.findAll(),
      this.saleRepository.findAll(),
    ]);

    const now = new Date();

    // Default range: last 30 days
    const rangeEnd = to ?? now;
    const rangeStart = from ?? (() => {
      const d = new Date(now);
      d.setDate(now.getDate() - 30);
      d.setHours(0, 0, 0, 0);
      return d;
    })();

    // Sales within the selected range
    const salesInRange = sales.filter(
      s => s.createdAt && s.createdAt >= rangeStart && s.createdAt <= rangeEnd,
    );
    const validatedInRange = salesInRange.filter(s => s.status === SaleStatus.VALIDADA);

    // ── Summary ──────────────────────────────────────────────────────────────
    const revenue = validatedInRange.reduce((sum, s) => sum + s.total, 0);

    // Pending orders are always global (current actionable state, not time-filtered)
    const orders = sales.filter(s => s.status === SaleStatus.PENDIENTE).length;

    // Stock alerts and product count are always global (current inventory state)
    const stockAlerts = products.filter(p => p.stock <= 5).length;

    // Revenue growth: compare selected range vs the equivalent prior window
    const rangeDurationMs = rangeEnd.getTime() - rangeStart.getTime();
    const prevEnd = new Date(rangeStart.getTime() - 1);
    const prevStart = new Date(rangeStart.getTime() - rangeDurationMs);

    const recentRevenue = revenue;
    const prevRevenue = sales
      .filter(
        s =>
          s.status === SaleStatus.VALIDADA &&
          s.createdAt &&
          s.createdAt >= prevStart &&
          s.createdAt <= prevEnd,
      )
      .reduce((sum, s) => sum + s.total, 0);

    const revenueGrowth =
      prevRevenue === 0
        ? recentRevenue > 0 ? 100 : 0
        : Math.round(((recentRevenue - prevRevenue) / prevRevenue) * 1000) / 10;

    // ── Stock risks (global) ──────────────────────────────────────────────────
    const stockRisks: StockRiskItem[] = [...products]
      .sort((a, b) => a.stock - b.stock)
      .slice(0, 10)
      .map(p => ({ id: p.id, name: p.name, stock: p.stock, price: p.price }));

    // ── Sales trend (one point per day within the range) ───────────────────────
    const salesTrend = this.buildSalesTrend(salesInRange, rangeStart, rangeEnd);

    // ── Top products (from validated sales within range) ──────────────────────
    const topProducts = this.buildTopProducts(products, validatedInRange);

    return {
      summary: { revenue, revenueGrowth, orders, products: products.length, stockAlerts },
      stockRisks,
      salesTrend,
      topProducts,
    };
  }

  private buildSalesTrend(
    sales: Sale[],
    from: Date,
    to: Date,
  ): SalesTrendPoint[] {
    const map = new Map<string, { pending: number; validated: number; canceled: number }>();

    // Iterate from → to inclusive, one entry per day
    const cursor = new Date(from);
    cursor.setHours(0, 0, 0, 0);
    const end = new Date(to);
    end.setHours(23, 59, 59, 999);

    while (cursor <= end) {
      map.set(cursor.toISOString().slice(0, 10), { pending: 0, validated: 0, canceled: 0 });
      cursor.setDate(cursor.getDate() + 1);
    }

    for (const sale of sales) {
      if (!sale.createdAt) continue;
      const key = new Date(sale.createdAt).toISOString().slice(0, 10);
      const entry = map.get(key);
      if (!entry) continue;
      if (sale.status === SaleStatus.PENDIENTE) entry.pending++;
      else if (sale.status === SaleStatus.VALIDADA) entry.validated++;
      else if (sale.status === SaleStatus.CANCELADA) entry.canceled++;
    }

    return Array.from(map.entries()).map(([date, counts]) => ({ date, ...counts }));
  }

  private buildTopProducts(products: Product[], validatedSales: Sale[]): TopProductItem[] {
    const quantityMap: Record<string, number> = {};
    for (const sale of validatedSales) {
      for (const item of sale.items) {
        quantityMap[item.productId] = (quantityMap[item.productId] ?? 0) + item.quantity;
      }
    }

    return Object.entries(quantityMap)
      .map(([productId, sold]) => ({
        name: products.find(p => p.id === productId)?.name ?? productId,
        sold,
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10);
  }
}
