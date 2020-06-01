const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const express    = require('express');        // call express
const port = process.env.PORT || 8080;        // set our port

var router = express.Router();              // get an instance of the express Router
var app        = express();                 // define our app using express



//configuring the AWS environment

AWS.config.region = 'us-east-1';


var sts = new AWS.STS();
var s3 = new AWS.S3();

loadCredentials();


//configuring parameters
var params = {
  Bucket: 'test-poc-nexgeneng',
  Delimiter: '/'

};

async function loadCredentials() { {
  await sts.assumeRole({
    RoleArn: 'arn:aws:iam::247383337213:role/s3-read-access-poc',
    RoleSessionName: 'awssdk'
  }, function(err, data) {
    if (err) { // an error occurred
      console.log('Cannot assume role');
      console.log(err, err.stack);
    } else { // successful response
      console.log(AWS.config);

      AWS.config.update({
        accessKeyId: data.Credentials.AccessKeyId,
        secretAccessKey: data.Credentials.SecretAccessKey,
        sessionToken: data.Credentials.SessionToken
      });

      console.log('After assuming role');

      console.log( AWS.config.credentials);
    
    }

  });

  
}
}





router.get('/', function(req, res) {
  res.json({ message: 'App is up!' });   
});

router.get('/buckets',function(req, res){
  s3.listObjects(params, function (err, data) {
    if(err){
    console.log(err);
    throw err;
  };
  res.json(JSON.stringify(data)); 
  });
});


app.use('/api', router);

app.listen(port);


