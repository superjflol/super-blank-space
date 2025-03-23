
import React, { useEffect, useState } from 'react';
import { cn } from '@/lib/utils';
import { Link } from 'react-router-dom';
import Button from '../ui-custom/Button';

const Header = () => {
  const [scrolled, setScrolled] = useState(false);

  useEffect(() => {
    const handleScroll = () => {
      setScrolled(window.scrollY > 10);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <header
      className={cn(
        'fixed top-0 left-0 right-0 w-full z-50 transition-all duration-300 py-4 px-6 md:px-8',
        scrolled ? 'glass backdrop-blur-xl border-b border-border/40' : 'bg-transparent'
      )}
    >
      <div className="max-w-7xl mx-auto flex items-center justify-between">
        <Link 
          to="/" 
          className="text-xl font-semibold tracking-tight hover:opacity-80 transition-opacity"
        >
          Blank
        </Link>

        <nav className="hidden md:flex items-center space-x-1">
          {['Home', 'About', 'Contact'].map((item) => (
            <Link
              key={item}
              to={item === 'Home' ? '/' : `/${item.toLowerCase()}`}
              className="relative px-3 py-2 text-sm transition-colors hover:text-foreground/80"
            >
              {item}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-4">
          <Button 
            variant="minimal" 
            size="small"
            className="hidden md:flex"
          >
            Log in
          </Button>
          <Button size="small">
            Get Started
          </Button>
        </div>
      </div>
    </header>
  );
};

export default Header;
