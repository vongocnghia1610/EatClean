const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Blog = new Schema(
  {
    BlogTitle: { type: String, required: true },
    BlogAuthor: { type: String, required: true },
    BlogContent: { type: String, required: true },
    IDAuthor: {type: String, required: true},
    ImageMain: {type: String, default: null},
    Status: {type: String, default: "INCONFIRM"},
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("blog", Blog);
