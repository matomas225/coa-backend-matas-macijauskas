# COA Backend - Matas Macijauskas

A Node.js backend application for a music streaming service, providing APIs for song and album handling, with authentication and file uploads.

## Features

- User registration and authentication using JWT
- Song and album management
- File uploads for songs and album covers
- Secure API endpoints with validation
- MongoDB database integration
- CORS support for frontend integration

## Tech Stack

- **Runtime**: Node.js
- **Framework**: Express.js
- **Database**: MongoDB with Mongoose ODM
- **Authentication**: JSON Web Tokens (JWT) with bcrypt for password hashing
- **File Uploads**: Multer
- **Validation**: Express-validator and Joi schemas
- **CORS**: Enabled for cross-origin requests
- **Environment**: dotenv for configuration
- **Development**: Nodemon for hot reloading

## Prerequisites

- Node.js (v14 or higher)
- Docker and Docker Compose (for MongoDB)
- npm or yarn

## Installation

1. Clone the repository:

   ```bash
   git clone <repository-url>
   cd coa-backend-matas-macijauskas
   ```

2. Install dependencies:

   ```bash
   npm install
   ```

3. Set up environment variables:
   Create a `.env` file in the root directory with the following variables:

   ```
   MONGO_URI=mongodb://localhost:27017/coa-music-app
   JWT_SECRET=your-secret-key-here
   BACKEND_PORT=3001
   CORS_ALLOWED_ORIGINS=http://localhost:5173
   ```

4. Start MongoDB using Docker Compose:

   ```bash
   docker-compose up -d
   ```

## Running the Application

### Development Mode

```bash
npm run dev
```

This starts the server with nodemon for automatic restarts on file changes.

### Production Mode

```bash
npm start
```

This starts the server using Node.js directly.

The server will run on `http://localhost:3001` (or the port specified in `BACKEND_PORT`).

## API Endpoints

### Users

- `POST /users/register` - Register a new user
- `POST /users/login` - Login user
- `GET /users/profile` - Get user profile (authenticated)

### Songs

- `GET /songs` - Get all songs
- `POST /songs` - Upload a new song (authenticated)
- `GET /songs/:id` - Get song by ID
- `PUT /songs/:id` - Update song (authenticated)
- `DELETE /songs/:id` - Delete song (authenticated)

### Albums

- `GET /albums` - Get all albums
- `POST /albums` - Create a new album (authenticated)
- `GET /albums/:id` - Get album by ID
- `PUT /albums/:id` - Update album (authenticated)
- `DELETE /albums/:id` - Delete album (authenticated)

## Project Structure

```
src/
├── config/
│   └── db.js                 # Database configuration
├── controllers/              # Route handlers
│   ├── albumController.js
│   ├── songController.js
│   └── userController.js
├── middleware/               # Custom middleware
│   ├── authenticateJwt.js    # JWT authentication
│   ├── corsOptions.js
│   ├── uploadMiddleware.js   # File upload handling
│   └── validationMiddleware.js
├── models/                   # Mongoose models
│   ├── albumModel.js
│   ├── songModel.js
│   └── userModel.js
├── routes/                   # API routes
│   ├── albumRoutes.js
│   ├── songRoutes.js
│   └── userRoutes.js
├── services/                 # Business logic
│   ├── songService.js
│   └── userService.js
├── uploads/                  # Uploaded files
│   ├── album-covers/
│   ├── images/
│   └── songs/
└── validation/               # Validation schemas
    ├── albumValidation.js
    ├── songValidation.js
    └── userValidation.js
```
