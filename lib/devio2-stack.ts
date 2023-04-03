import * as cdk from '@aws-cdk/core';
import * as ec2 from "@aws-cdk/aws-ec2";            // Allows working with EC2 and VPC resources
import * as iam from "@aws-cdk/aws-iam";            // Allows working with IAM resources
import * as s3assets from "@aws-cdk/aws-s3-assets"; // Allows managing files with S3
import * as keypair from "cdk-ec2-key-pair";        // Helper to create EC2 SSH keypairs
import * as path from "path";                       // Helper for working with file paths
import { readFile } from 'fs';
export class Ec2CdkStack extends cdk.Stack {
  constructor(scope: cdk.Construct, id: string, props?: cdk.StackProps) {
    super(scope, id, props);
    // vpcの作成
    const vpc = new ec2.Vpc(this, 'VPC');

     // Create a key pair to be used with this EC2 Instance
    const key = new keypair.KeyPair(this, "KeyPair", {
      name: "cdk-keypair",
      description: "Key Pair created with CDK Deployment",
    });
    key.grantReadOnPublicKey; 

    // security group for the EC2 instance
    const ec2SecurityGroup = new ec2.SecurityGroup(this, "ec2SecurityGroup", {
      vpc,
      allowAllOutbound: true,
    });

    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(22),
      "Allow SSH access from the Internet"
    )
    
    // 80番ポートを許可する
    ec2SecurityGroup.addIngressRule(
      ec2.Peer.anyIpv4(),
      ec2.Port.tcp(80),
      "Allow HTTP access from the Internet"
    )

    // IAM Role for the EC2 Instance
    const ec2Role = new iam.Role(this, "ec2Role", {
      assumedBy: new iam.ServicePrincipal("ec2.amazonaws.com"),
    });

    // IAM policy attachment to allow access to
    ec2Role.addManagedPolicy(
      iam.ManagedPolicy.fromAwsManagedPolicyName("AmazonSSMManagedInstanceCore")
    );

    // create AMI from the EC2 instance
    const ami = new ec2.AmazonLinuxImage({
      generation: ec2.AmazonLinuxGeneration.AMAZON_LINUX_2,
      cpuType: ec2.AmazonLinuxCpuType.X86_64,
    });

    // Create the EC2 instance using the Security Group, AMI, and KeyPair defined.
    const ec2Instance = new ec2.Instance(this, "Instance", {
      vpc,
      instanceType: ec2.InstanceType.of(
        ec2.InstanceClass.T2,
        ec2.InstanceSize.MICRO
      ),
      machineImage: ami,
      securityGroup: ec2SecurityGroup,
      keyName: key.keyPairName,
      role: ec2Role
    });
  }
}


