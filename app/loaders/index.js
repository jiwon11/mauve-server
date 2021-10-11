import expressLoader from './express';
import mongodbLoader from './mongodb';

export default async app => {
  await expressLoader(app);
  console.log('Express Initialized');

  // ... more loaders can be here
  await mongodbLoader();
  // ... Initialize agenda
  // ... or Redis, or whatever you want
};
