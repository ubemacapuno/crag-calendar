# Crag Calendar

Track your bouldering climbs with Crag Calendar! Crag Calendar is your bouldering companion, designed to help climbers track their progress and celebrate their achievements. Its intuitive interface and powerful features make it the perfect tool to record your climbs.

> **Note:** This project is currently in active development. I'm building Crag Calendar in public to share my passion for climbing and app dev!

## Key Features (In Development)

 - Interactive Calendar: Click on a day to log your climbs on a day-to-day basis
 - Detailed Climb Logging: Record essential information for each climb:
     * Bouldering grade
     * Description of the problem
     * Number of attempts
     * Climb completion
 - User Authentication: Secure login to keep your climbing data private
 - Progress Tracking: Visualize your improvement over time

## Current Status

Crag Calendar is in its early stages. Here's a rough overview of current MVP progress:

- [x] Project setup and configuration
- [x] Basic user authentication
- [x] Interactive calendar implementation
- [x] Climb logging functionality
- [ ] Basic filtering for climbing data
- [ ] User profile and settings
- [ ] Data visualization for progress tracking

## Stack

- Linting / Code Style
  - [eslint](https://www.npmjs.com/package/eslint)
    - [eslint-config-prettier](https://www.npmjs.com/package/eslint-config-prettier)
      - [ESLint | Next.js](https://nextjs.org/docs/app/building-your-application/configuring/eslint#prettier)
    - [eslint-plugin-check-file](https://www.nvpmjs.com/package/eslint-plugin-check-file)
      - [Bulletproof React Guide](https://github.com/alan2207/bulletproof-react/blob/master/docs/project-standards.md#file-naming-conventions)
    - [eslint-plugin-n](https://www.npmjs.com/package/eslint-plugin-n)
  - [prettier](https://www.npmjs.com/package/prettier)
    - [@trivago/prettier-plugin-sort-imports](https://www.npmjs.com/package/@trivago/prettier-plugin-sort-imports)
    - [prettier-plugin-tailwindcss](https://www.npmjs.com/package/prettier-plugin-tailwindcss)
      - [Automatic Class Sorting](https://tailwindcss.com/blog/automatic-class-sorting-with-prettier#how-classes-are-sorted)
- Environment Variables
  - [dotenv](https://www.npmjs.com/package/dotenv)
  - [dotenv-expand](https://www.npmjs.com/package/dotenv-expand)
  - [@t3-oss/env-nextjs](https://www.npmjs.com/package/@t3-oss/env-nextjs)
    - [Documentation](https://env.t3.gg/docs/nextjs)
  - [cross-env](https://www.npmjs.com/package/cross-env)
- Styles / UI
  - [tailwindcss](https://www.npmjs.com/package/tailwindcss)
  - [shadcn](https://ui.shadcn.com/docs/installation/next)
  - [next-themes](https://www.npmjs.com/package/next-themes)
  - [lucide icons](https://lucide.dev/icons/)
- Validation
  - [zod](https://www.npmjs.com/package/zod)
  - [@conform-to/zod](https://www.npmjs.com/package/@conform-to/zod)
    - [Conform | Next.js](https://conform.guide/integration/nextjs)
  - [drizzle-zod](https://www.npmjs.com/package/drizzle-zod)
    - [Drizzle Zod Docs](https://orm.drizzle.team/docs/zod)
- Forms
  - [@conform-to/react](https://www.npmjs.com/package/@conform-to/react)
- Database
  - [drizzle-orm](https://www.npmjs.com/package/drizzle-orm)
  - [postgres](https://www.npmjs.com/package/postgres)
  - [drizzle-kit](https://www.npmjs.com/package/drizzle-kit)
- Authentication
  - [next-auth](https://www.npmjs.com/package/next-auth)
  - [@auth/drizzle-adapter](https://www.npmjs.com/package/@auth/drizzle-adapter)
    - [Auth.js Drizzle Adapter Documentation](https://authjs.dev/getting-started/adapters/drizzle)


## Setup

1. Install dependencies:

```sh
pnpm install
```

2. Copy the `.env` file:

```sh
cp .env.example .env
```

3. Update the following values in the `.env` file:

```sh
NEXTAUTH_SECRET=your-value-here
GOOGLE_CLIENT_ID=your-value-here
GOOGLE_CLIENT_SECRET=your-value-here
```

4. Start the database:

```sh
docker compose up
```

5. Migrate the database:

```sh
pnpm run db:migrate
```

6. Start the app:

```sh
pnpm run dev
```

## Future Improvements
Here are some exciting features I'd like to implement in the future:
 - Tagging System: Add tags to your climbs for easy filtering and organization
 - Expanded Grading Systems:
     * Incorporate the Fontainebleau grading system for bouldering
     * Add support for rope/route climbing grades


