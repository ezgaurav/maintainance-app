import { supabase } from '../config/supabase';
import { OrderItem } from '../types';
import { notificationService } from './notification.service';
import { partsService } from './parts.service';

class OrderService {
  /**
   * Create a new order
   */
  async createOrder(userId: string, data: {
    items: OrderItem[];
    shipping_address: string;
    payment_method: string;
  }) {
    const { items, shipping_address, payment_method } = data;

    // Validate items and calculate total
    let total_amount = 0;
    const validatedItems: OrderItem[] = [];

    for (const item of items) {
      // Fetch part details
      const part = await partsService.getPartById(item.part_id);

      if (part.stock < item.quantity) {
        throw new Error(`Insufficient stock for ${part.name}. Available: ${part.stock}`);
      }

      validatedItems.push({
        part_id: item.part_id,
        quantity: item.quantity,
        price: part.price
      });

      total_amount += part.price * item.quantity;
    }

    // Create order
    const { data: order, error } = await supabase
      .from('orders')
      .insert({
        user_id: userId,
        items: validatedItems,
        total_amount,
        shipping_address,
        payment_method,
        status: 'pending',
        payment_status: 'pending'
      })
      .select()
      .single();

    if (error) {
      throw new Error('Failed to create order: ' + error.message);
    }

    // Update stock for each item
    for (const item of validatedItems) {
      const part = await partsService.getPartById(item.part_id);
      await partsService.updateStock(item.part_id, part.stock - item.quantity);
    }

    // Notify user
    await notificationService.create({
      user_id: userId,
      type: 'order-created',
      title: 'Order Created',
      message: `Your order #${order.id.slice(0, 8)} has been created successfully.`,
      data: { order_id: order.id }
    });

    return order;
  }

  /**
   * Get user's orders
   */
  async getUserOrders(userId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('user_id', userId)
      .order('created_at', { ascending: false });

    if (error) {
      throw new Error('Failed to fetch orders: ' + error.message);
    }

    return data;
  }

  /**
   * Get order by ID
   */
  async getOrderById(orderId: string) {
    const { data, error } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .single();

    if (error || !data) {
      throw new Error('Order not found');
    }

    // Fetch part details for each item
    const itemsWithDetails = await Promise.all(
      (data.items as OrderItem[]).map(async (item) => {
        const part = await partsService.getPartById(item.part_id);
        return {
          ...item,
          part_name: part.name,
          part_image: part.image
        };
      })
    );

    return {
      ...data,
      items: itemsWithDetails
    };
  }

  /**
   * Get all orders (admin)
   */
  async getAllOrders(filters?: { status?: string; payment_status?: string }) {
    let query = supabase
      .from('orders')
      .select('*')
      .order('created_at', { ascending: false });

    if (filters?.status) {
      query = query.eq('status', filters.status);
    }

    if (filters?.payment_status) {
      query = query.eq('payment_status', filters.payment_status);
    }

    const { data, error } = await query;

    if (error) {
      throw new Error('Failed to fetch orders: ' + error.message);
    }

    return data;
  }

  /**
   * Update order status (admin)
   */
  async updateOrderStatus(
    orderId: string,
    status: 'pending' | 'confirmed' | 'shipped' | 'delivered' | 'cancelled'
  ) {
    const { data, error } = await supabase
      .from('orders')
      .update({ status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update order status: ' + error.message);
    }

    // Notify user
    await notificationService.create({
      user_id: data.user_id,
      type: 'order-status-updated',
      title: 'Order Status Updated',
      message: `Your order #${orderId.slice(0, 8)} status has been updated to ${status}.`,
      data: { order_id: orderId, status }
    });

    return data;
  }

  /**
   * Update payment status (admin)
   */
  async updatePaymentStatus(
    orderId: string,
    payment_status: 'pending' | 'paid' | 'failed'
  ) {
    const { data, error } = await supabase
      .from('orders')
      .update({ payment_status })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to update payment status: ' + error.message);
    }

    return data;
  }

  /**
   * Cancel order
   */
  async cancelOrder(orderId: string, userId: string) {
    // Get order details
    const { data: order } = await supabase
      .from('orders')
      .select('*')
      .eq('id', orderId)
      .eq('user_id', userId)
      .single();

    if (!order) {
      throw new Error('Order not found');
    }

    if (order.status !== 'pending') {
      throw new Error('Only pending orders can be cancelled');
    }

    // Update order status
    const { data, error } = await supabase
      .from('orders')
      .update({ status: 'cancelled' })
      .eq('id', orderId)
      .select()
      .single();

    if (error) {
      throw new Error('Failed to cancel order: ' + error.message);
    }

    // Restore stock for each item
    for (const item of order.items as OrderItem[]) {
      const part = await partsService.getPartById(item.part_id);
      await partsService.updateStock(item.part_id, part.stock + item.quantity);
    }

    return data;
  }
}

export const orderService = new OrderService();
