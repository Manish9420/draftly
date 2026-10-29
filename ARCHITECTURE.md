# Draftly — Architecture Notes

## 1. Overview

Draftly is a web-based document editor built with Next.js, React, and PostgreSQL. The application uses Prisma to interact with the database and is deployed on Vercel.

## 2. Architecture

```text
User's Browser
      |
      v
Next.js Frontend
      |
      v
Next.js API Routes
      |
      v
Prisma ORM
      |
      v
Supabase PostgreSQL
```

## 3. Technology Responsibilities

- **Next.js and React:** Render the user interface and manage document editing interactions.
- **TipTap:** Provide rich-text editing capabilities.
- **Next.js API routes:** Handle document creation, retrieval, updates, and deletion.
- **Prisma:** Query and update PostgreSQL data.
- **Supabase PostgreSQL:** Persist document content, metadata, users, and sharing records.
- **Vercel:** Host the deployed application.

## 4. Document Data Flow

1. The frontend requests the existing documents from the API.
2. The API retrieves document data from PostgreSQL through Prisma.
3. When a user creates a document, the frontend sends a request to the API.
4. The API validates the input and stores the document in the database.
5. Editing a document triggers an update request to persist its content.
6. The frontend reloads saved documents from the API when the application is reopened.

## 5. Data Model

The Prisma schema defines three main models:

- **User:** Stores user information.
- **Document:** Stores the document title, rich-text content, owner, and timestamps.
- **DocumentShare:** Represents document-sharing records and assigned roles.

The schema includes owner, editor, and viewer role values for document sharing. However, the complete authentication and authorization flow is not implemented, so these records do not currently provide secure collaboration.

## 6. Validation and Error Handling

API endpoints validate document input before performing database operations. API errors are returned to the frontend so failed operations can be handled by the interface.

## 7. Current Limitations

- Authentication is not fully connected to document ownership.
- Secure access control for shared documents is incomplete.
- Real-time collaboration is not implemented.
- The current implementation should not be treated as production-ready.

## 8. Future Improvements

- Integrate authenticated user sessions with document ownership.
- Enforce owner, editor, and viewer permissions on every relevant API request.
- Implement real-time collaborative editing.
- Expand automated tests and improve database error handling.
