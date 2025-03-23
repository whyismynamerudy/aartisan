import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
const Hero = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Hero", {
    purpose: "ui-component",
    interactions: []
  });
  return <div className="relative min-h-screen flex items-center justify-center overflow-hidden" ref={ref} {...aiProps}>
      <div className="absolute inset-0 z-0 bg-cover bg-center" style={{
      backgroundImage: 'url(https://images.unsplash.com/photo-1501612780327-45045538702b?q=80&w=2070&auto=format&fit=crop)',
      filter: 'brightness(0.3)'
    }} />
      
      <div className="absolute inset-0 bg-gradient-to-b from-black/60 to-black/30 z-10" />
      
      <div className="container relative z-20 px-4 animate-slide-up">
        <div className="max-w-4xl mx-auto text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 tracking-tight">Experience Music Like Never Before</h1>
          <p className="text-lg md:text-xl mb-8 text-white/80 leading-relaxed max-w-2xl mx-auto">
            Discover and book the best concerts around the world with a seamless ticket booking experience.
          </p>
          
          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Button asChild size="lg" className="bg-primary hover:bg-primary/90 text-white">
              <Link to="/events">
                Browse Events <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="border-white/20 bg-white/10 text-white hover:bg-white/20">
              <Link to="/about">
                Learn More
              </Link>
            </Button>
          </div>
        </div>
      </div>
    </div>;
};
export default Hero;