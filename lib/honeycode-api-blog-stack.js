// Copyright Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: MIT-0

const cdk = require('@aws-cdk/core');
const lambda = require('@aws-cdk/aws-lambda');
const events = require('@aws-cdk/aws-events');
const targets = require('@aws-cdk/aws-events-targets');
const iam = require('@aws-cdk/aws-iam');
const s3 = require('@aws-cdk/aws-s3');
const fs = require('fs');

const environment = require('../lambda/Survey/env.json');

class HoneycodeApiBlogStack extends cdk.Stack {
  /**
   *
   * @param {cdk.Construct} scope
   * @param {string} id
   * @param {cdk.StackProps=} props
   */
  constructor(scope, id, props) {
    super(scope, id, props);
    //Setup Survey Lambda function
    const surveyLambda = new lambda.Function(this, 'Survey', {
      description: 'Survey lambda reads survey results from Honeycode',
      code: lambda.Code.fromAsset('lambda/Survey'),
      handler: 'index.handler',
      runtime: lambda.Runtime.NODEJS_12_X,
      environment,
      timeout: cdk.Duration.minutes(3), //Give enough time for reading and updating all survey results
    });
    //Allow lambda to access Honeycode workbook
    //Using a managed policy will give access to all workbooks so it is recommended to create a policy for the specific workbook/app/screen
    //survey.role.addManagedPolicy(iam.ManagedPolicy.fromAwsManagedPolicyName('AmazonHoneycodeWorkbookFullAccess'));
    const surveyReadPolicy = new iam.PolicyStatement();
    surveyReadPolicy.addActions(['honeycode:GetScreenData']);
    surveyReadPolicy.addResources([`arn:aws:honeycode:*:*:screen:workbook/${environment.workbookId}/app/${environment.appId}/screen/${environment.readScreenId}`]);
    surveyLambda.role.addToPrincipalPolicy(surveyReadPolicy)
    const surveyWritePolicy = new iam.PolicyStatement();
    surveyWritePolicy.addActions(['honeycode:InvokeScreenAutomation']);
    surveyWritePolicy.addResources([`arn:aws:honeycode:*:*:screen-automation:workbook/${environment.workbookId}/app/${environment.appId}/screen/${environment.writeScreenId}/automation/${environment.screenAutomationId}`]);
    surveyLambda.role.addToPrincipalPolicy(surveyWritePolicy)
    //Run Survey Lambda every hour
    const surveyTimer = new events.Rule(this, 'SurveyTimer', {
      schedule: events.Schedule.expression('rate(1 hour)')
    });
    surveyTimer.addTarget(new targets.LambdaFunction(surveyLambda));
    //Setup S3 bucket to write Survey results to
    const surveyBucket = new s3.Bucket(this, 'survey-results');
    surveyBucket.grantWrite(surveyLambda);
    surveyLambda.addEnvironment('s3bucket', surveyBucket.bucketName);
    //Output the Survey Bucket URL
    new cdk.CfnOutput(this, "Survey Bucket Name", {
      value: surveyBucket.bucketName
    });
  }
}

module.exports = { HoneycodeApiBlogStack }
