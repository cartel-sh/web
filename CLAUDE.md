# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Development Commands

- `npm run dev` - Start development server on http://localhost:3000
- `npm run build` - Build for production (outputs static files due to export config)
- `npm run start` - Start production server
- `npm run lint` - Run ESLint (currently disabled in config)

## GitHub Workflow

When creating PRs or comments using `gh`:
- Do NOT use emojis
- Be concise and to the point
- Avoid chitchat or unnecessary pleasantries
- Focus on technical details and implementation

## Architecture Overview

This is a Next.js 15 static site for the Indie Cartel landing page with the following key characteristics:

**Project Structure:**
- App Router architecture in `src/app/`
- Reusable components in `src/components/`
- UI components following shadcn/ui patterns in `src/components/ui/`
- Custom animations in `src/components/animate-ui/`
- Utility functions in `src/lib/`

**Key Technologies:**
- Next.js 15 with static export (`output: "export"` in next.config.ts)
- React 19 with TypeScript
- Tailwind CSS 4 for styling
- next-themes for dark/light theme switching
- Radix UI components for dropdowns and slots
- Motion library for animations
- Roboto font from Google Fonts

**Static Site Configuration:**
- Configured as static export in `next.config.ts` with unoptimized images
- All images stored in `public/images/` (flower assets and skull logo)
- No server-side features - pure client-side rendering

**Component Patterns:**
- Theme provider wrapped around the app in `src/components/providers.tsx`
- Custom UI components extend Radix primitives
- Animation components for text effects (rolling text, gooey morphing)
- Background decorative elements as separate components
- Smooth scrolling navigation between page sections

**Styling Approach:**
- Tailwind utility classes with CSS custom properties for theming
- Responsive design with mobile-first approach
- Custom background/foreground color variables
- Component variants using class-variance-authority pattern

The site is a single-page application showcasing the Indie Cartel manifesto, projects, members, and aligned communities with an artistic floral background design.