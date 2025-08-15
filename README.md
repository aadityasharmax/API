# DreamHub API

A RESTful API built with **Node.js**, **Express**, and **MongoDB** for managing users, listings, categories, and locations.  
It includes authentication, authorization, image upload, and seeding utilities — ready to be integrated into a full-stack application.

---

## 🚀 Features

- **User Authentication & Authorization**
  - JWT-based authentication
  - Role-based access control
  - Token blacklisting for secure logout
- **Listings Management**
  - Create, update, delete, and view listings
  - Image upload support
- **Categories & Locations**
  - CRUD operations
  - Seeder scripts to populate default data
- **Email Utility**
  - Send transactional emails via `sendEmail.js`
- **Data Validation**
  - Middleware-based request validation

---

## 🛠 Tech Stack

- **Backend**: Node.js, Express.js
- **Database**: MongoDB (Mongoose ODM)
- **Authentication**: JWT
- **File Upload**: Multer
- **Email**: Nodemailer
- **Other Tools**: dotenv, bcryptjs

---

## 📂 Folder Structure

API-main/
├── controllers/ # Route handlers
├── middleware/ # Auth, role, upload, and validators
├── models/ # Mongoose schemas
├── public/assets/ # Static files (logos, etc.)
├── routes/ # API route definitions
├── seeders/ # Seeder scripts for DB
├── utils/ # Utility functions (e.g., sendEmail)
├── server.js # App entry point
├── package.json
└── .gitignore

---

## ⚙️ Installation & Setup

1. **Clone the repository**
   ```bash
   git clone https://github.com/yourusername/DreamHub-API.git
   cd DreamHub-API
   
2. **Install dependencies**
   ```bash
   npm install

3. **Setup environment variables**
   ```bash
   MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/dbname
   JWT_SECRET=your_jwt_secret
   EMAIL_USER=your_email@example.com
   EMAIL_PASS=your_email_password

4. **Run database seeders (optional)**
   ```bash
   node seeders/categorySeeder.js
   node seeders/locationSeeder.js
   node seeders/seedUsers.js

5. **Start the development server**
   ```bash
   npm run dev

## 📡 API Endpoints

**Auth**
Method	Endpoint	Description
POST - /api/auth/register	Register a new user
POST - /api/auth/login	Login user
POST - /api/auth/logout	Logout user

**Listings**
Method	Endpoint	Description
GET -	/api/listings	Get all listings
POST -	/api/listings	Create new listing
GET -	/api/listings/:id	Get listing by ID
PUT -	/api/listings/:id	Update listing
DELETE -	/api/listings/:id	Delete listing


## 🧪 Running in Production

  ```bash
   npm run dev
```

## 🤝 Contribution

1. Fork the repository

2. Create a new feature branch (git checkout -b feature-name)

3.  Commit your changes (git commit -m 'Add some feature')

4.  Push to the branch (git push origin feature-name)

5. Open a Pull Request

