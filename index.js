const AWS = require('aws-sdk');
const fs = require('fs');
const path = require('path');
const express    = require('express');        // call express
const port = process.env.PORT || 8080;        // set our port

var router = express.Router();              // get an instance of the express Router
var app        = express();                 // define our app using express




process.env.NODE_TLS_REJECT_UNAUTHORIZED = '0';
process.env.AWS_PROFILE = 'dev';
process.env.AWS_SDK_LOAD_CONFIG=1;
//configuring the AWS environment

AWS.config.region = 'us-east-1';


var sts = new AWS.STS();
var s3 = new AWS.S3();

loadCredentials();


//configuring parameters
var params = {
  Bucket: 'test-poc-nexgeneng'

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
    s3 = new AWS.S3();
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

router.get('/images/:imageName',function(req, res){
  if(req.params.imageName){
    params.Key = `${req.params.imageName}.png`;
    s3.getObject(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        res.send(err);
      }
      else {
        res.writeHead(200, {'Content-Type': 'image/jpeg'});
        res.write(data.Body, 'binary');
        res.end(null, 'binary');
      };           // successful response
    });
  }
  else{
    res.json({ message: 'image not found!' }); 
  }
});


app.use('/api', router);

app.listen(port);


