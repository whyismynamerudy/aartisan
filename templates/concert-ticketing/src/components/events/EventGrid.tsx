import { useAIEnhanced } from "aartisan/react";
import React, { useState } from 'react';
import { Link } from 'react-router-dom';
import { Calendar, MapPin, Search } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { events } from '@/data/events';
const EventGrid = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("EventGrid", {
    purpose: "ui-component",
    interactions: ["change", "click"]
  });
  const [searchTerm, setSearchTerm] = useState('');
  const filteredEvents = events.filter(event => event.name.toLowerCase().includes(searchTerm.toLowerCase()) || event.venue.toLowerCase().includes(searchTerm.toLowerCase()));
  return <div className="py-12" ref={ref} {...aiProps}>
      <div className="container mx-auto px-4">
        <div className="max-w-md mx-auto mb-12">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input type="text" placeholder="Search events or venues..." className="pl-10" value={searchTerm} onChange={e => setSearchTerm(e.target.value)} />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredEvents.length > 0 ? filteredEvents.map(event => <div key={event.id} className="group bg-card rounded-lg overflow-hidden border border-border transition-all hover:shadow-md animate-scale-in">
                <div className="relative h-48 overflow-hidden">
                  <img src={event.image} alt={event.name} className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105" />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/60 to-transparent" />
                </div>
                
                <div className="p-5">
                  <div className="flex justify-between items-start mb-3">
                    <h3 className="text-lg font-medium line-clamp-1">{event.name}</h3>
                    <span className="text-sm font-medium text-primary">${event.minPrice}+</span>
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
              </div>) : <div className="col-span-full text-center py-12">
              <h3 className="text-xl font-medium mb-2">No events found</h3>
              <p className="text-muted-foreground mb-4">
                We couldn't find any events matching your search.
              </p>
              <Button variant="outline" onClick={() => setSearchTerm('')}>
                Clear Search
              </Button>
            </div>}
        </div>
      </div>
    </div>;
};
export default EventGrid;