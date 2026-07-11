# Chennai City Plots

Chennai City Plots is a real estate platform for discovering, comparing, and enquiring about residential and commercial plots in Chennai. The application includes a user-facing property experience and an admin dashboard for managing listings, leads, and site visits.

## Overview

This project provides a complete property marketplace experience with:

- Property search and filtering
- Detailed property pages with images, maps, and amenities
- Wishlist and comparison features
- Site visit scheduling and inquiry forms
- Admin tools for managing properties, leads, and visits
- Responsive design for desktop and mobile users

## Tech Stack

- React 18 + TypeScript
- Vite
- Tailwind CSS
- Supabase Auth and Database
- Prisma
- React Router DOM
- Leaflet / React-Leaflet
- Node.js

## Features

### User Features
- Browse available properties
- Search by locality, price, size, and type
- Save favorite properties to wishlist
- Compare properties side by side
- Book site visits
- Submit property inquiries

### Admin Features
- Manage properties and listings
- Track and update leads
- Approve and manage site visits
- Access dashboard insights
- Control admin access and permissions

## Project Structure

```bash
src/
  components/      # Reusable UI components
  pages/           # Application pages and routes
  layouts/         # Shared page layouts
  lib/             # Utilities, hooks, and integrations
prisma/            # Prisma schema and migrations
public/            # Static assets and SEO files
supabase/          # Database schema and server functions
```

## Getting Started

### Prerequisites

- Node.js 18+
- npm or yarn
- A Supabase project

### Installation

1. Clone the repository
   ```bash
   git clone https://github.com/aaruhyakumar2006/ChennaiCityPlots.git
   cd ChennaiCityPlots
   ```

2. Install dependencies
   ```bash
   npm install
   ```

3. Create the environment file
   ```bash
   cp .env.example .env
   ```

4. Configure the required environment variables in the `.env` file.

5. Start the development server
   ```bash
   npm run dev
   ```

The application will be available at http://localhost:5173.

## Environment Variables

Use the following environment variables:

```env
VITE_SUPABASE_URL=your_supabase_url
VITE_SUPABASE_ANON_KEY=your_supabase_anon_key
VITE_SITE_URL=https://your-domain.com
VITE_GROQ_API_KEY=your_groq_key_optional
VITE_CLOUDINARY_CLOUD_NAME=your_cloud_name_optional
VITE_CLOUDINARY_UPLOAD_PRESET=your_upload_preset_optional
```

## Database Setup

The repository includes SQL and Prisma resources for setting up the application data model. Use the provided Supabase schema files to initialize your database.

## Available Scripts

```bash
npm run dev
npm run build
npm run preview
npm run lint
npm run sitemap
```

## Deployment

The project can be deployed on platforms such as Vercel, Netlify, or any hosting service that supports Vite-based applications. A Vercel configuration is included in the repository.

## Contributing

Contributions are welcome. Please open an issue or submit a pull request for any improvements.

## Contact

For project-related questions or collaboration opportunities, please use the repository issues or contact the maintainer.
