import * as admin from 'firebase-admin';
import AWS from 'aws-sdk';
const S3 = new AWS.S3();

AWS.config.update({
  accessKeyId: process.env.AWS_Access_Key_ID,
  secretAccessKey: process.env.AWS_Secret_Access_Key,
  region: 'ap-northeast-1'
});

const s3getFile = async function (params) {
  try {
    const file = await S3.getObject(params).promise();
    var objectString = Buffer.from(file.Body);
    var serviceAccountJson = JSON.parse(objectString.toString());
    return serviceAccountJson;
  } catch (err) {
    console.log(err);
  }
};

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});

export const pushFcm = async function (multicast, message) {
  try {
    var serviceAccount = await s3getFile({
      Bucket: process.env.fcmBucketName, // your bucket name,
      Key: process.env.fcmkey // path to the object you're looking for
    });
    var commentFcm;
    if (!firebase.apps.length) {
      commentFcm = firebase.initializeApp({
        credential: firebase.credential.cert(serviceAccount),
        databaseURL: process.env.FbDBURL
      });
    } else {
      commentFcm = firebase.app();
    }
    let response;
    if (multicast) {
      response = await commentFcm.messaging().sendMulticast(message);
      if (response.failureCount > 0) {
        const failedTokens = [];
        response.responses.forEach((resp, idx) => {
          if (!resp.success) {
            failedTokens.push(registrationTokens[idx]);
          }
        });
        console.log('List of tokens that caused failures: ' + failedTokens);
      }
    } else {
      response = await commentFcm.messaging().send(message);
    }
    console.log('Successfully sent message:', response);
    return {
      statusCode: 200,
      body: `{"statusText": "OK","message": "Successfully sent message: ${response}"}`
    };
  } catch (error) {
    return {
      statusCode: 500,
      body: `{"statusText": "Server Error","message": "${error.message}"}`
    };
  }
};
