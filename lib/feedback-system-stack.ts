import * as cdk from 'aws-cdk-lib';
import { Construct } from 'constructs';
import * as ecs from 'aws-cdk-lib/aws-ecs';
import * as rds from 'aws-cdk-lib/aws-rds';
import * as ec2 from 'aws-cdk-lib/aws-ec2';
import * as opensearch from 'aws-cdk-lib/aws-opensearchservice';
import * as iam from 'aws-cdk-lib/aws-iam';
import * as elbv2 from 'aws-cdk-lib/aws-elasticloadbalancingv2';
import * as logs from 'aws-cdk-lib/aws-logs';
import * as secretsmanager from 'aws-cdk-lib/aws-secretsmanager';
import * as s3 from 'aws-cdk-lib/aws-s3';

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
      cpu: 256,
      environment: {
        'ARGILLA_DATABASE_URL': 'postgres://username:password@hostname:5432/dbname',
        'ARGILLA_ELASTICSEARCH_URL': 'https://search-domain-endpoint',
        'ARGILLA_BASE_URL': 'http://localhost',
        'ARGILLA_HOME': '/home/argilla',
        'ARGILLA_TELEMETRY': 'true'
      }
    });

    container.addPortMappings({
      containerPort: 80
    });

    const ecsService = new ecs.FargateService(this, 'FeedbackSystemService', {
      cluster: cluster,
      taskDefinition: taskDefinition
    });

    // IAM Roles and Security Groups
    const ecsTaskRole = new iam.Role(this, 'EcsTaskRole', {
      assumedBy: new iam.ServicePrincipal('ecs-tasks.amazonaws.com'),
      managedPolicies: [
        iam.ManagedPolicy.fromAwsManagedPolicyName('service-role/AmazonECSTaskExecutionRolePolicy')
      ]
    });

    taskDefinition.taskRole = ecsTaskRole;

    const securityGroup = new ec2.SecurityGroup(this, 'FeedbackSystemSG', {
      vpc: vpc,
      allowAllOutbound: true
    });

    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(80), 'Allow HTTP traffic');
    securityGroup.addIngressRule(ec2.Peer.anyIpv4(), ec2.Port.tcp(443), 'Allow HTTPS traffic');

    ecsService.connections.addSecurityGroup(securityGroup);

    // Application Load Balancer
    const alb = new elbv2.ApplicationLoadBalancer(this, 'FeedbackSystemALB', {
      vpc: vpc,
      internetFacing: true
    });

    const listener = alb.addListener('Listener', {
      port: 443,
      certificates: [elbv2.ListenerCertificate.fromArn('arn:aws:acm:region:account-id:certificate/certificate-id')],
      defaultAction: elbv2.ListenerAction.forward([ecsService])
    });

    listener.addTargets('ECS', {
      port: 80,
      targets: [ecsService]
    });

    // CloudWatch Logs
    const logGroup = new logs.LogGroup(this, 'FeedbackSystemLogGroup', {
      retention: logs.RetentionDays.ONE_WEEK
    });

    new logs.LogStream(this, 'FeedbackSystemLogStream', {
      logGroup: logGroup,
      logStreamName: 'argilla'
    });

    new logs.LogStream(this, 'AuroraPostgresLogStream', {
      logGroup: logGroup,
      logStreamName: 'aurora-postgres'
    });

    new logs.LogStream(this, 'OpenSearchLogStream', {
      logGroup: logGroup,
      logStreamName: 'opensearch'
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

    // Backups and Disaster Recovery
    const backupBucket = new s3.Bucket(this, 'FeedbackSystemBackupBucket', {
      versioned: true,
      removalPolicy: cdk.RemovalPolicy.RETAIN
    });

    dbCluster.addRotationSingleUser({
      automaticallyAfter: cdk.Duration.days(30)
    });

    domain.addRotationSingleUser({
      automaticallyAfter: cdk.Duration.days(30)
    });

    new cdk.CfnOutput(this, 'ALBDnsName', {
      value: alb.loadBalancerDnsName
    });

    new cdk.CfnOutput(this, 'DatabaseEndpoint', {
      value: dbCluster.clusterEndpoint.hostname
    });

    new cdk.CfnOutput(this, 'OpenSearchEndpoint', {
      value: domain.domainEndpoint
    });
  }
}
