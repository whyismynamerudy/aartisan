import { useAIEnhanced } from "aartisan/react";
import React, { useEffect } from 'react';
import { useLocation } from 'react-router-dom';
interface PageTransitionProps {
  children: React.ReactNode;
}
const PageTransition: React.FC<PageTransitionProps> = ({
  children
}) => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("PageTransition", {
    purpose: "ui-component",
    interactions: []
  });
  const location = useLocation();

  // Scroll to top on route change
  useEffect(() => {
    window.scrollTo(0, 0);
  }, [location.pathname]);
  return <div className="page-transition" ref={ref} {...aiProps}>
      {children}
    </div>;
};
export default PageTransition;