import multerS3 from 'multer-s3';
import multer from 'multer';
import AWS from 'aws-sdk';
import path from 'path';
import dotenv from 'dotenv';

dotenv.config();

AWS.config.update({
  accessKeyId: process.env.AWS_Access_Key_ID,
  secretAccessKey: process.env.AWS_Secret_Access_Key,
  region: 'ap-northeast-2'
});

export const upload = multer(
  {
    storage: multerS3({
      s3: new AWS.S3(),
      bucket: 'mauve-static',
      ACL: 'public-read-write',
      contentType: multerS3.AUTO_CONTENT_TYPE,
      key: function (req, file, cb) {
        const splitPath = req.baseUrl.split('/');
        if (req.params.tag) {
          cb(null, `${splitPath[1]}/${file.fieldname}/${req.params.tag}/${+Date.now()}${path.basename(file.originalname.replace(/ /gi, ''))}`);
        } else {
          cb(null, `${splitPath[1]}/${file.fieldname}/${+Date.now()}${path.basename(file.originalname.replace(/ /gi, ''))}`);
        }
      }
    })
  },
  'NONE'
);
