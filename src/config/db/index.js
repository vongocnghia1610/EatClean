const mongoose = require("mongoose");
async function connect(url) {
  try {
    await mongoose.connect(url, {
      useUnifiedTopology: true,
      useFindAndModify: false,
      useNewUrlParser: true,
      useCreateIndex: true,
    });
    console.log("Success");
  } catch (error) {
    console.log(error);
  }
}
module.exports = { connect };
