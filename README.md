# BANATRICS API

A RESTful API built with NestJS for the Banatrics platform. It manages drivers, advertising campaigns, earnings, and user data. The application uses a PostgreSQL database with Drizzle ORM for database interactions.

## Features

-   User Authentication (JWT-based)
-   User, Vehicle, and Bank Details Management
-   Advertising Campaign Management
-   Driver Earnings and Payment Tracking
-   Image and File Uploads via Cloudinary
-   Email Notifications
-   Background Job Processing with Bull
-   Dashboard for analytics

## Prerequisites

-   Node.js (v22.x or later recommended)
-   PostgreSQL
-   NPM

## Installation

1.  Clone the repository:
    ```bash
    git clone <repository-url>
    ```
2.  Navigate to the project directory:
    ```bash
    cd lite-transpose-banatrics
    ```
3.  Install the dependencies:
    ```bash
    npm install
    ```

## Configuration

The application requires the following environment variables. Create a `.env` file in the root of the project and add the following variables:

```
# Application Port
PORT=3000

# PostgreSQL Database Connection URL
DATABASE_URL="postgresql://user:password@host:port/database"

# Resend API for sending emails
RESEND_API_KEY="your-resend-api-key"
EMAIL_FROM="you@yourdomain.com"

# Cloudinary for file storage
CLOUDINARY_CLOUD_NAME="your-cloudinary-name"
CLOUDINARY_API_KEY="your-cloudinary-api-key"
CLOUDINARY_API_SECRET="your-cloudinary-api-secret"

# JWT Secrets for Authentication
JWT_SECRET="your-jwt-secret"
JWT_ACCESS_TOKEN_SECRET="your-jwt-access-token-secret"
JWT_REFRESH_TOKEN_SECRET="your-jwt-refresh-token-secret"
PASSWORD_RESET_TOKEN_SECRET="your-password-reset-secret"
```

## Database Setup

This project uses Drizzle ORM to manage the database schema.

1.  **Generate Migrations:**
    After changing the schema in `src/db/`, you can generate a new migration file:
    ```bash
    npx drizzle-kit generate
    ```

2.  **Apply Migrations:**
    To apply the migrations to your database:
    ```bash
    npx drizzle-kit migrate
    ```

## Running the Application

You can run the application in different modes using the npm scripts defined in `package.json`.

-   **Development Mode:**
    The application will watch for file changes and automatically restart.
    ```bash
    npm run start:dev
    ```

-   **Production Mode:**
    First, build the application, then run the compiled JavaScript.
    ```bash
    npm run build
    npm run start:prod
    ```
-   **Debug Mode:**
    ```bash
    npm run start:debug
    ```

## API Documentation

API documentation is available through Swagger UI. Once the application is running, you can access it at:

-   **URL:** `/api/v1/api-docs`
-   **Base URL:** `/api/v1`

The documentation provides details on all available endpoints, required parameters, and response models. Authentication is handled via JWT Bearer tokens.

## Testing

The project includes unit and end-to-end (E2E) tests.

-   **Run all unit tests:**
    ```bash
    npm run test
    ```
-   **Run unit tests with coverage report:**
    ```bash
    npm run test:cov
    ```
-   **Run E2E tests:**
    ```bash
    npm run test:e2e
    ```

## Project Structure

The source code is organized into modules, with each module representing a major feature of the application.

```
src/
├── auth/            # Authentication and authorization
├── bank-details/    # User bank account management
├── campaign/        # Advertising campaign management
├── dashboard/       # Endpoints for dashboard analytics
├── db/              # Drizzle ORM schema and configuration
├── earning/         # Driver earnings tracking
├── email/           # Email sending service
├── notification/    # User notifications
├── package/         # Package/subscription management
├── payment/         # Payment processing
├── users/           # User management
├── vehicle-details/ # User vehicle management
├── weekly-proofs/   # Weekly proof submissions
├── main.ts          # Application entry point
└── app.module.ts    # Root application module
```

## Scripts

The following scripts are available in `package.json`:

-   `npm run build`: Compiles the TypeScript source code.
-   `npm run format`: Formats the code using Prettier.
-   `npm run start`: Runs the application from the `dist` directory.
-   `npm run start:dev`: Runs the application in development watch mode.
-   `npm run start:prod`: Runs the application in production mode.
-   `npm run lint`: Lints the codebase.
<!-- -   `npm run test`: Runs unit tests.
-   `npm run test:watch`: Runs unit tests in watch mode.
-   `npm run test:cov`: Generates a test coverage report.
-   `npm run test:e2e`: Runs end-to-end tests. -->

## Deployment

To deploy the application, first build the project:

```bash
npm run build
```

Then, run the main file from the `dist` directory:

```bash
npm run start:prod
```

Ensure that all required environment variables are set in the production environment.

## License

This project is UNLICENSED.