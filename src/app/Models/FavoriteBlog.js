const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavoriteBlog = new Schema(
  {
    IDUser: { type: String, required: true },
    IDBlog: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("favoriteblog", FavoriteBlog);