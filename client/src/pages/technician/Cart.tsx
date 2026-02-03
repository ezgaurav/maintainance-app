import React from 'react';
import { useNavigate } from 'react-router-dom';
import { Card } from '../../components/shared/Card';
import { Button } from '../../components/shared/Button';
import { Input } from '../../components/shared/Input';
import { Navbar } from '../../components/shared/Navbar';
import { BottomNav } from '../../components/shared/BottomNav';
import { useCartStore, useAuthStore } from '../../store';
import { XMarkIcon, MinusIcon, PlusIcon } from '@heroicons/react/24/outline';
import { sparePartService } from '../../services/sparePart.service';
import { useState } from 'react';

export const Cart: React.FC = () => {
  const { items, removeFromCart, updateQuantity, clearCart, getTotalAmount } = useCartStore();
  const { user } = useAuthStore();
  const [shippingAddress, setShippingAddress] = useState(user?.address || '');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const navigate = useNavigate();

  const handleQuantityChange = (sparePartId: string, newQuantity: number) => {
    if (newQuantity < 1) return;
    updateQuantity(sparePartId, newQuantity);
  };

  const handleCheckout = async () => {
    if (!shippingAddress) {
      alert('Please enter shipping address');
      return;
    }

    setIsSubmitting(true);
    try {
      await sparePartService.createOrder({
        items: items.map((item) => ({
          sparePart: item.sparePart._id,
          quantity: item.quantity,
          price: item.sparePart.price,
        })),
        shippingAddress,
      });
      clearCart();
      alert('Order placed successfully!');
      navigate('/technician/orders');
    } catch (error) {
      console.error('Error placing order:', error);
      alert('Failed to place order');
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Navbar />
      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 pb-20 md:pb-8">
        <h1 className="text-3xl font-bold text-gray-900 mb-6">Shopping Cart</h1>

        {items.length === 0 ? (
          <Card>
            <div className="text-center py-12">
              <p className="text-gray-500 text-lg mb-4">Your cart is empty</p>
              <Button onClick={() => navigate('/technician/shop')}>
                Browse Spare Parts
              </Button>
            </div>
          </Card>
        ) : (
          <div className="space-y-6">
            <Card>
              <div className="space-y-4">
                {items.map((item) => (
                  <div
                    key={item.sparePart._id}
                    className="flex items-center space-x-4 pb-4 border-b last:border-b-0"
                  >
                    {item.sparePart.image && (
                      <img
                        src={item.sparePart.image}
                        alt={item.sparePart.name}
                        className="w-20 h-20 object-cover rounded-lg"
                      />
                    )}
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900">
                        {item.sparePart.name}
                      </h3>
                      <p className="text-sm text-gray-600">{item.sparePart.category}</p>
                      <p className="text-lg font-bold text-emerald-900 mt-1">
                        ₹{item.sparePart.price}
                      </p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() =>
                          handleQuantityChange(item.sparePart._id, item.quantity - 1)
                        }
                        className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300"
                      >
                        <MinusIcon className="h-4 w-4" />
                      </button>
                      <span className="w-12 text-center font-medium">{item.quantity}</span>
                      <button
                        onClick={() =>
                          handleQuantityChange(item.sparePart._id, item.quantity + 1)
                        }
                        className="p-1 rounded-lg bg-gray-200 hover:bg-gray-300"
                      >
                        <PlusIcon className="h-4 w-4" />
                      </button>
                    </div>
                    <button
                      onClick={() => removeFromCart(item.sparePart._id)}
                      className="p-2 text-red-600 hover:bg-red-50 rounded-lg"
                    >
                      <XMarkIcon className="h-5 w-5" />
                    </button>
                  </div>
                ))}
              </div>
            </Card>

            <Card>
              <h2 className="text-xl font-bold text-gray-900 mb-4">Order Summary</h2>
              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-gray-700">
                  <span>Subtotal</span>
                  <span>₹{getTotalAmount()}</span>
                </div>
                <div className="flex justify-between text-gray-700">
                  <span>Shipping</span>
                  <span>Free</span>
                </div>
                <div className="border-t pt-2 flex justify-between text-xl font-bold text-gray-900">
                  <span>Total</span>
                  <span className="text-emerald-900">₹{getTotalAmount()}</span>
                </div>
              </div>
              <Input
                label="Shipping Address"
                type="text"
                value={shippingAddress}
                onChange={(e) => setShippingAddress(e.target.value)}
                placeholder="Enter shipping address"
                required
              />
              <div className="mt-4 space-y-2">
                <Button onClick={handleCheckout} isLoading={isSubmitting} className="w-full">
                  Place Order
                </Button>
                <Button
                  variant="secondary"
                  onClick={clearCart}
                  className="w-full"
                >
                  Clear Cart
                </Button>
              </div>
            </Card>
          </div>
        )}
      </div>
      <BottomNav />
    </div>
  );
};
