# Survey Lambda

This lambda uses the Honeycode `GetScreenData` API to read survey results, saves them to S3, and finally uses `InvokeScreenAutomation` API to update the *In S3* column in survey results. 

Update `env.json` with the appropriate values from your Honeycode app

`s3bucket` property in `env.json` is set by CDK
