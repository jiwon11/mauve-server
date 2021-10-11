import loaders from './loaders';
import express from 'express';

async function startServer() {
  try {
    const app = express();

    await loaders(app);

    app.listen(process.env.PORT || 3000, '0.0.0.0', err => {
      if (err) {
        return console.log(err);
      }
      console.log(`Server is ready !`);
    });

    if (process.env.PM2) {
      process.on('SIGINT', function () {
        isDisableKeepAlive = true;
        app.close(function () {
          console.log('> 😢 Server closed');
          process.exit(0);
        });
      });
    }
  } catch (err) {
    console.log(err);
  }
}

startServer();
