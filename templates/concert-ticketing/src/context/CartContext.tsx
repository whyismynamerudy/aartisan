import { useAIEnhanced } from "aartisan/react";
import React, { createContext, useContext, useState, useEffect } from 'react';
import { toast } from 'sonner';
export type Ticket = {
  id: string;
  eventId: string;
  eventName: string;
  seat: string;
  price: number;
  date: string;
  image: string;
};
type CartContextType = {
  items: Ticket[];
  addItem: (item: Ticket) => void;
  removeItem: (id: string) => void;
  clearCart: () => void;
  totalPrice: number;
  totalItems: number;
};
const CartContext = createContext<CartContextType | undefined>(undefined);
export const CartProvider = ({
  children
}: {
  children: React.ReactNode;
}) => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("CartProvider", {
    purpose: "ui-component",
    interactions: []
  });
  const [items, setItems] = useState<Ticket[]>([]);
  const [totalPrice, setTotalPrice] = useState(0);
  const [totalItems, setTotalItems] = useState(0);
  useEffect(() => {
    setTotalItems(items.length);
    setTotalPrice(items.reduce((total, item) => total + item.price, 0));
  }, [items]);
  const addItem = (item: Ticket) => {
    // Check if the item is already in the cart
    const existingItem = items.find(i => i.id === item.id);
    if (existingItem) {
      toast('This seat is already in your cart');
      return;
    }
    setItems([...items, item]);
    toast.success('Added to cart');
  };
  const removeItem = (id: string) => {
    setItems(items.filter(item => item.id !== id));
    toast('Removed from cart');
  };
  const clearCart = () => {
    setItems([]);
  };
  return <CartContext.Provider value={{
    items,
    addItem,
    removeItem,
    clearCart,
    totalPrice,
    totalItems
  }} ref={ref} {...aiProps}>
      {children}
    </CartContext.Provider>;
};
export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};