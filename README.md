# onelogin-auditlogs-node
AWS Lambda function to get Audit logs from Onelogin API and save in S3.

# Dependency
Node.js v8.10 higher is required

# Usage
## Local Setup
```$xslt
npm install
```
## Set Environment
```$xslt
cp -a sample.env .env
vim .env
```
* Change the value to your environment
````$xslt
ONELOGIN_CLIENTID=XXXXXXXXXXXXXXXXXXXXXXXX
ONELOGIN_SECRET=XXXXXXXXXXXXXXXXXXXXXXXXXXXX
AWS_REGION=ap-northeast-1
LOCAL=true
LOCAL_PROFILE=AWS_credentials_profile_name
S3_BUCKETNAME=mybucket
````

# Usage
## Local Setup
```$xslt
npm install
```
## Local Exec
```$xslt
node main.js
```
## Deploy from local to AWSLambda
```$xslt
zip -r onelogin-auditlogs-node-s3.zip index.js node_modules
aws s3 cp ./onelogin-auditlogs-node-s3.zip s3://[mybucket]/onelogin-auditlogs-node-s3.zip --profile [myprofile]
aws lambda update-function-code --function-name onelogin-auditlogs-node-s3 --s3-bucket [mybucket] --s3-key onelogin-auditlogs-node-s3.zip --publish --profile [myprofile]
```
# Licence
This software is released under the MIT License, see LICENSE.

# Authors
* [facebook](https://www.facebook.com/kenji.nishii.7)
* [twitter](https://twitter.com/kenji_toforone)

# References
* [onelogin reference](https://developers.onelogin.com/api-docs/1/getting-started/dev-overview)
