# RAG Chat Documentation

Documentation site for the RAG Chat application, built with [Fumadocs](https://fumadocs.dev).

## Getting Started

### Install Dependencies

From the monorepo root:

```bash
pnpm install
```

### Run Development Server

```bash
cd apps/app-docs
pnpm dev
```

The docs will be available at `http://localhost:3002`.

### Build for Production

```bash
pnpm build
```

## Project Structure

```
apps/app-docs/
├── app/                  # Next.js app directory
│   ├── docs/            # Documentation routes
│   ├── layout.tsx       # Root layout
│   └── page.tsx         # Home page
├── content/             # MDX documentation files
│   └── docs/
│       ├── index.mdx
│       ├── getting-started.mdx
│       ├── features/
│       ├── architecture.mdx
│       └── api-reference/
├── lib/                 # Utilities
│   └── source.ts       # Fumadocs source config
└── components/          # React components (if needed)
```

## Writing Documentation

### Creating a New Page

1. Create an MDX file in `content/docs/`:

```mdx
---
title: My New Page
description: A brief description
---

## Content goes here

Write your documentation using MDX.
```

2. Add the page to the navigation in the relevant `meta.json`:

```json
{
  "title": "Section Name",
  "pages": ["existing-page", "my-new-page"]
}
```

### MDX Components

Fumadocs provides several built-in components:

- `<Callout>`: Highlight important information
- `<Card>`: Display content in a card
- `<Tabs>`: Create tabbed content
- `<Code>`: Syntax-highlighted code blocks

## Deployment

The documentation can be deployed to Vercel:

```bash
vercel --prod
```

Or configure automatic deployments via the Vercel dashboard.

## Tech Stack

- **Framework**: Next.js 16
- **Documentation**: Fumadocs
- **Styling**: Tailwind CSS v4
- **Content**: MDX

## Learn More

- [Fumadocs Documentation](https://fumadocs.dev)
- [Next.js Documentation](https://nextjs.org/docs)
- [MDX Documentation](https://mdxjs.com)
