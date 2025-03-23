import { useAIEnhanced } from "aartisan/react";
import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Separator } from '@/components/ui/separator';
import { toast } from 'sonner';
import { useCart } from '@/context/CartContext';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from '@/components/ui/form';
const formSchema = z.object({
  firstName: z.string().min(2, {
    message: 'First name must be at least 2 characters'
  }),
  lastName: z.string().min(2, {
    message: 'Last name must be at least 2 characters'
  }),
  email: z.string().email({
    message: 'Please enter a valid email address'
  }),
  phone: z.string().min(10, {
    message: 'Phone number must be at least 10 digits'
  }),
  address: z.string().min(5, {
    message: 'Address must be at least 5 characters'
  }),
  city: z.string().min(2, {
    message: 'City must be at least 2 characters'
  }),
  zipCode: z.string().min(4, {
    message: 'Zip code must be at least 4 characters'
  }),
  cardNumber: z.string().refine(val => /^\d{16}$/.test(val.replace(/\s/g, '')), {
    message: 'Card number must be 16 digits'
  }),
  cardName: z.string().min(2, {
    message: 'Cardholder name is required'
  }),
  expiryDate: z.string().refine(val => /^\d{2}\/\d{2}$/.test(val), {
    message: 'Expiry date must be in MM/YY format'
  }),
  cvc: z.string().refine(val => /^\d{3,4}$/.test(val), {
    message: 'CVC must be 3-4 digits'
  })
});
type FormValues = z.infer<typeof formSchema>;
const CheckoutForm: React.FC = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("CheckoutForm", {
    purpose: "input-form",
    interactions: ["submit"]
  });
  const {
    totalPrice,
    clearCart
  } = useCart();
  const navigate = useNavigate();
  const [isProcessing, setIsProcessing] = useState(false);
  const form = useForm<FormValues>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      address: '',
      city: '',
      zipCode: '',
      cardNumber: '',
      cardName: '',
      expiryDate: '',
      cvc: ''
    }
  });
  const onSubmit = (data: FormValues) => {
    setIsProcessing(true);

    // Simulate payment processing
    setTimeout(() => {
      setIsProcessing(false);
      clearCart();
      toast.success('Payment successful!');
      navigate('/confirmation');
    }, 2000);
  };
  return <Form {...form} ref={ref} {...aiProps}>
      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-8">
        <div>
          <h3 className="text-lg font-medium mb-4">Contact Information</h3>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <FormField control={form.control} name="firstName" render={({
            field
          }) => <FormItem>
                  <FormLabel>First Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <FormField control={form.control} name="lastName" render={({
            field
          }) => <FormItem>
                  <FormLabel>Last Name</FormLabel>
                  <FormControl>
                    <Input placeholder="Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <FormField control={form.control} name="email" render={({
            field
          }) => <FormItem>
                  <FormLabel>Email</FormLabel>
                  <FormControl>
                    <Input placeholder="john.doe@example.com" type="email" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <FormField control={form.control} name="phone" render={({
            field
          }) => <FormItem>
                  <FormLabel>Phone</FormLabel>
                  <FormControl>
                    <Input placeholder="(123) 456-7890" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Billing Address</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField control={form.control} name="address" render={({
            field
          }) => <FormItem>
                  <FormLabel>Address</FormLabel>
                  <FormControl>
                    <Input placeholder="123 Main St" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="city" render={({
              field
            }) => <FormItem>
                    <FormLabel>City</FormLabel>
                    <FormControl>
                      <Input placeholder="New York" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="zipCode" render={({
              field
            }) => <FormItem>
                    <FormLabel>Zip Code</FormLabel>
                    <FormControl>
                      <Input placeholder="10001" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>
          </div>
        </div>
        
        <Separator />
        
        <div>
          <h3 className="text-lg font-medium mb-4">Payment Information</h3>
          <div className="grid grid-cols-1 gap-4">
            <FormField control={form.control} name="cardNumber" render={({
            field
          }) => <FormItem>
                  <FormLabel>Card Number</FormLabel>
                  <FormControl>
                    <Input placeholder="4111 1111 1111 1111" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <FormField control={form.control} name="cardName" render={({
            field
          }) => <FormItem>
                  <FormLabel>Cardholder Name</FormLabel>
                  <FormControl>
                    <Input placeholder="John Doe" {...field} />
                  </FormControl>
                  <FormMessage />
                </FormItem>} />
            
            <div className="grid grid-cols-2 gap-4">
              <FormField control={form.control} name="expiryDate" render={({
              field
            }) => <FormItem>
                    <FormLabel>Expiry Date</FormLabel>
                    <FormControl>
                      <Input placeholder="MM/YY" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
              
              <FormField control={form.control} name="cvc" render={({
              field
            }) => <FormItem>
                    <FormLabel>CVC</FormLabel>
                    <FormControl>
                      <Input placeholder="123" {...field} />
                    </FormControl>
                    <FormMessage />
                  </FormItem>} />
            </div>
          </div>
        </div>
        
        <div className="bg-muted/30 rounded-lg p-6 border border-border">
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Subtotal</span>
            <span>${totalPrice.toFixed(2)}</span>
          </div>
          <div className="flex justify-between mb-2">
            <span className="text-muted-foreground">Service Fee</span>
            <span>${(totalPrice * 0.1).toFixed(2)}</span>
          </div>
          <Separator className="my-2" />
          <div className="flex justify-between font-medium text-lg">
            <span>Total</span>
            <span>${(totalPrice * 1.1).toFixed(2)}</span>
          </div>
        </div>
        
        <Button type="submit" className="w-full" disabled={isProcessing}>
          {isProcessing ? 'Processing...' : 'Complete Payment'}
        </Button>
      </form>
    </Form>;
};
export default CheckoutForm;