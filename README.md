# Cloud-Based Food Delivery System

Full-stack food ordering application: REST APIs for accounts, menus and order processing, a React front end, and MongoDB for storage.

## Tech stack
React (Vite) · Node.js · Express.js · MongoDB (Mongoose) · JWT authentication

## Features
- Register / login (passwords hashed with bcrypt, JWT sessions)
- Browse the menu, add items to a cart, place an order with a delivery address
- Order totals are calculated on the server from database prices
- "My orders" history
- Admin-only endpoints to manage menu items and update order status

## Run locally
Prerequisites: Node.js 18+ and MongoDB running locally (or a MongoDB Atlas connection string).

```
# 1. Backend
cd backend
cp .env.example .env        # then edit MONGO_URI / JWT_SECRET
npm install
npm run seed                # sample menu + admin user
npm run dev                 # http://localhost:5000

# 2. Frontend (new terminal)
cd frontend
npm install
npm run dev                 # http://localhost:5173 (proxies /api to :5000)
```

## API
| Method | Endpoint | Access |
|---|---|---|
| POST | `/api/auth/register`, `/api/auth/login` | public |
| GET | `/api/menu` | public |
| POST/PUT/DELETE | `/api/menu`, `/api/menu/:id` | admin |
| POST | `/api/orders` | logged in |
| GET | `/api/orders/mine` | logged in |
| GET | `/api/orders` | admin |
| PATCH | `/api/orders/:id/status` | admin |

## Cloud deployment (learning notes)
I learned the basics of Google Cloud Platform deployment concepts while building this project. The app is configured through environment variables (`PORT`, `MONGO_URI`, `JWT_SECRET`), so the same code can run locally or on a cloud service such as GCP App Engine / Cloud Run with a MongoDB Atlas database. This repository does not include a live deployment.

## Author
Swapnil Kamble
