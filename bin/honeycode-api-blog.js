#!/usr/bin/env node
// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0
const cdk = require('@aws-cdk/core');
const { HoneycodeApiBlogStack } = require('../lib/honeycode-api-blog-stack');

const app = new cdk.App();
new HoneycodeApiBlogStack(app, 'HoneycodeApiBlogSurveyStack');
