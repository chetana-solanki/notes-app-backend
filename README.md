# Notes App Backend

Backend API for the Notes App built with Node.js, Express, and MongoDB.

## Features

- User signup and login
- JWT-based authentication
- Create, fetch, update, and delete notes
- MongoDB connection with Mongoose

## Clone and install

```bash
git clone https://github.com/<your-username>/notes-app-backend.git
cd notes-app-backend
npm install
```

## Environment setup

Create a `.env` file in the project root:

```env
MONGO_URL=your_mongodb_connection_string
PORT=5000
```

Example:

```env
MONGO_URL=mongodb://127.0.0.1:27017/inotebook
PORT=5000
```

## Run locally

Start the backend:

```bash
npm start
```

For development with auto-restart:

```bash
npm run dev
```

The API will run at:

- `http://localhost:5000`

## Important

The frontend expects this backend to be available on port `5000` by default.

## Available scripts

- `npm start` - run the server
- `npm run dev` - run with nodemon