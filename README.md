# Amazon Honeycode API Blog 

This project shows how to:
 * Use AWS Lambda functions to read data Amazon Honeycode and write it to an external source (Amazon S3)
 * Use Amazon QuickSight to visualize the data 

This project uses AWS CDK to create the required resources.

## Useful commands

 * `cdk bootstrap`        bootstrap this stack
 * `cdk deploy`           deploy this stack to your default AWS account/region
 * `cdk diff`             compare deployed stack with current state
 * `cdk synth`            emits the synthesized CloudFormation template

## Files

* bin
  * honeycode-api-blog.js (Main entry for stack creation)
* lamdba/Survey
  * index.js (Survey Lambda handler)
  * env.json (Survey Lambda environment variables)
* lib
  * honeycode-api-blog-stack.js (Survey API application Stack definitions)
  
## Security

See [CONTRIBUTING](CONTRIBUTING.md#security-issue-notifications) for more information.

## License

This library is licensed under the MIT-0 License. See the LICENSE file.