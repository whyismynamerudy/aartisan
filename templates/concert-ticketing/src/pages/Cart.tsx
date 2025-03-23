import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import { Link } from 'react-router-dom';
import { ShoppingBag, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import CartItem from '@/components/cart/CartItem';
import { useCart } from '@/context/CartContext';
import PageTransition from '@/components/layout/PageTransition';
const Cart = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Cart", {
    purpose: "ui-component",
    interactions: ["click"]
  });
  const {
    items,
    totalPrice,
    clearCart
  } = useCart();
  return <PageTransition ref={ref} {...aiProps}>
      <div className="min-h-screen pt-24 pb-16">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Your Cart</h1>
          <p className="text-muted-foreground mb-6">Review your selected tickets before checkout</p>
          
          {items.length > 0 ? <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2">
                <div className="bg-card rounded-lg border border-border">
                  <div className="p-4 border-b">
                    <h2 className="font-medium">Ticket Items ({items.length})</h2>
                  </div>
                  
                  <div className="divide-y divide-border">
                    {items.map(item => <CartItem key={item.id} item={item} />)}
                  </div>
                  
                  <div className="p-4 flex justify-between">
                    <Button variant="outline" size="sm" onClick={clearCart}>
                      Clear Cart
                    </Button>
                    <Button asChild size="sm">
                      <Link to="/events">
                        Add More Tickets
                      </Link>
                    </Button>
                  </div>
                </div>
              </div>
              
              <div className="lg:col-span-1">
                <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                  <h2 className="text-xl font-semibold mb-4">Order Summary</h2>
                  
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Tickets ({items.length})</span>
                      <span>${totalPrice.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-muted-foreground">Service Fee</span>
                      <span>${(totalPrice * 0.1).toFixed(2)}</span>
                    </div>
                  </div>
                  
                  <Separator className="my-4" />
                  
                  <div className="flex justify-between font-medium text-lg mb-6">
                    <span>Total</span>
                    <span>${(totalPrice * 1.1).toFixed(2)}</span>
                  </div>
                  
                  <Button asChild className="w-full">
                    <Link to="/checkout" className="flex items-center justify-center gap-2">
                      Proceed to Checkout
                      <ArrowRight className="h-4 w-4" />
                    </Link>
                  </Button>
                  
                  <p className="text-xs text-muted-foreground text-center mt-4">
                    Secure checkout. All major payment methods accepted.
                  </p>
                </div>
              </div>
            </div> : <div className="text-center py-16 bg-card rounded-lg border border-border">
              <ShoppingBag className="mx-auto h-12 w-12 text-muted-foreground" />
              <h2 className="mt-4 text-xl font-medium">Your cart is empty</h2>
              <p className="mt-2 text-muted-foreground">
                Looks like you haven't added any tickets to your cart yet.
              </p>
              <Button asChild className="mt-6">
                <Link to="/events">Browse Events</Link>
              </Button>
            </div>}
        </div>
      </div>
    </PageTransition>;
};
export default Cart;