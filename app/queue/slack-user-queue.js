import Queue from 'bull';
import { slacksUserProcess } from './slack-user-queue-consumer';

const slacksUserQueue = new Queue('slacks-user', {
  redis: { host: process.env.REDIS_PROD_HOST, port: process.env.REDIS_PROD_PORT, password: process.env.REDIS_PROD_PW, db: process.env.REDIS_PROD_DB }
});

export const createSlackNewUser = async userDTO => {
  slacksUserQueue.add(userDTO, {
    jobId: userDTO.userId + Date.now(),
    attempts: 2,
    delay: 0.0,
    stopRepeatOnSuccess: true,
    removeOnComplete: true,
    removeOnFail: true,
    repeat: {
      every: 5 * 1000,
      limit: 3
    }
  });
};

slacksUserQueue.process(slacksUserProcess);
slacksUserQueue.on('stalled', function (job) {
  // A job has been marked as stalled. This is useful for debugging job
  // workers that crash or pause the event loop.
  console.log('Job ' + job.id + ' is stalled... ');
});
slacksUserQueue.on('lock-extension-failed', function (job, err) {
  // A job failed to extend lock. This will be useful to debug redis
  // connection issues and jobs getting restarted because workers
  // are not able to extend locks.
  console.log('Job ' + job.id + ' is lock extension failed... ');
  console.log(err);
});

slacksUserQueue.on('waiting', function (jobId) {
  // A Job is waiting to be processed as soon as a worker is idling.
  console.log('Job ' + jobId + ' is waiting... ');
});

slacksUserQueue.on('active', function (job, jobPromise) {
  // A job has started. You can use `jobPromise.cancel()`` to abort it.
  console.log('Job ' + job.id + ' is active...');
});

slacksUserQueue.on('stalled', function (job) {
  // A job has been marked as stalled. This is useful for debugging job
  // workers that crash or pause the event loop.
  console.log('Job ' + job.id + ' is stalled...');
});

slacksUserQueue.on('progress', function (job, progress) {
  // A job's progress was updated!
  console.log('Job ' + job.id + ' in progress...');
  // console.log("Progress " + progress);
});

slacksUserQueue.on('failed', async function (job, error) {
  // A job failed with reason `err`!
  console.log('Job ' + job.id + ' failed...');
});

slacksUserQueue.on('paused', function () {
  // The queue has been paused.
  console.log('Queue is paused...');
});

slacksUserQueue.on('resumed', function (job) {
  // The queue has been resumed.
  console.log('Job ' + job.id + ' is resumed...');
});

slacksUserQueue.on('cleaned', function (jobs, type) {
  // Old jobs have been cleaned from the queue. `jobs` is an array of cleaned
  // jobs, and `type` is the type of jobs cleaned.
  console.log(`Cleaned ${jobs.length} ${type} jobs`);

  for (let i = 0; i < jobs.length; i++) {
    console.log('Job ' + jobs[i].id + ' is cleaned...');
  }
});

slacksUserQueue.on('drained', function (job) {
  // Emitted every time the queue has processed all the waiting jobs (even if there can be some delayed jobs not yet processed)
  console.log('Queue is drained...');
  slacksUserQueue.clean(5000).then(function () {
    console.log('done');
  });
});

slacksUserQueue.on('removed', function (job) {
  // A job successfully removed.
  console.log('Job ' + job.id + ' is removed...');
});

slacksUserQueue.on('completed', function (job, result) {
  console.log(`Job ${job.id} completed! Result: ${result}`);
  const repeatableKey = job.opts.repeat.key;
  console.log('Job repeatableKey :', repeatableKey);
  slacksUserQueue.removeRepeatableByKey(repeatableKey).then(() => {
    console.log('Remove Repeat job');
  });
});
