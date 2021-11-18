import WeightService from '../services/weight.service';

export const create = async (req, res) => {
  try {
    const userId = req.user.ID;
    const weightBody = req.body;
    const weightDTO = { ...{ user: userId }, ...weightBody };
    const weightCreateResult = await WeightService.create(weightDTO);
    if (weightCreateResult.success) {
      return res.jsonResult(201, weightCreateResult.body);
    } else {
      return res.jsonResult(500, { message: 'Weight Create Service Error', err: weightCreateResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Weight Controller Error', err: err.message });
  }
};

export const getAll = async (req, res) => {
  try {
    const userId = req.user.ID;
    const limit = req.query.limit ? parseInt(req.query.limit) : null;
    const skip = req.query.offset ? parseInt(req.query.offset) : null;
    const weightGetAllResult = await WeightService.getAll(userId, limit, skip);
    if (weightGetAllResult.success) {
      return res.jsonResult(201, weightGetAllResult.body);
    } else {
      return res.jsonResult(500, { message: 'Weight Create Service Error', err: weightGetAllResult.body });
    }
  } catch (err) {
    console.log(err);
    return res.jsonResult(500, { message: 'Weight Controller Error', err: err.message });
  }
};
