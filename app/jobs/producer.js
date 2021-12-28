import connectQueue from '../config/connectQueue';

const jobOptions = {
  // jobId, uncoment this line if your want unique jobid
  removeOnComplete: true, // remove job if complete
  delay: 60000, // 1 = 60000 min in ms
  attempts: 3 // attempt if job is error retry 3 times
};

const init = async (nameQueue, data) => {
  return await connectQueue(nameQueue).add(data, jobOptions);
};
