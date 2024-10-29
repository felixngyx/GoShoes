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
php artisan migrate
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
```

6. Open your browser and go to http://localhost:8000

