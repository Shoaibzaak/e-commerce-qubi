const getDistanceBetweenPoints = require("get-distance-between-points");

const getDistance = (lat1, long1, lat2, long2) => {
  let dist = getDistanceBetweenPoints.getDistanceBetweenPoints(
    lat1,
    long1,
    lat2,
    long2
  );
  dist = dist / 1609.344; //metres to miles
  return dist;
};

module.exports = getDistance;
