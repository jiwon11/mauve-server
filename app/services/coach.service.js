import CoachModel from '../models/coach';

export default class CoachService {
  static async sign(coachDTO, profileImgDTO) {
    try {
      let coachRecord, created;
      const existCoach = await CoachModel.findOne({ phone_NO: coachDTO.phone_NO });
      if (existCoach) {
        coachRecord = existCoach;
        created = false;
      } else {
        const newCoach = new CoachModel({ ...coachDTO, ...{ profile_img: profileImgDTO } });
        const saveCoach = await newCoach.save();
        coachRecord = saveCoach;
        created = true;
      }
      return { success: true, body: { coachRecord, created } };
    } catch (err) {
      console.log(err);
      if (err.name === 'ValidationError') {
        let errors = {};

        Object.keys(err.errors).forEach(key => {
          errors[key] = err.errors[key].message;
        });

        return { success: false, body: { statusCode: 400, err: errors } };
      }
      return { success: false, body: { statusCode: 500, err } };
    }
  }

  static async findById(ID) {
    try {
      const coachRecord = await CoachModel.findOne({ _id: ID }).select({ name: 1, phone_NO: 1, role: 1, profile_img: 1, career: 1, level_of_education: 1, certificate: 1 }).lean();
      if (coachRecord) {
        return { success: true, body: { coachRecord } };
      } else {
        return { success: false, body: { message: `Coach not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
