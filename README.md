This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Content Management

This project uses JSON files for managing dynamic content across the site:

### Members (`src/data/members.json`)
Manages the "Public Members" section with clickable badges styled similar to web3.bio. Each member entry includes:
- `id`: Unique identifier
- `name`: Display name
- `handle`: Web3 handle or address
- `avatar`: Avatar image URL (uses web3.bio API)
- `link`: External profile link
- `badge`: Badge type (e.g., "ethereum", "nouns")

### Projects (`src/data/projects.json`)
Manages the "Projects" section with project cards and maintainers. Each project entry includes:
- `id`: Unique identifier
- `name`: Project name
- `description`: Project description
- `link`: Project link
- `maintainers`: Array of member IDs who maintain the project

### Aligned Communities (`src/data/communities.json`)
Manages the "Aligned Communities" section. Each community entry includes:
- `id`: Unique identifier
- `name`: Community name
- `description`: Community description
- `link`: Community website link

To add, remove, or modify content in any of these sections, simply edit the corresponding JSON file.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
