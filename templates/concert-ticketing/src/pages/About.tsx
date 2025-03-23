import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import { Music, Globe, Users, Shield } from 'lucide-react';
import PageTransition from '@/components/layout/PageTransition';
const About = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("About", {
    purpose: "ui-component",
    interactions: []
  });
  return <PageTransition ref={ref} {...aiProps}>
      <div className="pt-24 pb-16">
        <div className="container mx-auto px-4">
          <div className="max-w-3xl mx-auto">
            <h1 className="text-3xl font-bold mb-2">About Harmony</h1>
            <p className="text-muted-foreground mb-8">
              Your premium destination for concert tickets and unforgettable musical experiences.
            </p>
            
            <div className="prose prose-lg max-w-none">
              <p>
                Harmony was founded in 2023 with a simple mission: to connect music lovers with unforgettable live experiences through a seamless, elegant ticket purchasing platform.
              </p>
              
              <p>
                What sets us apart is our commitment to a premium user experience. We believe that buying tickets should be just as enjoyable as the event itself. That's why we've designed our platform with simplicity and elegance in mind, focusing on what truly matters: helping you secure the best seats without the usual hassle and confusion.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Core Values</h2>
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 my-8">
                <div className="bg-card rounded-lg p-6 border border-border">
                  <Music className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-medium mb-2">Passion for Music</h3>
                  <p className="text-muted-foreground">We're music enthusiasts ourselves, which drives our commitment to creating exceptional experiences for fellow fans.</p>
                </div>
                
                <div className="bg-card rounded-lg p-6 border border-border">
                  <Globe className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-medium mb-2">Global Reach</h3>
                  <p className="text-muted-foreground">We connect fans with artists around the world, bringing diverse musical experiences to audiences everywhere.</p>
                </div>
                
                <div className="bg-card rounded-lg p-6 border border-border">
                  <Users className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-medium mb-2">Fan-First Approach</h3>
                  <p className="text-muted-foreground">Every feature on our platform is designed with the fan experience in mind, from browsing to checkout.</p>
                </div>
                
                <div className="bg-card rounded-lg p-6 border border-border">
                  <Shield className="h-8 w-8 text-primary mb-3" />
                  <h3 className="text-lg font-medium mb-2">Secure & Transparent</h3>
                  <p className="text-muted-foreground">We believe in clear pricing and secure transactions, with no hidden fees or surprises at checkout.</p>
                </div>
              </div>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Our Story</h2>
              
              <p>
                Harmony began when a group of music industry professionals and tech enthusiasts identified a common frustration: existing ticket platforms were often cluttered, confusing, and didn't properly showcase the events they were selling.
              </p>
              
              <p>
                We set out to create something different — a platform that celebrates the artistry of live music through a carefully designed user experience. Every detail, from the typography to the intuitive seat selection, has been thoughtfully crafted to enhance your journey from discovery to purchase.
              </p>
              
              <p>
                Today, we partner with venues, artists, and promoters worldwide to bring you exclusive access to the most anticipated concerts, with the premium experience you deserve.
              </p>
              
              <h2 className="text-2xl font-semibold mt-8 mb-4">Join Us</h2>
              
              <p>
                Whether you're a casual concertgoer or a dedicated fan who never misses a tour, Harmony is designed for you. We invite you to experience the difference a truly fan-focused ticket platform can make.
              </p>
              
              <p>
                Discover events, select your perfect seat, and complete your purchase with confidence — all with the elegance and simplicity that defines the Harmony experience.
              </p>
            </div>
          </div>
        </div>
      </div>
    </PageTransition>;
};
export default About;