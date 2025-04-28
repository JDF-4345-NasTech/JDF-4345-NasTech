**Pre-requisites**
Before setting up the application, ensure your system has the following:
 - Git: https://git-scm.com/downloads
 - Node.js and npm: https://nodejs.org/en
 - PostgreSQL: https://help.geneious.com/hc/en-us/article_attachments/360059852231
 - Prisma (set up in backend folder, store the username and password): https://www.prisma.io/docs/getting-started/setup-prisma/start-from-scratch/relational-databases-typescript-postgresql
 - a gmail account, for Funrazor to send emails


**Dependent libraries**
 - nodejs dependancies can be installed by navigating to the directories with package.json and running "npm install"

**Download instructions**
 - run in console: git clone https://github.com/JDF-4345-NasTech/JDF-4345-NasTech.git

**Build instructions**
 - Create an .env file in the FunRazor folder and set the following variables:
     - VITE_BACKEND_ADDRESS: http://localhost:3000
     - VITE_AUTH0_DOMAIN: your auth0 domain
     - VITE_AUTH0_CLIENT_ID: your auth client id
 - Create an .env file in the FunRazor folder and set the following variables:
     - DATABASE_URL: to the following format: "postgresql://USERNAME:PASSWORD@localhost:5432/DATABASENAME?schema=public"
     - EMAIL_USER: to the created gmail account
     - EMAIL_PASS: to the created gmail password
     - STRIPE_SECRET_KEY: your stripe keys
     - VITE_STRIPE_PUBLIC_KEY: your stripe keys

**Installation**
 - To migrate the postgres schema, run in the backend folder: "npx prisma migrate dev --name init"

**Run instructions**
 - Run in the backend folder: node index.js
 - While that is active, run in the front end folder: npm run dev
 - It will output a link to FunRazor through a port, select it to open on a browser

**Troubleshooting**
- Prisma studio is helpful for visualizing the database and adding/deleting instances for testing. To start run on backend: npx prisma studio
- To test the backend, we recommend Insomnia to test API endpoints. Download link: https://insomnia.rest/download
