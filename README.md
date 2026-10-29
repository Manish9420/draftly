# Draftly — Collaborative Document Editor

Draftly is a web-based document editor built as part of the Full Stack Product Engineer AI-Native take-home assessment for Ajaia LLC.

The application allows users to create, edit, rename, and manage documents through a simple document editing interface. It uses a PostgreSQL database to persist document data.

## Live Demo

- **Live Application:** [https://draftly-coral-zeta.vercel.app/](https://draftly-coral-zeta.vercel.app/)
- **GitHub Repository:** [https://github.com/Manish9420/draftly](https://github.com/Manish9420/draftly)

## Features

- Create and manage documents.
- Edit document titles and content.
- Rich-text formatting with bold, italic, underline, headings, and lists.
- Automatically save document changes.
- Persist documents in PostgreSQL.
- Reopen existing documents after refreshing the application.
- Delete documents.
- Responsive web interface.

**Note:** Authentication and secure collaboration/sharing are not fully implemented. The sharing interface should not be considered production-ready.

## Tech Stack

- **Frontend:** Next.js, React, JavaScript
- **Styling:** Tailwind CSS
- **Rich-text editor:** TipTap
- **Database:** PostgreSQL through Supabase
- **ORM:** Prisma
- **Deployment:** Vercel
- **Package manager:** pnpm

## Getting Started

### Prerequisites

Install Node.js and pnpm before running the project locally.

### 1. Clone the repository

```bash
git clone https://github.com/Manish9420/draftly.git
cd draftly
```

### 2. Install dependencies

```bash
pnpm install
```

### 3. Configure environment variables

Create a `.env` file in the project root for the Prisma database connection:

```env
DATABASE_URL="your-postgresql-connection-string"
```

Configure the required Supabase public environment variables in `.env.local` according to the existing application setup:

```env
NEXT_PUBLIC_SUPABASE_URL="your-supabase-project-url"
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY="your-supabase-publishable-key"
```

Never commit database passwords, private API keys, or other secrets to GitHub.

### 4. Generate Prisma Client

```bash
pnpm exec prisma generate --config prisma7.config.ts
```

### 5. Start the development server

```bash
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000) in your browser.

## Database

Draftly uses PostgreSQL hosted on Supabase. Prisma manages database access and the application's database schema.

The database connection must be configured correctly for the local environment and deployment environment.

## Deployment

The application is deployed on Vercel. Environment variables must be configured in the Vercel project settings.

The deployed application uses Supabase PostgreSQL for persistent storage.

## Current Limitations

- User authentication is not fully integrated with document ownership and authorization.
- Secure document sharing and collaborator permissions are incomplete.
- The application is a take-home assessment implementation and is not yet production-ready.

## Future Improvements

- Complete authentication and session management.
- Implement secure document sharing and access control.
- Add real-time collaborative editing.
- Add automated tests for document operations.
- Improve database connection reliability and error handling.

## Author

**Manish Chaudhari**

- GitHub: [https://github.com/Manish9420](https://github.com/Manish9420)
