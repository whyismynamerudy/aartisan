import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import { Link } from 'react-router-dom';
import { ChevronLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import CheckoutForm from '@/components/checkout/CheckoutForm';
import PageTransition from '@/components/layout/PageTransition';
const Checkout = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Checkout", {
    purpose: "ui-component",
    interactions: []
  });
  const {
    items,
    totalPrice
  } = useCart();
  if (items.length === 0) {
    return <PageTransition ref={ref} {...aiProps}>
        <div className="min-h-screen pt-24 pb-16">
          <div className="container mx-auto px-4 text-center">
            <h1 className="text-3xl font-bold mb-4">Your cart is empty</h1>
            <p className="text-muted-foreground mb-6">
              You need to add tickets to your cart before proceeding to checkout.
            </p>
            <Button asChild>
              <Link to="/events">Browse Events</Link>
            </Button>
          </div>
        </div>
      </PageTransition>;
  }
  return <PageTransition>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="mb-6">
            <Button asChild variant="ghost" className="flex items-center gap-1 text-muted-foreground hover:text-foreground">
              <Link to="/cart">
                <ChevronLeft className="h-4 w-4" />
                Back to Cart
              </Link>
            </Button>
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Checkout</h1>
          <p className="text-muted-foreground mb-8">Complete your purchase</p>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <CheckoutForm />
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                
                <div className="space-y-4 divide-y divide-border">
                  {items.map(item => <div key={item.id} className="pt-4 first:pt-0">
                      <div className="flex justify-between">
                        <div>
                          <p className="font-medium">{item.eventName}</p>
                          <p className="text-sm text-muted-foreground">Seat {item.seat}</p>
                        </div>
                        <span>${item.price}</span>
                      </div>
                    </div>)}
                </div>
                
                <div className="mt-4 pt-4 border-t border-border">
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Subtotal</span>
                    <span>${totalPrice.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between mb-1">
                    <span className="text-muted-foreground">Service Fee</span>
                    <span>${(totalPrice * 0.1).toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between font-medium mt-3 pt-3 border-t border-border">
                    <span>Total</span>
                    <span>${(totalPrice * 1.1).toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>;
};
export default Checkout;