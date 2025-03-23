import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import { Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Ticket, useCart } from '@/context/CartContext';
type CartItemProps = {
  item: Ticket;
};
const CartItem: React.FC<CartItemProps> = ({
  item
}) => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("CartItem", {
    purpose: "list-item",
    interactions: ["click"]
  });
  const {
    removeItem
  } = useCart();
  return <div className="flex items-center gap-4 p-4 border-b last:border-0 animate-slide-up" ref={ref} {...aiProps}>
      <div className="relative aspect-[3/2] w-24 rounded-md overflow-hidden flex-shrink-0">
        <img src={item.image} alt={item.eventName} className="w-full h-full object-cover" />
      </div>
      
      <div className="flex-1 min-w-0">
        <h3 className="font-medium line-clamp-1">{item.eventName}</h3>
        <div className="text-sm text-muted-foreground space-y-1 mt-1">
          <p>Seat: {item.seat}</p>
          <p>Date: {item.date}</p>
        </div>
      </div>
      
      <div className="flex flex-col items-end gap-2">
        <span className="font-medium">${item.price}</span>
        <Button variant="ghost" size="icon" className="h-8 w-8 text-muted-foreground hover:text-destructive" onClick={() => removeItem(item.id)}>
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>;
};
export default CartItem;