import { newChat } from '../jobs/slack';

export const slacksChatProcess = async function (job, done) {
  try {
    console.log(`Job ${job.id} is ready!`);
    const data = job.data;
    console.log('slacksProcess Data', data);
    const newSlackMessageResult = await newChat(data);
    console.log(newSlackMessageResult);
    done();
  } catch (err) {
    console.log({
      success: false,
      body: error.response.data
    });
    done();
  }
};
