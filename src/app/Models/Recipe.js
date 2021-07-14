const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const Recipe = new Schema(
  {
    RecipesTitle: { type: String, required: true },
    RecipesAuthor: { type: String, required: true },
    RecipesContent: { type: String, required: true },
    NutritionalIngredients: { type: String, required: true },
    Ingredients: { type: String, required: true },
    Steps: { type: String, required: true },
    IDAuthor: {type: String, required: true},
    ImageMain: {type: String, default: null},
    Time: {type: Number, required: true},
    Status: {type: String, default: "INCONFIRM"},
  },
  {
    timestamps: true,
  }
);
module.exports = mongoose.model("recipe", Recipe);
