"use client";

import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
    setIsMenuOpen(false);
  };

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };

    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const nav = document.getElementById('mobile-menu');
      const button = document.getElementById('menu-button');
      if (isMenuOpen && nav && button && !nav.contains(event.target as Node) && !button.contains(event.target as Node)) {
        setIsMenuOpen(false);
      }
    };

    if (isMenuOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isMenuOpen]);

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        <div className="hidden md:flex items-center gap-8">
          <a
            href="#manifesto"
            onClick={(e) => scrollToSection(e, 'manifesto')}
            className="text-base font-semibold hover:text-primary transition-colors"
          >
            Manifesto
          </a>
          <a
            href="#projects"
            onClick={(e) => scrollToSection(e, 'projects')}
            className="text-base font-semibold hover:text-primary transition-colors"
          >
            Projects
          </a>
          <a
            href="#members"
            onClick={(e) => scrollToSection(e, 'members')}
            className="text-base font-semibold hover:text-primary transition-colors"
          >
            Members
          </a>
          <Button
            onClick={(e) => scrollToSection(e, 'apply')}
            size="default"
            className="font-semibold"
          >
            Apply
          </Button>
        </div>

        <button
          id="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="md:hidden relative w-10 h-10 flex flex-col items-center justify-center gap-1.5 focus:outline-none"
          aria-label="Toggle mobile menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          <span 
            className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-out ${
              isMenuOpen ? 'rotate-45 translate-y-2' : ''
            }`}
          />
          <span 
            className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-out ${
              isMenuOpen ? 'opacity-0' : ''
            }`}
          />
          <span 
            className={`block w-6 h-0.5 bg-current transition-all duration-300 ease-out ${
              isMenuOpen ? '-rotate-45 -translate-y-2' : ''
            }`}
          />
        </button>

        <ModeToggle />
      </div>

      <div
        id="mobile-menu"
        className={`md:hidden fixed top-16 left-0 right-0 bg-background/95 backdrop-blur-sm border-b transition-all duration-300 ease-out ${
          isMenuOpen ? 'opacity-100 translate-y-0' : 'opacity-0 -translate-y-full pointer-events-none'
        }`}
        aria-hidden={!isMenuOpen}
      >
        <div className="px-6 py-6 flex flex-col gap-4">
          <a
            href="#manifesto"
            onClick={(e) => scrollToSection(e, 'manifesto')}
            className="text-base font-semibold hover:text-primary transition-colors py-2"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Manifesto
          </a>
          <a
            href="#projects"
            onClick={(e) => scrollToSection(e, 'projects')}
            className="text-base font-semibold hover:text-primary transition-colors py-2"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Projects
          </a>
          <a
            href="#members"
            onClick={(e) => scrollToSection(e, 'members')}
            className="text-base font-semibold hover:text-primary transition-colors py-2"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Members
          </a>
          <Button
            onClick={(e) => scrollToSection(e, 'apply')}
            size="default"
            className="font-semibold w-full mt-2"
            tabIndex={isMenuOpen ? 0 : -1}
          >
            Apply
          </Button>
        </div>
      </div>
    </nav>
  );
}