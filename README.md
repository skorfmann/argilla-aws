# Welcome to your CDK TypeScript project

This is a blank project for CDK development with TypeScript.

The `cdk.json` file tells the CDK Toolkit how to execute your app.

## Useful commands

* `npm run build`   compile typescript to js
* `npm run watch`   watch for changes and compile
* `npm run test`    perform the jest unit tests
* `npx cdk deploy`  deploy this stack to your default AWS account/region
* `npx cdk diff`    compare deployed stack with current state
* `npx cdk synth`   emits the synthesized CloudFormation template

## Deploying Argilla in ECS with Aurora Postgres and OpenSearch

This project sets up an AWS CDK v2 app to host Argilla in ECS with an Aurora Postgres setup and an AWS OpenSearch cluster.

### Steps to deploy

1. **Install dependencies**: Run `npm install` to install all necessary dependencies.
2. **Build the project**: Run `npm run build` to compile the TypeScript code.
3. **Deploy the stack**: Run `npx cdk deploy` to deploy the stack to your AWS account/region.

### Resources created

- **ECS Cluster**: An ECS cluster to host the Argilla container.
- **Aurora Postgres**: An Aurora Postgres database cluster.
- **OpenSearch**: An AWS OpenSearch cluster.
