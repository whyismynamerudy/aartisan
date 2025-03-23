import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import EventGrid from '@/components/events/EventGrid';
import PageTransition from '@/components/layout/PageTransition';
const Events = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Events", {
    purpose: "ui-component",
    interactions: []
  });
  return <PageTransition ref={ref} {...aiProps}>
      <div className="pt-24 pb-16 bg-secondary/30">
        <div className="container mx-auto px-4">
          <h1 className="text-3xl font-bold mb-2">Events</h1>
          <p className="text-muted-foreground">Browse and book tickets for upcoming concerts</p>
        </div>
      </div>
      <EventGrid />
    </PageTransition>;
};
export default Events;