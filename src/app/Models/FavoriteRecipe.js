const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const FavoriteRecipe = new Schema(
  {
    IDUser: { type: String, required: true },
    IDRecipe: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("favoriterecipe", FavoriteRecipe);