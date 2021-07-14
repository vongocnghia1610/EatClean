const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const User = new Schema(
  {
    Username: { type: String, required: true },
    Email: { type: String, required: true },
    Password: { type: String, required: true },
    FullName: { type: String, required: true },
    Image: { type: String, },
    SoDienThoai:{ type: String,require: true},
    LoginFB: { type: String,default: "0"},
    IDRole: { type: String, default: "609d2ceafee09d75f011158b", },
    Status: {type: String, default: "INACTIVE"}
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("user", User);
