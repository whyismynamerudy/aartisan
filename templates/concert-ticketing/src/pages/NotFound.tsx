import { useAIEnhanced } from "aartisan/react";
import React from 'react';
import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';
import { Button } from '@/components/ui/button';
import PageTransition from '@/components/layout/PageTransition';
const NotFound = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("NotFound", {
    purpose: "ui-component",
    interactions: []
  });
  return <PageTransition ref={ref} {...aiProps}>
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center px-4">
          <h1 className="text-8xl font-bold text-primary mb-4">404</h1>
          <h2 className="text-2xl font-semibold mb-2">Page Not Found</h2>
          <p className="text-muted-foreground max-w-md mx-auto mb-8">
            The page you're looking for doesn't exist or has been moved to another URL.
          </p>
          <Button asChild>
            <Link to="/" className="flex items-center gap-2">
              <Home className="h-4 w-4" />
              Back to Home
            </Link>
          </Button>
        </div>
      </div>
    </PageTransition>;
};
export default NotFound;