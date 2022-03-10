import loaders from './loaders';
import webSocket from './socket/socket';
import express from 'express';

async function startServer() {
  try {
    const app = express();

    await loaders(app);

    const server = app.listen(process.env.PORT || 3000, '0.0.0.0', err => {
      if (err) {
        return console.log(err);
      }
      console.log(`Server is ready !`);
    });

    webSocket(server, app);
  } catch (err) {
    console.log(err);
  }
}

startServer();
