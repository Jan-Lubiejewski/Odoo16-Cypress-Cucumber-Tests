# Odoo16 Cypress Automation Tests using Gherkin/Cucumber

E2E Automation tests written in Cypress to test its features. It uses Gherkin/Cucumber to make the test cases inside .feature files readable for non technical person. It should in theory work for any basic Odoo16 as long as you provide the right data set.

## Cypress Version and Dependencies
```
  Cypress package version: 13.6.4
  Cypress binary version: 13.6.4
  Electron version: 25.8.4
  Node version: 20.11.0
  @badeball/cypress-cucumber-preprocessor: ^20.0.1
  @bahmutov/cypress-esbuild-preprocessor: 2.2.0
```

```bash
  npm install --save-dev typescript
  npm install @badeball/cypress-cucumber-preprocessor
  npm i @bahmutov/cypress-esbuild-preprocessor
```

## Dependencies and Setup
```bash
  docker pull odoo
  docker run -d -e POSTGRES_USER=odoo -e POSTGRES_PASSWORD=odoo -e POSTGRES_DB=postgres --name db postgres:15
  docker run -p 8069:8069 --name odoo --link db:db -t odoo
```

Open the http://localhost:8069 and set up the database as follows if you don't want to change the values in code:

```
Master Password: i643-64dq-58n2
Password: jkp58ggd
Database Name: test-db
E-mail: janlubiejewski@outlook.com
Language: English(US)
Country: Poland
```

Login to Odoo using the above credentials and go to Home Menu/Apps and Activate following apps:
- Sales

## Running Tests

To run tests, run the following commands:

In headed mode:

```bash
  npx cypress open
```
In headless mode:
```bash
  npx cypress run
```
