import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import Hero from '@/components/home/Hero';
import FeaturedEvents from '@/components/home/FeaturedEvents';
import PageTransition from '@/components/layout/PageTransition';
const Index = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Index", {
    purpose: "ui-component",
    interactions: []
  });
  return <PageTransition ref={ref} {...aiProps}>
      <Hero />
      <FeaturedEvents />
    </PageTransition>;
};
export default Index;