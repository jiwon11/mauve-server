import mongoose from 'mongoose';
import path from 'path';
import fs from 'fs';
import dotenv from 'dotenv';

dotenv.config();

export default async () => {
  const connect = () => {
    if (process.env.NODE_ENV !== 'production') mongoose.set('debug', true);

    try {
      mongoose.connect(`mongodb+srv://${process.env.MONGO_HOST}`, {
        dbName: 'wecan',
        user: process.env.MONGO_USER,
        pass: process.env.MONGO_PASSWORD,
        autoCreate: true,
        autoIndex: true
      });
      console.log('The MONGODB is connected');
    } catch (error) {
      console.error(error.reason);
    }
  };

  connect();

  mongoose.connection.on('error', error => {
    console.error('MONGODB connect error', error);
  });

  mongoose.connection.on('disconnected', () => {
    console.error('MONGODB disconnect. try reconnect');
  });

  console.log('initialize Model Schema');
  fs.readdirSync(path.join(__dirname, '../models/'))
    .filter(file => file.indexOf('.') !== 0 && file.slice(-3) === '.js')
    .forEach(file => {
      require(path.join(__dirname, '../models/', file));
    });
};
