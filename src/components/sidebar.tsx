"use client";

import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import Link from "next/link";

export function Sidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    sectionId: string | null
  ) => {
    const isHome = window.location.pathname === "/";
    if (isHome) {
      e.preventDefault();
      if (!sectionId) {
        window.scrollTo({ top: 0, behavior: "smooth" });
      } else {
        const element = document.getElementById(sectionId);
        if (element) {
          element.scrollIntoView({ behavior: "smooth" });
        }
      }
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
    <nav className="relative z-50">
      {/* Mobile hamburger button */}
      <div className="md:hidden fixed top-4 left-4 flex items-center gap-2">
        <button
          id="menu-button"
          onClick={() => setIsMenuOpen(!isMenuOpen)}
          className="relative size-9 flex items-center justify-center focus:outline-none rounded-md border bg-background shadow-xs hover:bg-accent dark:bg-input/30 dark:border-input dark:hover:bg-input/50 transition-colors outline-none focus-visible:border-ring focus-visible:ring-ring/50 focus-visible:ring-[3px] text-foreground"
          aria-label="Toggle mobile menu"
          aria-expanded={isMenuOpen}
          aria-controls="mobile-menu"
        >
          {isMenuOpen ? (
            <RxCross2 className="h-[1rem] w-[1rem] transition-transform duration-300" />
          ) : (
            <RxHamburgerMenu className="h-[1rem] w-[1rem] transition-transform duration-300" />
          )}
        </button>
      </div>

      {/* Desktop sidebar in normal flow */}
      <aside
        className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r flex-col items-stretch px-5 py-6 gap-4 shrink-0 z-40"
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col gap-3">
          <Link
            href="/"
            onClick={(e) => handleNavClick(e, null)}
            className="text-base font-semibold hover:text-primary transition-colors py-1"
            aria-label="Go to top"
          >
            Cartel
          </Link>
          <Link
            href="/#manifesto"
            onClick={(e) => handleNavClick(e, 'manifesto')}
            className="text-base font-semibold hover:text-primary transition-colors py-1"
            aria-label="Go to Manifesto section"
          >
            Manifesto
          </Link>
          <Link
            href="/#projects"
            onClick={(e) => handleNavClick(e, 'projects')}
            className="text-base font-semibold hover:text-primary transition-colors py-1"
            aria-label="Go to Projects section"
          >
            Projects
          </Link>
          <Link
            href="/#members"
            onClick={(e) => handleNavClick(e, 'members')}
            className="text-base font-semibold hover:text-primary transition-colors py-1"
            aria-label="Go to Members section"
          >
            Members
          </Link>
          <ModeToggle />
        </div>
        <div className="mt-auto pt-2">
          <Link href="/apply" aria-label="Go to Apply page">
            <Button size="default" className="font-semibold w-full">Apply</Button>
          </Link>
        </div>
      </aside>

      {/* Mobile drawer + overlay */}
      <div
        id="mobile-menu"
        className={`md:hidden fixed inset-0 transition-opacity ${isMenuOpen ? 'opacity-100' : 'opacity-0 pointer-events-none'}`}
        aria-hidden={!isMenuOpen}
      >
        <div
          className="absolute inset-0 bg-black/40"
          onClick={() => setIsMenuOpen(false)}
          aria-hidden="true"
        />
        <aside
          role="dialog"
          aria-modal="true"
          className={`absolute top-0 left-0 h-full w-72 border-r shadow-xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'}`}
        >
          <div className="px-5 py-6 flex flex-col gap-4 h-full bg-background">
            <Link
              href="/"
              onClick={(e) => handleNavClick(e, null)}
              className="text-base font-semibold hover:text-primary transition-colors py-2"
              tabIndex={isMenuOpen ? 0 : -1}
              aria-label="Go to top"
            >
              Cartel
            </Link>
            <Link
              href="/#manifesto"
              onClick={(e) => handleNavClick(e, 'manifesto')}
              className="text-base font-semibold hover:text-primary transition-colors py-2"
              tabIndex={isMenuOpen ? 0 : -1}
              aria-label="Go to Manifesto section"
            >
              Manifesto
            </Link>
            <Link
              href="/#projects"
              onClick={(e) => handleNavClick(e, 'projects')}
              className="text-base font-semibold hover:text-primary transition-colors py-2"
              tabIndex={isMenuOpen ? 0 : -1}
              aria-label="Go to Projects section"
            >
              Projects
            </Link>
            <Link
              href="/#members"
              onClick={(e) => handleNavClick(e, 'members')}
              className="text-base font-semibold hover:text-primary transition-colors py-2"
              tabIndex={isMenuOpen ? 0 : -1}
              aria-label="Go to Members section"
            >
              Members
            </Link>
            <ModeToggle />
            <div className="mt-auto pt-2">
              <Link href="/apply" className="w-full" aria-label="Go to Apply page">
                <Button
                  size="default"
                  className="font-semibold w-full mt-2"
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  Apply
                </Button>
              </Link>
            </div>
          </div>
        </aside>
      </div>
    </nav>
  );
}


