## About the project and relevant information

- This project is for demonstration purposes only, for that reason some things are on the repo, the .env is a exemple.
- The rest client used was Api Dog, I chose this one because it's greate to generate documentation, we can create mocks, schemas and much more with it, and we can generate a swagger file with the collections or a web page with the documentation. I didn't generate the swagger because the collections leaks of details, such response examples, schemas and more.
- I will let a file for export in your Api Dog app, I recommend to capture the token of login(if it's not already captured) for the easy use of the collection, is simple to do it, after register a user, go to login, do it, and click on the "Post Processors" tab, there you can choose to add a variable, name it token, and on JSONPath use this selector $.token.
- The project was build with NestJs, postgresDb (I used on a docker), and I choose Prisma for the ORM, there migrations for that one.
- The project runs on a port 3000, and in the rest client I fixed the port 3000 on the url.
- Follow the steps bellow to run the project.
- Thanks for your time!

## Project setup

```bash
$ npm install
```

## Setup the database

```bash
$ docker-compose up
```

## Setup the prisma migration

```bash
$ npx prisma migrate deploy
```

## Compile and run the project

```bash
# development
$ npm run start

# watch mode
$ npm run start:dev

```
