const mongoose = require("mongoose");
module.exports = {
  connect: (cb) => {
    // const devUrl = `mongodb://${process.env.DB_USERNAME}:${process.env.DB_PASSWORD}@localhost:27017/findlarry`;
    const devUrl = `${process.env.BASE_URL}`;
    // const prodUrl = "";
    mongoose.connect(devUrl, {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    });
    const db = mongoose.connection;
    db.on("error", () => {
      console.error.bind(console, "MongoDb connection error.");
      return cb(false);
    });
    console.log("Connected!");
    return cb(true);
  },
};
