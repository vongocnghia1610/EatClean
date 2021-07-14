const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const BlogImage = new Schema(
  {
    BlogImages: { type: String, required: true },
    IDBlog: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("blogimage", BlogImage);