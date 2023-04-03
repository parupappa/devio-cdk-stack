#!/usr/bin/env node
import 'source-map-support/register';
import * as cdk from 'aws-cdk-lib';
import { Devio2Stack } from '../lib/devio2-stack';

const app = new cdk.App();
new Devio2Stack(app, 'Devio2Stack', {
  
});