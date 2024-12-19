## About project

This project is backend Website GoShoes. This project is built with ReactJS, Laravel, Docker, Redis, MySQL, JWT, Bcrypt, and other libraries. This project is a simple backend project that has some features such as ecommerce project. This project is built for learning purposes only.

## How to run this project

1. Clone this project to your local machine. You can use this command to clone this project.

```bash
git clone https://github.com/felixngyx/GoShoes.git
```

2. Change directory to GoShoes

```bash
cd GoShoes
cd backend
```

3. Run this command to build the docker container

```bash
docker-compose up --build
```

4. Copy the .env.example file to .env file and run the following command

```bash
cp .env.example .env
g
php artisan key:generate
php artisan jwt:secret
```

5. Run the following command to migrate the database

```bash
php artisan migrate
```

5. Run the following command to start the server

```bash
php artisan serve
php artisan queue:work
php artisan schedule:work

```

6. Open your browser and go to http://localhost:8000

# Laravel Backend Project Documentation

## Table of Contents

1. [Introduction](#introduction)
2. [Prerequisites](#prerequisites)
3. [Installation](#installation)
4. [Configuration](#configuration)
5. [Database Setup](#database-setup)
6. [Directory Structure](#directory-structure)
7. [Routes](#routes)
8. [Controllers](#controllers)
9. [Middleware](#middleware)
10. [Models](#models)
11. [Migrations](#migrations)
12. [Seeders](#seeders)
13. [API Documentation](#api-documentation)
14. [Testing](#testing)
15. [Deployment](#deployment)
16. [Troubleshooting](#troubleshooting)
17. [Contributing](#contributing)
18. [License](#license)

---

## 1. Introduction

This project is a backend application built using **Laravel**, a powerful and modern PHP framework. It provides RESTful APIs for managing resources and business logic.

The project follows a **clean code** and **MVC architecture** structure to ensure maintainability, scalability, and efficiency.

---

## 2. Prerequisites

Before you begin, ensure you meet the following requirements:

-   **PHP** >= 8.1
-   **Composer** >= 2.0
-   **Laravel** >= 9.x
-   **Database**: MySQL / PostgreSQL / SQLite
-   **Node.js** >= 14.x (optional, for frontend dependencies like Vite)
-   **Git** for version control
-   Web Server (Apache/Nginx)

---

## 3. Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/laravel-backend.git
cd laravel-backend
```

### Install Dependencies

Install project dependencies using Composer:

```bash
composer install
```

---

## 4. Configuration

### Create `.env` File

Copy the `.env.example` file and rename it as `.env`:

```bash
cp .env.example .env
```

### Update Environment Variables

Configure the database connection and application URL:

```dotenv
APP_NAME=LaravelBackend
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### Generate Application Key

```bash
php artisan key:generate
```

---

## 5. Database Setup

### Migrate the Database

Run the migration files to set up the database schema:

```bash
php artisan migrate
```

### Seed the Database (Optional)

Seed sample data for testing purposes:

```bash
php artisan db:seed
```

---

## 6. Directory Structure

-   **`app/`**: Contains core application files (Models, Controllers, etc.).
-   **`routes/`**: API and web route definitions.
-   **`database/`**: Migrations, seeders, and factories.
-   **`resources/`**: Views and frontend assets.
-   **`tests/`**: Unit and feature tests.
-   **`storage/`**: Logs, cache, and user-uploaded files.
-   **`public/`**: Public assets like images, JS, and CSS.

---

## 7. Routes

Routes are defined in `routes/api.php` and `routes/web.php`.

Example API route:

```php
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

Run the following command to view all routes:

```bash
php artisan route:list
```

---

## 8. Controllers

Controllers handle requests and contain application logic.

Example Controller:

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'User list']);
    }
}
```

---

## 9. Middleware

Middleware filters HTTP requests before reaching controllers.

Register middleware in `app/Http/Kernel.php`.

To create custom middleware:

```bash
php artisan make:middleware CustomMiddleware
```

---

## 10. Models

Models represent database tables and handle data manipulation.

Example Model:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];
}
```

---

## 11. Migrations

Migrations define the database schema.

Create a migration file:

```bash
php artisan make:migration create_users_table
```

---

## 12. Seeders

Seeders populate the database with test data.

Create a seeder:

```bash
php artisan make:seeder UserSeeder
```

Run the seeder:

```bash
php artisan db:seed --class=UserSeeder
```

---

## 13. API Documentation

To document APIs, this project uses tools like Postman or Swagger.

Example:

```json
GET /api/users
Response: {
    "data": [
        {"id": 1, "name": "John Doe"}
    ]
}
```

---

## 14. Testing

Run tests using PHPUnit:

```bash
php artisan test
```

Create a test:

```bash
php artisan make:test UserTest
```

---

## 15. Deployment

### Prepare for Deployment

-   Optimize the application:

```bash
php artisan optimize
```

-   Set `APP_ENV=production` in `.env`.

### Deployment Tools

Use tools like Laravel Forge, Envoyer, or manual deployment.

---

## 16. Troubleshooting

Common issues and solutions:

1. **Storage Permission Error**:

    ```bash
    chmod -R 777 storage/
    ```

2. **Config Cache**:
    ```bash
    php artisan config:cache
    ```

---

## 17. Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch.
3. Commit changes.
4. Open a pull request.

---

## 18. License

This project is open-source and available under the MIT License.

# API Documentation - Laravel E-commerce System

This document provides a comprehensive overview of all API endpoints available in this Laravel-based e-commerce system. These routes handle everything from **authentication**, **products**, **posts**, **categories**, **orders**, **refunds**, **notifications**, and more.

---

## Table of Contents

1. [Introduction](#introduction)
2. [Authentication Routes](#authentication-routes)
3. [Product Management](#product-management)
4. [Product Variants](#product-variants)
5. [Color Management](#color-management)
6. [Size Management](#size-management)
7. [Brand Management](#brand-management)
8. [Post Categories](#post-categories)
9. [Posts Management](#posts-management)
10. [Banners](#banners)
11. [Categories](#categories)
12. [Statistical Routes](#statistical-routes)
13. [Contact Management](#contact-management)
14. [User Profile](#user-profile)
15. [Order Management](#order-management)
16. [Discount Management](#discount-management)
17. [Wishlist Management](#wishlist-management)
18. [Cart Management](#cart-management)
19. [Review Management](#review-management)
20. [Shipping Management](#shipping-management)
21. [Notifications](#notifications)
22. [Refund Management](#refund-management)
23. [Payment Integration](#payment-integration)
24. [Admin Routes](#admin-routes)
25. [Client Routes](#client-routes)
26. [Installation](#installation)
27. [Project Structure](#project-structure)
28. [Running Tests](#running-tests)
29. [Contributing](#contributing)
30. [License](#license)
31. [Contact](#contact)
32. [Security Considerations](#security-considerations)
33. [API Versioning](#api-versioning)
34. [Error Handling](#error-handling)
35. [Performance Optimization](#performance-optimization)
36. [Deployment Guidelines](#deployment-guidelines)
37. [Troubleshooting](#troubleshooting)
38. [Changelog](#changelog)

---

## 1. Introduction

Welcome to the **Laravel E-commerce API**. This project is designed to provide a fully functional backend system for managing e-commerce operations such as products, orders, users, and payments. Built on the **Laravel framework**, it is robust, scalable, and easy to extend.

This document serves as a detailed guide to all available API endpoints, installation steps, and contribution guidelines.

With its modular structure, developers can seamlessly integrate new features and extend existing ones. The API supports advanced features like **JWT-based authentication**, **RESTful standards**, and **pagination** for optimized data management.

---

## 2. Authentication Routes

**Prefix:** `/auth`

| METHOD | URL                  | CONTROLLER/ACTION                           | DESCRIPTION             |
| ------ | -------------------- | ------------------------------------------- | ----------------------- |
| POST   | `/register`          | `AuthController::registerController`        | Register a new user     |
| POST   | `/register-verify`   | `AuthController::registerVerifyController`  | Verify registration     |
| POST   | `/login`             | `AuthController::loginController`           | Log in user             |
| POST   | `/refresh-token`     | `AuthController::refreshTokenController`    | Refresh JWT token       |
| POST   | `/send-verify-email` | `AuthController::sendEmailVerifyController` | Send verification email |

### Usage Example:

#### Register a new user:

```bash
POST /api/auth/register
```

**Request Body:**

```json
{
    "name": "John Doe",
    "email": "johndoe@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "success": true,
    "message": "User registered successfully!",
    "data": {
        "user": {
            "id": 1,
            "name": "John Doe",
            "email": "johndoe@example.com"
        }
    }
}
```

### Login User Example:

#### Log in an existing user:

```bash
POST /api/auth/login
```

**Request Body:**

```json
{
    "email": "johndoe@example.com",
    "password": "password123"
}
```

**Response:**

```json
{
    "success": true,
    "message": "Login successful!",
    "data": {
        "access_token": "jwt-token-example",
        "token_type": "Bearer",
        "expires_in": 3600
    }
}
```

---

## 3. Product Management

Endpoints to manage products.

**Base Route:** `/products`

| METHOD | URL                      | CONTROLLER/ACTION                        | DESCRIPTION                   |
| ------ | ------------------------ | ---------------------------------------- | ----------------------------- |
| GET    | `/products/trashed`      | `ProductController::trashedProducts`     | Get all trashed products      |
| POST   | `/products/restore/{id}` | `ProductController::restore`             | Restore a specific product    |
| POST   | `/restore-multiple`      | `ProductController::restoreMultiple`     | Restore multiple products     |
| GET    | `/products/{id}`         | `ProductController::show`                | Get product by ID             |
| PUT    | `/products/{id}`         | `ProductController::updateProduct`       | Update product                |
| DELETE | `/products/{id}`         | `ProductController::destroy`             | Delete product                |
| GET    | `/products`              | `ProductController::index`               | Get all products              |
| POST   | `/products`              | `ProductController::createProduct`       | Create new product            |
| GET    | `/admin/products/{id}`   | `ProductController::getProductForAdmin`  | Get product details for admin |
| GET    | `/client/products/{id}`  | `ProductController::getProductForClient` | Get product for client        |
| GET    | `/productDetail/{id}`    | `ProductController::getDetailProduct`    | Get product detail            |

### Usage Example:

#### Get all products:

```bash
GET /api/products
```

**Response:**

```json
{
    "success": true,
    "data": [
        {
            "id": 1,
            "name": "Product 1",
            "price": 100,
            "stock": 50
        },
        {
            "id": 2,
            "name": "Product 2",
            "price": 200,
            "stock": 20
        }
    ]
}
```

---

## 4. Product Variants

**Base Route:** `/admin/product_variants`

| METHOD | URL            | CONTROLLER/ACTION                      | DESCRIPTION                      |
| ------ | -------------- | -------------------------------------- | -------------------------------- |
| POST   | `/delete-many` | `ProductVariantController::deleteMany` | Delete multiple product variants |
| DELETE | `/{id}`        | `ProductVariantController::deleteOne`  | Delete single product variant    |

### Usage Example:

#### Delete multiple variants:

```bash
POST /api/admin/product_variants/delete-many
```

**Request Body:**

```json
{
    "ids": [1, 2, 3]
}
```

**Response:**

```json
{
    "success": true,
    "message": "Variants deleted successfully."
}
```

---

## 5. Color Management

**Base Route:** `/colors`

| METHOD | URL            | CONTROLLER/ACTION                  | DESCRIPTION            |
| ------ | -------------- | ---------------------------------- | ---------------------- |
| GET    | `/colors`      | `ColorController::index`           | Get all colors         |
| POST   | `/colors`      | `ColorController::store`           | Create a new color     |
| GET    | `/colors/{id}` | `ColorController::show`            | Get color by ID        |
| PUT    | `/colors/{id}` | `ColorController::update`          | Update color           |
| DELETE | `/colors/{id}` | `ColorController::destroy`         | Delete single color    |
| DELETE | `/colors`      | `ColorController::destroyMultiple` | Delete multiple colors |

### Usage Example:

#### Create a new color:

```bash
POST /api/colors
```

**Request Body:**

```json
{
    "name": "Red",
    "code": "#FF0000"
}
```

**Response:**

````json
{
  "success": true,
  "message": "Color created successfully!",
  "data": {
    "id": 1,
    "name": "Red",
    "code": "#FF0000"
  }
}
## 1. Introduction

This project is a backend application built using **Laravel**, a powerful and modern PHP framework. It provides RESTful APIs for managing resources and business logic.

The project follows a **clean code** and **MVC architecture** structure to ensure maintainability, scalability, and efficiency.

---

## 2. Prerequisites

Before you begin, ensure you meet the following requirements:

- **PHP** >= 8.1
- **Composer** >= 2.0
- **Laravel** >= 9.x
- **Database**: MySQL / PostgreSQL / SQLite
- **Node.js** >= 14.x (optional, for frontend dependencies like Vite)
- **Git** for version control
- Web Server (Apache/Nginx)

---

## 3. Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/laravel-backend.git
cd laravel-backend
````

### Install Dependencies

Install project dependencies using Composer:

```bash
composer install
```

---

## 4. Configuration

### Create `.env` File

Copy the `.env.example` file and rename it as `.env`:

```bash
cp .env.example .env
```

### Update Environment Variables

Configure the database connection and application URL:

```dotenv
APP_NAME=LaravelBackend
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### Generate Application Key

```bash
php artisan key:generate
```

---

## 5. Database Setup

### Migrate the Database

Run the migration files to set up the database schema:

```bash
php artisan migrate
```

### Seed the Database (Optional)

Seed sample data for testing purposes:

```bash
php artisan db:seed
```

---

## 6. Directory Structure

-   **`app/`**: Contains core application files (Models, Controllers, etc.).
-   **`routes/`**: API and web route definitions.
-   **`database/`**: Migrations, seeders, and factories.
-   **`resources/`**: Views and frontend assets.
-   **`tests/`**: Unit and feature tests.
-   **`storage/`**: Logs, cache, and user-uploaded files.
-   **`public/`**: Public assets like images, JS, and CSS.

---

## 7. Routes

Routes are defined in `routes/api.php` and `routes/web.php`.

Example API route:

```php
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

Run the following command to view all routes:

```bash
php artisan route:list
```

---

## 8. Controllers

Controllers handle requests and contain application logic.

Example Controller:

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'User list']);
    }
}
```

---

## 9. Middleware

Middleware filters HTTP requests before reaching controllers.

Register middleware in `app/Http/Kernel.php`.

To create custom middleware:

```bash
php artisan make:middleware CustomMiddleware
```

---

## 10. Models

Models represent database tables and handle data manipulation.

Example Model:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];
}
```

---

## 11. Migrations

Migrations define the database schema.

Create a migration file:

```bash
php artisan make:migration create_users_table
```

---

## 12. Seeders

Seeders populate the database with test data.

Create a seeder:

```bash
php artisan make:seeder UserSeeder
```

Run the seeder:

```bash
php artisan db:seed --class=UserSeeder
```

---

## 13. API Documentation

To document APIs, this project uses tools like Postman or Swagger.

Example:

```json
GET /api/users
Response: {
    "data": [
        {"id": 1, "name": "John Doe"}
    ]
}
```

---

## 14. Testing

Run tests using PHPUnit:

```bash
php artisan test
```

Create a test:

```bash
php artisan make:test UserTest
```

---

## 15. Deployment

### Prepare for Deployment

-   Optimize the application:

```bash
php artisan optimize
```

-   Set `APP_ENV=production` in `.env`.

### Deployment Tools

Use tools like Laravel Forge, Envoyer, or manual deployment.

---

## 16. Troubleshooting

Common issues and solutions:

1. **Storage Permission Error**:

    ```bash
    chmod -R 777 storage/
    ```

2. **Config Cache**:
    ```bash
    php artisan config:cache
    ```

---

## 17. Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch.
3. Commit changes.
4. Open a pull request.

---

## 18. License

This project is open-source and available under the MIT License.

## 1. Introduction

This project is a backend application built using **Laravel**, a powerful and modern PHP framework. It provides RESTful APIs for managing resources and business logic.

The project follows a **clean code** and **MVC architecture** structure to ensure maintainability, scalability, and efficiency.

---

## 2. Prerequisites

Before you begin, ensure you meet the following requirements:

-   **PHP** >= 8.1
-   **Composer** >= 2.0
-   **Laravel** >= 9.x
-   **Database**: MySQL / PostgreSQL / SQLite
-   **Node.js** >= 14.x (optional, for frontend dependencies like Vite)
-   **Git** for version control
-   Web Server (Apache/Nginx)

---

## 3. Installation

### Clone the Repository

```bash
git clone https://github.com/your-username/laravel-backend.git
cd laravel-backend
```

### Install Dependencies

Install project dependencies using Composer:

```bash
composer install
```

---

## 4. Configuration

### Create `.env` File

Copy the `.env.example` file and rename it as `.env`:

```bash
cp .env.example .env
```

### Update Environment Variables

Configure the database connection and application URL:

```dotenv
APP_NAME=LaravelBackend
APP_ENV=local
APP_KEY=
APP_DEBUG=true
APP_URL=http://localhost

DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=your_db_name
DB_USERNAME=your_db_user
DB_PASSWORD=your_db_password
```

### Generate Application Key

```bash
php artisan key:generate
```

---

## 5. Database Setup

### Migrate the Database

Run the migration files to set up the database schema:

```bash
php artisan migrate
```

### Seed the Database (Optional)

Seed sample data for testing purposes:

```bash
php artisan db:seed
```

---

## 6. Directory Structure

-   **`app/`**: Contains core application files (Models, Controllers, etc.).
-   **`routes/`**: API and web route definitions.
-   **`database/`**: Migrations, seeders, and factories.
-   **`resources/`**: Views and frontend assets.
-   **`tests/`**: Unit and feature tests.
-   **`storage/`**: Logs, cache, and user-uploaded files.
-   **`public/`**: Public assets like images, JS, and CSS.

---

## 7. Routes

Routes are defined in `routes/api.php` and `routes/web.php`.

Example API route:

```php
Route::middleware('auth:sanctum')->get('/user', function (Request $request) {
    return $request->user();
});
```

Run the following command to view all routes:

```bash
php artisan route:list
```

---

## 8. Controllers

Controllers handle requests and contain application logic.

Example Controller:

```php
namespace App\Http\Controllers;

use Illuminate\Http\Request;

class UserController extends Controller
{
    public function index()
    {
        return response()->json(['message' => 'User list']);
    }
}
```

---

## 9. Middleware

Middleware filters HTTP requests before reaching controllers.

Register middleware in `app/Http/Kernel.php`.

To create custom middleware:

```bash
php artisan make:middleware CustomMiddleware
```

---

## 10. Models

Models represent database tables and handle data manipulation.

Example Model:

```php
namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class User extends Model
{
    protected $fillable = ['name', 'email', 'password'];
}
```

---

## 11. Migrations

Migrations define the database schema.

Create a migration file:

```bash
php artisan make:migration create_users_table
```

---

## 12. Seeders

Seeders populate the database with test data.

Create a seeder:

```bash
php artisan make:seeder UserSeeder
```

Run the seeder:

```bash
php artisan db:seed --class=UserSeeder
```

---

## 13. API Documentation

To document APIs, this project uses tools like Postman or Swagger.

Example:

```json
GET /api/users
Response: {
    "data": [
        {"id": 1, "name": "John Doe"}
    ]
}
```

---

## 14. Testing

Run tests using PHPUnit:

```bash
php artisan test
```

Create a test:

```bash
php artisan make:test UserTest
```

---

## 15. Deployment

### Prepare for Deployment

-   Optimize the application:

```bash
php artisan optimize
```

-   Set `APP_ENV=production` in `.env`.

### Deployment Tools

Use tools like Laravel Forge, Envoyer, or manual deployment.

---

## 16. Troubleshooting

Common issues and solutions:

1. **Storage Permission Error**:

    ```bash
    chmod -R 777 storage/
    ```

2. **Config Cache**:
    ```bash
    php artisan config:cache
    ```

---

## 17. Contributing

Contributions are welcome. To contribute:

1. Fork the repository.
2. Create a new branch.
3. Commit changes.
4. Open a pull request.

---

## 18. License

This project is open-source and available under the MIT License.
