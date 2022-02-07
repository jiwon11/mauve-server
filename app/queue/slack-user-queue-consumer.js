import { newUser } from '../jobs/slack';
import UserService from '../services/user.service';

export const slacksUserProcess = async function (job, done) {
  try {
    console.log(`Job ${job.id} is ready!`);
    const data = job.data;
    console.log('slacksProcess Data', data);
    const userResult = await UserService.findById(data.userId);
    console.log(userResult.body);
    await newUser(userResult.body);
    done();
  } catch (err) {
    console.log({
      success: false,
      body: err
    });
    done();
  }
};
