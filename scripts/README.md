# Database Seeding Scripts

## Overview

This directory contains scripts for seeding your Supabase database with initial data.

## Setup

1. Make sure your Supabase environment variables are configured:
   - `EXPO_PUBLIC_SUPABASE_URL` - Your Supabase project URL
   - `EXPO_PUBLIC_SUPABASE_ANON_KEY` - Your Supabase anon key (for basic operations)
   - `SUPABASE_SERVICE_ROLE_KEY` - Your Supabase service role key (recommended for seeding)

2. Install dependencies:
   ```bash
   npm install
   ```

## Migration Script (`migrate.ts`)

Creates the `mini_apps` table with proper schema if it doesn't exist. Includes:
- Primary table structure with all required columns
- Indexes for performance (featured apps, category)
- Auto-updating `updated_at` timestamp trigger

### Usage

```bash
npm run migrate
```

## Seed Script (`seed.ts`)

Seeds the `mini_apps` table with sample data including:
- Weather Pro (Featured)
- Task Master
- Color Palette (Featured)  
- Quick Calculator
- Meditation Timer (Featured)

### Usage

**Seed database (automatically runs migrations if needed):**
```bash
npm run seed
```

**Clear existing data and seed:**
```bash
npm run seed:clear
```

**Run migrations only:**
```bash
npm run migrate
```

**Direct execution:**
```bash
npx tsx ./scripts/seed.ts
npx tsx ./scripts/seed.ts --clear
```

### Features

- ✅ Checks for existing data before seeding
- ✅ Provides `--clear` flag to remove existing data
- ✅ Uses proper TypeScript types
- ✅ Comprehensive error handling
- ✅ Detailed logging with emojis
- ✅ Uses the same mock data as your app

### Environment Variables

The script will use your service role key if available (recommended for admin operations), otherwise it will fall back to the anon key.

For production seeding, it's recommended to use the service role key:
```bash
SUPABASE_SERVICE_ROLE_KEY=your_service_role_key_here
```

## Table Schema

The seed script expects a `mini_apps` table with the following columns:
- `id` (text, primary key)
- `name` (text)
- `description` (text)
- `icon_url` (text, optional)
- `bundle_url` (text, optional)
- `version` (text)
- `category` (text)
- `rating` (numeric, optional)
- `downloads` (numeric, optional)
- `created_at` (timestamp, auto-generated)
- `updated_at` (timestamp, auto-generated)
- `is_featured` (boolean, optional)
- `tags` (text array, optional) 