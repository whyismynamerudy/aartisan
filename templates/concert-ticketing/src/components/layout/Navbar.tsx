import { useAIEnhanced } from "aartisan/react";
import React, { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { ShoppingBag, Menu, X } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Button } from '@/components/ui/button';
import { useCart } from '@/context/CartContext';
const Navbar = () => {
  const {
    ref,
    aiProps
  } = useAIEnhanced("Navbar", {
    purpose: "navigation",
    interactions: ["click"]
  });
  const {
    totalItems
  } = useCart();
  const [isScrolled, setIsScrolled] = useState(false);
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 10);
    };
    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Close mobile menu when changing routes
  useEffect(() => {
    setIsMobileMenuOpen(false);
  }, [location.pathname]);
  const navLinks = [{
    name: 'Home',
    path: '/'
  }, {
    name: 'Events',
    path: '/events'
  }, {
    name: 'About',
    path: '/about'
  }];
  return <header className={cn('fixed top-0 left-0 w-full z-50 transition-all duration-300', isScrolled ? 'blurred-backdrop py-2 shadow-sm' : 'bg-transparent py-4')} ref={ref} {...aiProps}>
      <div className="container mx-auto flex items-center justify-between">
        <Link to="/" className="text-2xl font-semibold tracking-tight">
          <span className="bg-gradient-to-r from-primary to-primary/80 bg-clip-text text-transparent">
            Harmony
          </span>
        </Link>

        {/* Desktop Navigation */}
        <nav className="hidden md:flex items-center space-x-8">
          {navLinks.map(link => <Link key={link.path} to={link.path} className={cn('text-sm font-medium transition-colors hover:text-primary', location.pathname === link.path ? 'text-primary' : 'text-foreground/80')}>
              {link.name}
            </Link>)}
        </nav>

        <div className="hidden md:flex items-center space-x-4">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {totalItems}
                </span>}
            </Button>
          </Link>
        </div>

        {/* Mobile Menu Button */}
        <div className="flex md:hidden items-center space-x-2">
          <Link to="/cart" className="relative">
            <Button variant="ghost" size="icon" className="relative">
              <ShoppingBag className="h-5 w-5" />
              {totalItems > 0 && <span className="absolute -top-1 -right-1 h-5 w-5 rounded-full bg-primary text-white text-xs flex items-center justify-center">
                  {totalItems}
                </span>}
            </Button>
          </Link>
          <Button variant="ghost" size="icon" onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}>
            {isMobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </Button>
        </div>

        {/* Mobile Menu */}
        {isMobileMenuOpen && <div className="fixed inset-0 top-16 z-50 bg-background/95 backdrop-blur-sm animate-fade-in md:hidden">
            <nav className="flex flex-col items-center justify-center h-full space-y-8">
              {navLinks.map(link => <Link key={link.path} to={link.path} className={cn('text-lg font-medium transition-colors hover:text-primary', location.pathname === link.path ? 'text-primary' : 'text-foreground/80')}>
                  {link.name}
                </Link>)}
            </nav>
          </div>}
      </div>
    </header>;
};
export default Navbar;