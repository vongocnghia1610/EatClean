const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const RecipeImage = new Schema(
  {
    RecipeImages: { type: String, required: true },
    IDRecipe: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("recipeimage", RecipeImage);