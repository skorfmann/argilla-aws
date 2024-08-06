import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';

export class FeedbackSystemStack extends cdk.Stack {
  constructor(scope: Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);

    // ECS Cluster
    const vpc = new ec2.Vpc(this, 'FeedbackSystemVpc', {
      maxAzs: 3
    });

    const cluster = new ecs.Cluster(this, 'FeedbackSystemCluster', {
      vpc: vpc
    });

    const taskDefinition = new ecs.FargateTaskDefinition(this, 'FeedbackSystemTaskDef');

    const container = taskDefinition.addContainer('FeedbackSystemContainer', {
      image: ecs.ContainerImage.fromRegistry('argilla/argilla'),
      memoryLimitMiB: 512,
      cpu: 256
    });

    container.addPortMappings({
      containerPort: 80
    });

    new ecs.FargateService(this, 'FeedbackSystemService', {
      cluster: cluster,
      taskDefinition: taskDefinition
    });

    // Aurora Postgres
    const dbCluster = new rds.DatabaseCluster(this, 'FeedbackSystemDbCluster', {
      engine: rds.DatabaseClusterEngine.auroraPostgres({
        version: rds.AuroraPostgresEngineVersion.VER_13_4
      }),
      instanceProps: {
        vpc: vpc,
        instanceType: ec2.InstanceType.of(
          ec2.InstanceClass.BURSTABLE2,
          ec2.InstanceSize.SMALL
        )
      }
    });

    // OpenSearch
    const domain = new opensearch.Domain(this, 'FeedbackSystemDomain', {
      version: opensearch.EngineVersion.OPENSEARCH_1_0,
      capacity: {
        masterNodes: 2,
        dataNodes: 2
      },
      ebs: {
        volumeSize: 20
      },
      nodeToNodeEncryption: true,
      encryptionAtRest: {
        enabled: true
      },
      enforceHttps: true
    });
  }
}
