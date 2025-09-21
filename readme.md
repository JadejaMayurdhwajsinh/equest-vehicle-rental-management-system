
---

# 🚗 Vehicle Rental Management System – API Documentation

A **Node.js + Express + Sequelize** backend for managing vehicle rentals, users, bookings, payments, and analytics.
All endpoints are prefixed with:

```
http://localhost:5000/api
```

---

## 🔐 Authentication & Authorization

* **JWT Authentication** → `Authorization: Bearer <token>` required for protected routes.
* **Roles supported**:

  * `admin` → Full access
  * `agent` → Vehicle & maintenance management
  * `customer` → Bookings & profile

---

## 📂 Endpoints Overview

### 1. Auth (`/auth`)

| Method | Endpoint       | Access    | Description                   |
| ------ | -------------- | --------- | ----------------------------- |
| POST   | `/register`    | Public    | Register a new user           |
| POST   | `/login`       | Public    | Authenticate user and get JWT |
| GET    | `/profile`     | Auth User | Get logged-in user profile    |
| GET    | `/profileInfo` | Auth User | Get extended profile info     |

🔹 **Example: Login**

```http
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "secret123"
}
```

Response:

```json
{
  "token": "eyJhbGciOiJIUzI1NiIsInR...",
  "user": { "id": 1, "role": "customer" }
}
```

---

### 2. Users (`/users`)

| Method | Endpoint | Access | Description    |
| ------ | -------- | ------ | -------------- |
| GET    | `/`      | Admin  | Get all users  |
| GET    | `/:id`   | Admin  | Get user by ID |
| PUT    | `/:id`   | Admin  | Update user    |
| DELETE | `/:id`   | Admin  | Delete user    |

---

### 3. Vehicles (`/vehicles`)

| Method | Endpoint      | Access      | Description                         |
| ------ | ------------- | ----------- | ----------------------------------- |
| GET    | `/`           | Public      | Get all vehicles (supports filters) |
| POST   | `/`           | Admin       | Create a vehicle                    |
| PUT    | `/:id`        | Admin/Agent | Update vehicle details              |
| DELETE | `/:id`        | Admin       | Delete a vehicle                    |
| PUT    | `/:id/status` | Agent       | Update vehicle status               |

🔹 **Example: Fetch Vehicles**

```http
GET /api/vehicles?status=available&location=Ahmedabad
Authorization: Bearer <token>
```

---

### 4. Vehicle Categories (`/vehiclesCategory`)

| Method | Endpoint | Access | Description        |
| ------ | -------- | ------ | ------------------ |
| POST   | `/`      | Admin  | Create a category  |
| GET    | `/`      | Public | Get all categories |
| GET    | `/:id`   | Public | Get category by ID |

---

### 5. Bookings (`/bookings`)

| Method | Endpoint        | Access               | Description           |
| ------ | --------------- | -------------------- | --------------------- |
| POST   | `/`             | Customer/Admin       | Create a booking      |
| GET    | `/customer/:id` | Customer             | Get customer bookings |
| GET    | `/agent/:id`    | Agent                | Get agent bookings    |
| PUT    | `/:id/pickup`   | Customer/Admin       | Mark as picked up     |
| PUT    | `/:id/return`   | Customer/Admin       | Mark as returned      |
| DELETE | `/:id/cancel`   | Admin/Agent/Customer | Cancel booking        |

🔹 **Example: Create Booking**

```http
POST /api/bookings
Authorization: Bearer <token>
Content-Type: application/json

{
  "customerId": 2,
  "vehicleId": 1,
  "pickupDate": "2025-09-22",
  "returnDate": "2025-09-24",
  "pickupLocation": "Ahmedabad",
  "returnLocation": "Surat",
  "paymentMethod": "card"
}
```

---

### 6. Customers (`/customers`)

| Method | Endpoint | Access         | Description             |
| ------ | -------- | -------------- | ----------------------- |
| GET    | `/`      | Admin          | Get all customers       |
| GET    | `/:id`   | Admin          | Get customer by ID      |
| PUT    | `/:id`   | Customer/Admin | Update customer profile |
| DELETE | `/:id`   | Customer/Admin | Delete customer account |

---

### 7. Agents (`/agents`)

| Method | Endpoint | Access      | Description     |
| ------ | -------- | ----------- | --------------- |
| GET    | `/`      | Admin       | Get all agents  |
| GET    | `/:id`   | Admin/Agent | Get agent by ID |
| PUT    | `/:id`   | Admin/Agent | Update agent    |
| DELETE | `/:id`   | Admin/Agent | Delete agent    |

---

### 8. Maintenance (`/maintenance`)

| Method | Endpoint              | Access | Description               |
| ------ | --------------------- | ------ | ------------------------- |
| POST   | `/`                   | Agent  | Create maintenance record |
| GET    | `/`                   | Auth   | Get all records           |
| GET    | `/:id`                | Auth   | Get record by ID          |
| PUT    | `/:id`                | Agent  | Update record             |
| DELETE | `/:id`                | Agent  | Delete record             |
| GET    | `/vehicle/:vehicleId` | Auth   | Records by vehicle        |
| GET    | `/agent/records`      | Agent  | Records by agent          |
| GET    | `/analytics/overview` | Auth   | Maintenance overview      |
| GET    | `/analytics/upcoming` | Auth   | Upcoming maintenance      |
| GET    | `/analytics/stats`    | Auth   | Maintenance statistics    |

---

### 9. Payments (`/payments`)

| Method | Endpoint              | Access | Description            |
| ------ | --------------------- | ------ | ---------------------- |
| POST   | `/`                   | Agent  | Create payment         |
| GET    | `/`                   | Auth   | Get all payments       |
| GET    | `/:id`                | Auth   | Get payment by ID      |
| PATCH  | `/:id/status`         | Agent  | Update payment status  |
| POST   | `/:id/refund`         | Agent  | Issue refund           |
| GET    | `/booking/:id`        | Auth   | Get payment by booking |
| GET    | `/analytics/overview` | Auth   | Payment analytics      |
| GET    | `/analytics/stats`    | Auth   | Payment stats          |

---

### 🔟 Analytics (`/analytics`)

| Method | Endpoint                | Access | Description           |
| ------ | ----------------------- | ------ | --------------------- |
| GET    | `/overview`             | Auth   | System overview       |
| GET    | `/bookings`             | Auth   | Booking analytics     |
| GET    | `/revenue`              | Auth   | Revenue analytics     |
| GET    | `/vehicles/utilization` | Auth   | Vehicle utilization   |
| GET    | `/customers`            | Auth   | Customer analytics    |
| GET    | `/maintenance`          | Auth   | Maintenance analytics |
| GET    | `/performance`          | Auth   | Performance metrics   |

---

## ⚙️ Setup

```bash
# Clone repo
git clone <repo-url>
cd backend

# Install dependencies
npm install

# Configure environment
cp .env.example .env

# Run server
npm run dev
```

Example `.env`

```env
PORT=5000
DB_HOST=localhost
DB_USER=root
DB_PASS=yourpassword
DB_NAME=vehiclerental
JWT_SECRET=supersecretjwt
NODE_ENV=development
```

---

## 📌 Notes

* In **development mode**, DB resets with `force: true` → drops & recreates tables.
* Always test APIs with **Postman / Insomnia / Thunder Client**.
* Use **role-based access control** with `requireRole()` and `agentOnly`.

---
