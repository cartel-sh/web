"use client";

import { ModeToggle } from "@/components/theme-toggle";
import { Button } from "@/components/ui/button";

export function Navigation() {
  const scrollToSection = (e: React.MouseEvent<HTMLAnchorElement | HTMLButtonElement>, sectionId: string) => {
    e.preventDefault();
    const element = document.getElementById(sectionId);
    if (element) {
      element.scrollIntoView({ behavior: 'smooth' });
    }
  };

  return (
    <nav className="fixed top-0 left-0 right-0 z-50">
      <div className="max-w-full mx-auto px-6 py-4 flex items-center justify-between">
        <div className="flex items-center gap-8">
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
        <ModeToggle />
      </div>
    </nav>
  );
}