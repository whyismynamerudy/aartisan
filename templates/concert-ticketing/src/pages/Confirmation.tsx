import { useAIEnhanced } from "aartisan/react";
import React, { useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Check, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
import PageTransition from '@/components/layout/PageTransition';
const Confirmation = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Confirmation", {
    purpose: "ui-component",
    interactions: []
  });
  const {
    items
  } = useCart();
  const navigate = useNavigate();

  // Redirect if they didn't go through payment process
  useEffect(() => {
    if (items.length > 0) {
      navigate('/checkout');
    }
  }, [items, navigate]);
  const orderNumber = Math.floor(Math.random() * 1000000).toString().padStart(6, '0');
  return <PageTransition ref={ref} {...aiProps}>
      <div className="min-h-screen pt-24 pb-16 flex flex-col items-center">
        <div className="container max-w-2xl mx-auto px-4 text-center">
          <div className="h-24 w-24 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-6">
            <Check className="h-12 w-12 text-primary" />
          </div>
          
          <h1 className="text-3xl font-bold mb-2">Order Confirmed!</h1>
          <p className="text-muted-foreground mb-8">
            Thank you for your purchase. Your tickets have been confirmed.
          </p>
          
          <div className="bg-card rounded-lg border border-border p-8 text-left mb-8">
            <h2 className="text-xl font-semibold mb-4">Order Details</h2>
            
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Order Number</h3>
                  <p className="mt-1 font-medium">{orderNumber}</p>
                </div>
                <div>
                  <h3 className="text-sm font-medium text-muted-foreground">Date</h3>
                  <p className="mt-1">{new Date().toLocaleDateString()}</p>
                </div>
              </div>
              
              <div>
                <h3 className="text-sm font-medium text-muted-foreground">Delivery Method</h3>
                <p className="mt-1">E-Tickets - Check your email</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-4">
            <p className="text-sm text-muted-foreground">
              A confirmation email has been sent to your email address with all the details of your purchase.
            </p>
            
            <Button asChild className="w-full sm:w-auto">
              <Link to="/" className="flex items-center gap-2">
                Back to Home
                <ArrowRight className="h-4 w-4" />
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </PageTransition>;
};
export default Confirmation;