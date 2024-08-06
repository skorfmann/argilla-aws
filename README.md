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

### Managing the Stack

To manage the stack, you can use the following commands:

- **Update the stack**: Run `npx cdk deploy` to update the stack with any changes.
- **Destroy the stack**: Run `npx cdk destroy` to delete the stack and all associated resources.

### Best Practices

- Use environment variables or AWS Systems Manager Parameter Store for configurable values.
- Implement proper error handling and rollback mechanisms in the CDK stack.
- Use consistent naming conventions and add relevant tags to all resources.
- Follow the principle of least privilege when setting up IAM roles.
- Encrypt data at rest and in transit wherever possible.

### Environment Variables

The following environment variables are used in the ECS service:

- `ARGILLA_DATABASE_URL`: The URL for the Aurora Postgres database.
- `ARGILLA_ELASTICSEARCH_URL`: The URL for the OpenSearch domain.
- `ARGILLA_BASE_URL`: The base URL for the Argilla service.
- `ARGILLA_HOME`: The home directory for Argilla.
- `ARGILLA_TELEMETRY`: Enable or disable telemetry for Argilla.

### Verifying the Deployment

After deploying the stack, you can verify the deployment by:

1. **Checking the ECS service**: Ensure that the Argilla container is running in the ECS cluster.
2. **Connecting to the database**: Verify that Argilla can connect to the Aurora Postgres database.
3. **Testing the search functionality**: Ensure that Argilla can connect to the OpenSearch domain.
4. **Accessing the service**: Use the Application Load Balancer's DNS name to access the Argilla service and verify its functionality.
5. **Monitoring logs**: Check the CloudWatch logs for Argilla, Aurora Postgres, and OpenSearch to ensure that logs are being properly sent and retained.

### Additional Information

For more details on the Argilla configuration, refer to the [Argilla configuration documentation](https://raw.githubusercontent.com/argilla-io/argilla/b7ac946af610a663b48e01007bc6b31955fc0b2a/argilla/docs/reference/argilla-server/configuration.md).
