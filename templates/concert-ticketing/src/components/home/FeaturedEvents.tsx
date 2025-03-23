import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';
import { events } from '@/data/events';
const FeaturedEvents = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("FeaturedEvents", {
    purpose: "ui-component",
    interactions: []
  });
  // Get only featured events (first 3)
  const featuredEvents = events.slice(0, 3);
  return <section className="py-24 bg-secondary/30" ref={ref} {...aiProps}>
      <div className="container mx-auto px-4">
        <div className="max-w-3xl mx-auto text-center mb-16">
          <h2 className="text-3xl font-bold mb-4">Featured Events</h2>
          <p className="text-muted-foreground">
            Discover the most anticipated concerts and secure your tickets before they sell out.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {featuredEvents.map((event, index) => <div key={event.id} className={cn("group relative bg-card rounded-lg overflow-hidden shadow-sm transition-all hover:shadow-md", "animate-fade-in", {
          "animation-delay-100": index === 0
        }, {
          "animation-delay-200": index === 1
        }, {
          "animation-delay-300": index === 2
        })}>
              <div className="relative h-56 overflow-hidden">
                <img src={event.image} alt={event.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
              </div>
              
              <div className="p-5">
                <div className="flex justify-between items-start mb-3">
                  <h3 className="text-lg font-medium line-clamp-1">{event.name}</h3>
                  <span className="text-sm font-medium text-primary">${event.minPrice}</span>
                </div>
                
                <div className="space-y-2 mb-4">
                  <div className="flex items-center text-sm text-muted-foreground">
                    <Calendar className="h-4 w-4 mr-2" />
                    <span>{event.date}</span>
                  </div>
                  <div className="flex items-center text-sm text-muted-foreground">
                    <MapPin className="h-4 w-4 mr-2" />
                    <span>{event.venue}</span>
                  </div>
                </div>
                
                <Button asChild variant="outline" className="w-full mt-2">
                  <Link to={`/events/${event.id}`}>View Details</Link>
                </Button>
              </div>
            </div>)}
        </div>
        
        <div className="mt-12 text-center">
          <Button asChild variant="outline" className="group">
            <Link to="/events">
              View All Events 
              <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
            </Link>
          </Button>
        </div>
      </div>
    </section>;
};
export default FeaturedEvents;