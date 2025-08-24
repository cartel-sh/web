"use client";

import { useState, useEffect } from "react";
import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";
import { RxHamburgerMenu, RxCross2 } from "react-icons/rx";
import Link from "next/link";
import { RollingText } from "@/components/animate-ui/text/rolling";
import { UserMenu } from "@/components/user-menu";

export function Sidebar() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const [isHovered, setIsHovered] = useState(false);
  const [hasAnimated, setHasAnimated] = useState(false);

  const handleNavClick = (
    e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
    sectionId: string | null
  ) => {
    const isHome = window.location.pathname === "/";
    if (isHome && sectionId) {
      e.preventDefault();
      const element = document.getElementById(sectionId);
      if (element) {
        element.scrollIntoView({ behavior: "smooth" });
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
        className="hidden md:flex fixed inset-y-0 left-0 w-64 border-r flex-col items-stretch px-5 py-3 gap-4 shrink-0 z-40 bg-secondary/40"
        aria-label="Sidebar navigation"
      >
        <div className="flex flex-col gap-3">
          <div className="flex items-center justify-between mb-2">
            <Link
              href="/#top"
              onClick={(e) => handleNavClick(e, 'top')}
              className="text-2xl font-bold text-primary font-[family-name:var(--font-stoke)] hover:text-primary transition-colors py-1"
              aria-label="Go to top"
              onMouseEnter={() => {
                if (!hasAnimated) {
                  setIsHovered(true);
                  setHasAnimated(true);
                  setTimeout(() => {
                    setIsHovered(false);
                    setHasAnimated(false);
                  }, 500);
                }
              }}
            >
              {isHovered ? (
                <RollingText transition={{ duration: 0.2, delay: 0.1, ease: 'easeOut' }} text="Cartel" />
              ) : (
                "Cartel"
              )}
            </Link>
            <ModeToggle />
          </div>
          <Link
            href="/#manifesto"
            onClick={(e) => handleNavClick(e, 'manifesto')}
            aria-label="Go to Manifesto section"
          >
            <Button variant="ghost" className="w-full justify-start font-semibold text-base">
              Manifesto
            </Button>
          </Link>
          <Link
            href="/#projects"
            onClick={(e) => handleNavClick(e, 'projects')}
            aria-label="Go to Projects section"
          >
            <Button variant="ghost" className="w-full justify-start font-semibold text-base">
              Projects
            </Button>
          </Link>
          <Link
            href="/#members"
            onClick={(e) => handleNavClick(e, 'members')}
            aria-label="Go to Members section"
          >
            <Button variant="ghost" className="w-full justify-start font-semibold text-base">
              Members
            </Button>
          </Link>
          <Link
            href="/#allies"
            onClick={(e) => handleNavClick(e, 'allies')}
            aria-label="Go to Allies section"
          >
            <Button variant="ghost" className="w-full justify-start font-semibold text-base">
              Allies
            </Button>
          </Link>
          <Link
            href="/#treasury"
            onClick={(e) => handleNavClick(e, 'treasury')}
            aria-label="Go to Treasury section"
          >
            <Button variant="ghost" className="w-full justify-start font-semibold text-base">
              Treasury
            </Button>
          </Link>
          <div className="mt-6">
            <Link href="/apply" aria-label="Go to Apply page">
              <Button size="default" className="font-semibold w-full">Apply</Button>
            </Link>
          </div>
        </div>
        <div className="mt-auto pt-2">
          <UserMenu />
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
          className={`absolute top-0 left-0 h-full w-72 border-r shadow-xl transition-transform duration-300 ease-out ${isMenuOpen ? 'translate-x-0' : '-translate-x-full'} bg-secondary/40 backdrop-blur-sm`}
        >
          <div className="px-5 py-3 flex flex-col gap-4 h-full">
            <div className="flex items-center justify-between mb-4">
              <Link
                href="/#top"
                onClick={(e) => handleNavClick(e, 'top')}
                className="text-2xl font-[family-name:var(--font-stoke)] hover:text-primary transition-colors py-2"
                tabIndex={isMenuOpen ? 0 : -1}
                aria-label="Go to top"
                onMouseEnter={() => {
                  if (!hasAnimated) {
                    setIsHovered(true);
                    setHasAnimated(true);
                    setTimeout(() => {
                      setIsHovered(false);
                      setHasAnimated(false);
                    }, 500);
                  }
                }}
              >
                {isHovered ? (
                  <RollingText text="Cartel" />
                ) : (
                  "Cartel"
                )}
              </Link>
              <ModeToggle />
            </div>
            <Link
              href="/#manifesto"
              onClick={(e) => handleNavClick(e, 'manifesto')}
              aria-label="Go to Manifesto section"
            >
              <Button variant="ghost" className="w-full justify-start font-semibold text-base" tabIndex={isMenuOpen ? 0 : -1}>
                Manifesto
              </Button>
            </Link>
            <Link
              href="/#projects"
              onClick={(e) => handleNavClick(e, 'projects')}
              aria-label="Go to Projects section"
            >
              <Button variant="ghost" className="w-full justify-start font-semibold text-base" tabIndex={isMenuOpen ? 0 : -1}>
                Projects
              </Button>
            </Link>
            <Link
              href="/#members"
              onClick={(e) => handleNavClick(e, 'members')}
              aria-label="Go to Members section"
            >
              <Button variant="ghost" className="w-full justify-start font-semibold text-base" tabIndex={isMenuOpen ? 0 : -1}>
                Members
              </Button>
            </Link>
            <Link
              href="/#aligned"
              onClick={(e) => handleNavClick(e, 'aligned')}
              aria-label="Go to Aligned section"
            >
              <Button variant="ghost" className="w-full justify-start font-semibold text-base" tabIndex={isMenuOpen ? 0 : -1}>
                Aligned
              </Button>
            </Link>
            <Link
              href="/#treasury"
              onClick={(e) => handleNavClick(e, 'treasury')}
              aria-label="Go to Treasury section"
            >
              <Button variant="ghost" className="w-full justify-start font-semibold text-base" tabIndex={isMenuOpen ? 0 : -1}>
                Treasury
              </Button>
            </Link>
            <div className="mt-6">
              <Link href="/apply" className="w-full" aria-label="Go to Apply page">
                <Button
                  size="default"
                  className="font-semibold w-full"
                  tabIndex={isMenuOpen ? 0 : -1}
                >
                  Apply
                </Button>
              </Link>
            </div>
            <div className="mt-auto pt-2">
              <UserMenu />
            </div>
          </div>
        </aside>
      </div>
    </nav>
  );
}


