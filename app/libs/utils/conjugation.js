export const groupBy = (objectArray, property) => {
  return objectArray.reduce(function (acc, obj) {
    var key = obj[property];
    if (!acc[key]) {
      acc[key] = [];
    }
    acc[key].push(obj);
    return acc;
  }, {});
};

export const groupByOnce = (objectArray, property) => {
  return objectArray.reduce(function (acc, obj) {
    var key = obj[property];
    if (key === 'weight') {
      key = `weight_${obj.body.time}`;
      if (!acc[key]) {
        acc[key] = obj;
      }
    } else {
      if (!acc[key]) {
        acc[key] = obj;
      }
    }
    //acc[key].push(obj);
    return acc;
  }, {});
};
