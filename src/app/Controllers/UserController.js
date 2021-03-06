require("dotenv").config();
const User = require("../Models/User");
const Role = require("../Models/Role");
const Blog = require("../Models/Blog");
const Recipe = require("../Models/Recipe");
const BlogImage = require("../Models/BlogImage");
const RecipeImage = require("../Models/RecipeImage");
const FavoriteBlog = require("../Models/FavoriteBlog");
const FavoriteRecipe = require("../Models/FavoriteRecipe");
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const { UploadImage } = require("./index");
const {
  createToken,
  verifyToken,
  createTokenTime,
  makePassword,
} = require("./index");
class UserController {
  //Post user/register-user
  async RegisterUser(req, res, next) {
    try {
      const Username = req.body.Username;
      const Email = req.body.Email;
      const Password = req.body.Password;
      const FullName = req.body.FullName;
      const SoDienThoai = req.body.SoDienThoai;
      const result = await User.findOne({ $or: [{ Username }, { Email }] });
      if (result == null) {
        const hashPassword = await bcrypt.hash(Password, 5);
        const user = await User.create({
          Username,
          Email,
          Password: hashPassword,
          FullName,
          SoDienThoai
        });
        var id_account = user._doc._id;
        const token = await createToken(`${id_account}`);
        console.log(token);
        var smtpTransport = nodemailer.createTransport({
          service: "gmail", //smtp.gmail.com  //in place of service use host...
          secure: false, //true
          port: 25, //465
          auth: {
            user: process.env.EmailAdmin,
            pass: process.env.PasswordAdmin,
          },
          tls: {
            rejectUnauthorized: false,
          },
        });
        var url = `http://${req.headers.host}/user/verify-email/${token}`;
        var mailOptions = {
          to: user._doc.Email,
          from: process.env.EmailAdmin,
          subject: "Verify Email",
          text: "Please follow this link to verify Email " + url,
        };
        smtpTransport.sendMail(mailOptions, function (error, response) {
          if (error) {
            console.log(error);
            res.status(400).send({
              error: "G???i kh??ng th??nh c??ng",
            });
          } else {
            res.status(200).send({
              data: user,
              Success: "???? g???i Email th??nh c??ng",
            });
          }
        });
      } else {
        res.status(400).send({
          error: "T??i kho???n ho???c Email ???? t???n t???i",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send({
        error: "Dang ky that bai",
      });
    }
  }

  //get customers/verify-Emaillll
  async verifyEmail(req, res, next) {
    try {
      const token = req.params.token;
      const data = await verifyToken(token);
      console.log(data);
      const _id = data;
      console.log(_id);
      var result = await User.findOne({ _id });
      if (result != null) {
        var update = { Status: "ACTIVE" };
        await User.findOneAndUpdate({ _id }, update, {
          new: true,
        });
        res.status(200).send({
          data: "K??ch ho???t th??nh c??ng",
          error: "null",
        });
      } else {
        res.status(400).send({
          error: "No Email",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("Token h???t h???n!");
    }
  }

  //Post user/login
  async login(req, res, next) {
    try {
      const { Username, Password } = req.body;
      var result = await User.findOne({ Username, Status: "ACTIVE" });
      console.log(req.body);
      if (result != null) {
        const isEqualPassword = await bcrypt.compare(Password, result.Password);
        if (isEqualPassword) {
          const token = await createToken(`${result._id}`);
          result._doc.token = token;
          res.status(200).send({
            data: result,
            error: "null",
          });
        } else {
          res.status(400).send({
            error: "Wrong password!",
          });
        }
      } else {
        res.status(404).send({
          error: "Email not found or Email Inactive",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Get /user/show-blog-detail
  async ShowBlogDetail(req, res, next) {
    try {
      var _IDBlog = req.query.id;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role._doc.RoleName != null) {
        var listBlog = await Blog.find({ Status: "CONFIRM", _id: _IDBlog });
        if (listBlog.length != 0) {
          var imageBlog = await BlogImage.find({ IDBlog: _IDBlog });
          res.status(200).send({
            data: listBlog,
            image: imageBlog,
            error: "",
          });
        }
        else
        {
          res.status(404).send({
            error: "Blog kh??ng t???n t???i",
          });
        }
      } else {
        res.status(404).send({
          error: "Vui l??ng ????ng nh???p ????? xem chi ti???t",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: "Vui l??ng ????ng nh???p ????? xem chi ti???t",
      });
    }
  }
  // Get /user/show-recipe-detail
  async ShowRecipeDetail(req, res, next) {
    try {
      var _IDRecipe = req.query.id;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role._doc.RoleName != null) {
        var listRecipe = await Recipe.find({ Status: "CONFIRM", _id: _IDRecipe });
        if (listRecipe.length != 0) {
          var imageRecipe = await RecipeImage.find({ IDRecipe: _IDRecipe });
          res.status(200).send({
            data: listRecipe,
            image: imageRecipe,
            error: "",
          });
        }
        else
        {
          res.status(404).send({
            error: "Recipe kh??ng t???n t???i",
          });
        }
      } else {
        res.status(404).send({
          error: "Vui l??ng ????ng nh???p ????? xem chi ti???t",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: "Vui l??ng ????ng nh???p ????? xem chi ti???t",
      });
    }
  }
}
module.exports = new UserController();
