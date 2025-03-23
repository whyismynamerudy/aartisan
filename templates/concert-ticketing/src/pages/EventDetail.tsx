import { useAIEnhanced } from "aartisan/react";
import React, { useMemo } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Calendar, Clock, MapPin, ArrowLeft } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Separator } from '@/components/ui/separator';
import { events } from '@/data/events';
import SeatMap from '@/components/events/SeatMap';
import PageTransition from '@/components/layout/PageTransition';
const EventDetail = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("EventDetail", {
    purpose: "ui-component",
    interactions: ["click"]
  });
  const {
    id
  } = useParams<{
    id: string;
  }>();
  const navigate = useNavigate();
  const event = useMemo(() => events.find(event => event.id === id), [id]);
  if (!event) {
    navigate('/events');
    return null;
  }
  return <PageTransition ref={ref} {...aiProps}>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <Button variant="ghost" className="mb-6 flex items-center gap-1 text-muted-foreground hover:text-foreground" onClick={() => navigate(-1)}>
            <ArrowLeft className="h-4 w-4" />
            Back
          </Button>
          
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
            <div className="lg:col-span-2">
              <div className="rounded-lg overflow-hidden">
                <img src={event.image} alt={event.name} className="w-full h-64 object-cover md:h-80" />
              </div>
              
              <div className="mt-6">
                <h1 className="text-3xl font-bold">{event.name}</h1>
                
                <div className="flex flex-wrap gap-4 mt-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Clock className="h-4 w-4 mr-2" />
                    <span>{event.time}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.venue}</span>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div>
                  <h2 className="text-xl font-semibold mb-4">About This Event</h2>
                  <p className="text-muted-foreground leading-relaxed">
                    {event.description}
                  </p>
                </div>
                
                <SeatMap eventId={event.id} eventName={event.name} date={event.date} image={event.image} />
              </div>
            </div>
            
            <div className="lg:col-span-1">
              <div className="bg-card rounded-lg border border-border p-6 sticky top-24">
                <h2 className="text-xl font-semibold mb-4">Event Information</h2>
                
                <div className="space-y-4">
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Date & Time</h3>
                    <p className="mt-1">{event.date} at {event.time}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Location</h3>
                    <p className="mt-1">{event.venue}</p>
                  </div>
                  
                  <div>
                    <h3 className="text-sm font-medium text-muted-foreground">Price Range</h3>
                    <p className="mt-1">${event.minPrice} - ${event.maxPrice}</p>
                  </div>
                </div>
                
                <Separator className="my-6" />
                
                <div className="space-y-4">
                  <p className="text-sm text-muted-foreground">
                    Select your seats from the seat map below. Prices vary based on seating location.
                  </p>
                  
                  <div className="grid grid-cols-2 gap-4">
                    <Button asChild variant="outline" className="w-full">
                      <Link to="/cart">View Cart</Link>
                    </Button>
                    <Button asChild className="w-full">
                      <Link to="/checkout">Checkout</Link>
                    </Button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>;
};
export default EventDetail;