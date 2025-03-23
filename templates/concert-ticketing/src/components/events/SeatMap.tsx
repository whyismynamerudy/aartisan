import { useAIEnhanced } from "aartisan/react";
import React, { useState } from 'react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { Ticket, useCart } from '@/context/CartContext';
type SeatMapProps = {
  eventId: string;
  eventName: string;
  date: string;
  image: string;
};
const SEAT_ROWS = ['A', 'B', 'C', 'D', 'E'];
const SEAT_COLUMNS = [1, 2, 3, 4, 5, 6, 7, 8];
const getRandomStatus = (): 'available' | 'reserved' | 'unavailable' => {
  const statuses: Array<'available' | 'reserved' | 'unavailable'> = ['available', 'reserved', 'unavailable'];
  const weights = [0.7, 0.2, 0.1]; // 70% available, 20% reserved, 10% unavailable

  const randomValue = Math.random();
  let weightSum = 0;
  for (let i = 0; i < statuses.length; i++) {
    weightSum += weights[i];
    if (randomValue <= weightSum) {
      return statuses[i];
    }
  }
  return 'available';
};
type SeatType = {
  id: string;
  row: string;
  column: number;
  price: number;
  status: 'available' | 'reserved' | 'unavailable' | 'selected';
};
const generateSeats = (): SeatType[] => {
  const seats: SeatType[] = [];
  SEAT_ROWS.forEach(row => {
    SEAT_COLUMNS.forEach(column => {
      const price = row === 'A' ? 150 : row === 'B' ? 125 : row === 'C' ? 100 : row === 'D' ? 75 : 50;
      seats.push({
        id: `${row}${column}`,
        row,
        column,
        price,
        status: getRandomStatus()
      });
    });
  });
  return seats;
};
const SeatMap: React.FC<SeatMapProps> = ({
  eventId,
  eventName,
  date,
  image
}) => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("SeatMap", {
    purpose: "ui-component",
    interactions: ["click", "click"]
  });
  const [seats, setSeats] = useState<SeatType[]>(generateSeats());
  const {
    addItem
  } = useCart();
  const selectSeat = (seatId: string) => {
    setSeats(prevSeats => prevSeats.map(seat => seat.id === seatId ? {
      ...seat,
      status: seat.status === 'selected' ? 'available' : 'selected'
    } : seat));
  };
  const selectedSeats = seats.filter(seat => seat.status === 'selected');
  const addToCart = (seat: SeatType) => {
    const ticket: Ticket = {
      id: `${eventId}-${seat.id}`,
      eventId,
      eventName,
      seat: `${seat.row}${seat.column}`,
      price: seat.price,
      date,
      image
    };
    addItem(ticket);

    // Reset selection after adding to cart
    setSeats(prevSeats => prevSeats.map(s => s.id === seat.id ? {
      ...s,
      status: 'reserved'
    } : s));
  };
  return <div className="mt-8" ref={ref} {...aiProps}>
      <h3 className="text-xl font-semibold mb-6">Select Your Seats</h3>
      
      <div className="relative overflow-x-auto">
        <div className="flex justify-center mb-8">
          <div className="inline-flex items-center justify-center px-16 py-3 text-sm bg-secondary rounded-md">
            STAGE
          </div>
        </div>
        
        <div className="grid justify-center gap-y-4 mb-8">
          {SEAT_ROWS.map(row => <div key={row} className="flex items-center gap-2">
              <div className="w-6 text-center font-medium text-sm">{row}</div>
              <div className="flex gap-2">
                {seats.filter(seat => seat.row === row).map(seat => <button key={seat.id} className={cn("w-8 h-8 text-xs rounded-md flex items-center justify-center transition-all duration-300", seat.status === 'available' && "bg-secondary hover:bg-primary/20 cursor-pointer", seat.status === 'selected' && "bg-primary text-white hover:bg-primary/80", seat.status === 'reserved' && "bg-accent cursor-not-allowed", seat.status === 'unavailable' && "bg-muted cursor-not-allowed opacity-50")} disabled={seat.status === 'reserved' || seat.status === 'unavailable'} onClick={() => selectSeat(seat.id)} aria-label={`Seat ${seat.row}${seat.column}`} title={`Seat ${seat.row}${seat.column} - $${seat.price}`}>
                      {seat.column}
                    </button>)}
              </div>
              <div className="w-6"></div>
            </div>)}
        </div>
        
        <div className="flex justify-center gap-8 mb-8">
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-secondary rounded-sm"></div>
            <span className="text-sm">Available</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-primary rounded-sm"></div>
            <span className="text-sm">Selected</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-accent rounded-sm"></div>
            <span className="text-sm">Reserved</span>
          </div>
          <div className="flex items-center gap-2">
            <div className="w-4 h-4 bg-muted opacity-50 rounded-sm"></div>
            <span className="text-sm">Unavailable</span>
          </div>
        </div>
      </div>
      
      {selectedSeats.length > 0 && <div className="bg-muted/30 rounded-lg p-6 border border-border">
          <h4 className="font-medium mb-4">Selected Seats</h4>
          <div className="divide-y divide-border">
            {selectedSeats.map(seat => <div key={seat.id} className="py-3 flex justify-between items-center">
                <div>
                  <p className="font-medium">Seat {seat.row}{seat.column}</p>
                  <p className="text-sm text-muted-foreground">Row {seat.row} - ${seat.price}</p>
                </div>
                <Button size="sm" onClick={() => addToCart(seat)}>
                  Add to Cart
                </Button>
              </div>)}
          </div>
          <div className="mt-4 pt-4 border-t border-border">
            <div className="flex justify-between items-center">
              <span className="font-medium">Total:</span>
              <span className="font-medium">${selectedSeats.reduce((sum, seat) => sum + seat.price, 0)}</span>
            </div>
          </div>
        </div>}
    </div>;
};
export default SeatMap;