import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface DailySummary {
    orderCount: bigint;
    totalRevenue: bigint;
}
export interface MenuItem {
    id: bigint;
    name: string;
    price1: bigint;
    price2: bigint;
}
export interface Order {
    id: bigint;
    customerName: string;
    createdAt: bigint;
    description: string;
    tableNumber: string;
    totalAmount: bigint;
    statusCode: bigint;
    items: Array<OrderItem>;
}
export interface OrderItem {
    menuItemName: string;
    variantType: bigint;
    quantity: bigint;
    unitPrice: bigint;
    menuItemId: bigint;
    subtotal: bigint;
}
export interface backendInterface {
    cancelOrder(orderId: bigint): Promise<boolean>;
    clearAllOrders(): Promise<void>;
    createOrder(customerName: string, tableNumber: string, description: string, items: Array<OrderItem>): Promise<bigint>;
    getActiveOrders(): Promise<Array<Order>>;
    getAllOrders(): Promise<Array<Order>>;
    getDailySummary(_dateString: string): Promise<DailySummary>;
    getMenuItems(): Promise<Array<MenuItem>>;
    getOrderById(orderId: bigint): Promise<Order | null>;
    updateOrderStatus(orderId: bigint, newStatus: bigint): Promise<boolean>;
}
