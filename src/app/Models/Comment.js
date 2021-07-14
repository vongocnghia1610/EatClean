const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Comment = new Schema(
  {
    IDUser: { type: String, required: true },
    IDRecipe: { type: String, default: null },
    Comment: { type: String, required: true },
    Status: {type:String , default: "ACTIVE"},
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("comment", Comment);