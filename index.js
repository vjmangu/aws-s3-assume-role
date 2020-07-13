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
      console.log('S3 role assumed successfully');
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

//Test code 

var title = 'Test message sent from Amazon Pinpoint.';

// The content of the push notification.
var message = 'This is a sample message sent from Amazon Pinpoint by using the '
  + 'AWS SDK for JavaScript in Node.js';

var applicationId = '1ffcbab183574791a77f5f35ba4bb72b';

// An object that contains the unique token of the device that you want to send 
// the message to, and the push service that you want to use to send the message.
var recipient = {
  'token': 'a0b1c2d3e4f5g6h7i8j9k0l1m2n3o4p5q6r7s8t9u0v1w2x3y4z5a6b7c8d8e9f0',
  'service': 'APNS'
};

var action = 'URL';
var url = 'https://www.google.com';
var priority = 'normal';
var ttl = 30;

var silent = false;
function CreateMessageRequest() {
  var token = recipient['token'];
  if (service == 'APNS') {
    var messageRequest = {
      'Addresses': {
        [token]: {
          'ChannelType': 'APNS'
        }
      },
      'MessageConfiguration': {
        'APNSMessage': {
          'Action': action,
          'Body': message,
          'Priority': priority,
          'SilentPush': silent,
          'Title': title,
          'TimeToLive': ttl,
          'Url': url
        }
      }
    };
  }
  return messageRequest
}

function ShowOutput(data) {
  if (data["MessageResponse"]["Result"][recipient["token"]]["DeliveryStatus"]
    == "SUCCESSFUL") {
    var status = "Message sent! Response information: ";
  } else {
    var status = "The message wasn't sent. Response information: ";
  }
  console.log(status);
  console.dir(data, { depth: null });
}
async function SendMessage() {
 
console.log('inside send messgae method');
  
await sts.assumeRole({
    RoleArn: 'arn:aws:iam::247383337213:role/pinpoint-send-message-poc',
    RoleSessionName: 'awssdk'
  }, function (err, data) {
    if (err) { // an error occurred
      console.log('Cannot assume role');
      console.log(err, err.stack);
    } else { // successful response
      console.log(AWS.config);
      console.log('pinpoint role assumed successfully');

      AWS.config.update({
        accessKeyId: data.Credentials.AccessKeyId,
        secretAccessKey: data.Credentials.SecretAccessKey,
        sessionToken: data.Credentials.SessionToken
      });
      var token = recipient['token'];
      var service = recipient['service'];
      var messageRequest = CreateMessageRequest();

      //Create a new Pinpoint object.
      var pinpoint = new AWS.Pinpoint();
      var params = {
        "ApplicationId": applicationId,
        "MessageRequest": messageRequest
      };

      // Try to send the message.
      pinpoint.sendMessages(params, function (err, data) {
        if (err) console.log(err);
        else ShowOutput(data);
      });
    }
  });
}

SendMessage();

router.get('/', function(req, res) {
  res.json({ message: 'App is up!' });   
});

router.get('/buckets',function(req, res){
  var params = {
    Bucket: 'test-poc-nexgeneng'
  };  
  s3.listObjects(params, function (err, data) {
    if(err){
    console.log(err);
    throw err;
  };
  res.json(JSON.stringify(data)); 
  });
});

router.get('/images/:imageName',function(req, res){
  var params = {
    Bucket: 'test-poc-nexgeneng'
  };  
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

//get file download
router.get('/file/:fileName',function(req, res){
  var params = {
    Bucket: 'test-poc-nexgeneng'
  };  
  if(req.params.fileName){
   
    if( req.query.type){
      params.Key = req.params.fileName+'.'+req.query.type;
    }
    else{
       params.Key = `${req.params.fileName}.passiosecure`;
    }
    s3.getObject(params, function(err, data) {
      if (err) {
        console.log(err, err.stack); // an error occurred
        res.send(err);
      }
      else {
        res.set('Content-Disposition', 'attachment');
        return res.send(data.Body);

      };           // successful response
    });
  }
  else{
    res.json({ message: 'image not found!' }); 
  }
});



app.use('/api', router);

app.listen(port);

