import CouchModel from '../models/coach';

export default class CouchService {
  static async sign(couchDTO, profileImgDTO) {
    try {
      let couchRecord, created;
      const existCouch = await CouchModel.findOne({ phone_NO: couchDTO.phone_NO });
      if (existCouch) {
        couchRecord = existCouch;
        created = false;
      } else {
        const newCouch = new CouchModel({ ...couchDTO, ...{ profile_img: profileImgDTO } });
        const saveCouch = await newCouch.save();
        couchRecord = saveCouch;
        created = true;
      }
      return { success: true, body: { couchRecord, created } };
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
      const couchRecord = await CouchModel.findOne({ _id: ID }).select({ name: 1, phone_NO: 1, role: 1, profile_img: 1, career: 1, level_of_education: 1, certificate: 1 }).lean();
      if (couchRecord) {
        return { success: true, body: { couchRecord } };
      } else {
        return { success: false, body: { message: `Couch not founded by ID : ${ID}` } };
      }
    } catch (err) {
      console.log(err);
      return { success: false, body: err.message };
    }
  }
}
