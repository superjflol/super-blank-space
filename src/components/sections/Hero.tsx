
import React, { useEffect, useRef } from 'react';
import Button from '../ui-custom/Button';

const Hero = () => {
  const heroRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      if (!heroRef.current) return;
      
      const { clientX, clientY } = e;
      const { left, top, width, height } = heroRef.current.getBoundingClientRect();
      
      const x = (clientX - left) / width - 0.5;
      const y = (clientY - top) / height - 0.5;
      
      heroRef.current.style.setProperty('--x', `${x * 10}px`);
      heroRef.current.style.setProperty('--y', `${y * 10}px`);
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div 
      ref={heroRef}
      className="relative min-h-screen flex flex-col items-center justify-center px-6"
      style={{ 
        perspective: '1000px',
        '--x': '0px',
        '--y': '0px'
      } as React.CSSProperties}
    >
      {/* Background Elements */}
      <div className="absolute inset-0 overflow-hidden opacity-20 pointer-events-none">
        <div className="absolute top-1/4 left-1/4 w-64 h-64 rounded-full bg-blue-500/20 filter blur-3xl" />
        <div className="absolute bottom-1/3 right-1/4 w-80 h-80 rounded-full bg-purple-500/20 filter blur-3xl" />
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto text-center z-10">
        <div className="mb-6 inline-block">
          <span className="text-xs font-medium px-3 py-1 rounded-full bg-secondary/80 text-secondary-foreground inline-block animate-fade-up">
            Simplicity Redefined
          </span>
        </div>
        
        <h1 className="text-4xl md:text-6xl font-semibold leading-tight md:leading-tight tracking-tight mb-4 animate-fade-up">
          Beautifully <span className="text-primary font-bold">Minimal</span>
        </h1>
        
        <p className="text-lg md:text-xl text-muted-foreground mb-8 max-w-3xl mx-auto animate-fade-up opacity-90">
          A harmonious balance of simplicity and elegance, crafted with precision and attention to detail.
        </p>
        
        <div className="flex flex-col sm:flex-row justify-center gap-4 mt-8 mb-16 animate-fade-up">
          <Button size="large">
            Get Started
          </Button>
          <Button variant="minimal" size="large">
            Learn More
          </Button>
        </div>
      </div>
      
      {/* Bottom Decoration */}
      <div 
        className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-border to-transparent w-full max-w-7xl mx-auto"
        style={{ opacity: 0.3 }}
      />
    </div>
  );
};

export default Hero;
