require("dotenv").config();
const User = require("../Models/User");
const Role = require("../Models/Role");
const Blog = require("../Models/Blog");
const Recipe = require("../Models/Recipe");
const BlogImage = require("../Models/BlogImage");
const RecipeImage = require("../Models/RecipeImage");
const FavoriteBlog = require("../Models/FavoriteBlog");
const FavoriteRecipe = require("../Models/FavoriteRecipe");
const serviceAccount = require("../../../serviceAccountKey.json");
const nodemailer = require("nodemailer");
const {
  createToken,
  verifyToken,
  createTokenTime,
  makePassword,
} = require("./index");
class MeController {
  // Get /admin/show-blog-inconfirm
  async ShowBlogInconfirm(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role._doc.RoleName == "Admin") {
        var listBlog = await Blog.find({ Status: "INCONFIRM" });
        console.log(listBlog)
        res.status(200).send({
          data: listBlog,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "No Autheraziton",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Get /me/show-recipe-inconfirm
  async ShowRecipeInconfirm(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role._doc.RoleName == "Admin") {
        var listRecipe = await Recipe.find({ Status: "INCONFIRM" });
        res.status(200).send({
          data: listRecipe,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "No Autheraziton",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  //Post admin/confirm-blog
  async ConfirmBlog(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      var _IDBlog = req.query.id;
      var updateValue = { Status: "CONFIRM" };
      const _id = await verifyToken(token);
      var result = await User.findOne({ _id }); //muc dich la lay role
      if (result != null) {
        const roleDT = result._doc.IDRole;
        var role = await Role.findOne({ _id: roleDT });
        if (role._doc.RoleName == "Admin") {
          var check = await Blog.findOne({ _id: _IDBlog });
          if (check != null) {
            var user = await User.findOne({ _id: check._doc.IDAuthor });
            var emailUser = user._doc.Email;
            console.log(emailUser);
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
            var nameBlog = `${check.BlogTitle}`;
            var mailOptions = {
              to: emailUser,
              from: process.env.EmailAdmin,
              subject: "Confirm Blog",
              text:
                "Blog " +
                nameBlog +
                " đã được admin xác nhận và đăng lên Blog cộng đồng.",
            };
            smtpTransport.sendMail(
              mailOptions,
              async function (error, response) {
                if (error) {
                  console.log(error);
                  res.status(400).send({
                    data: "null",
                    error: "Gửi không thành công",
                  });
                } else {
                  var resultBlog = await Blog.findOneAndUpdate(
                    { _id: _IDBlog },
                    updateValue,
                    {
                      new: true,
                    }
                  );
                  res.status(200).send({
                    Data: resultBlog,
                    Success: "Đã gửi Email thành công",
                    error: "null",
                  });
                }
              }
            );
          } else {
            res.status(400).send({
              data: "",
              error: "No Blog",
            });
          }
        } else {
          res.status(404).send({
            data: "",
            error: "No Authentication",
          });
        }
      } else {
        res.status(404).send({
          data: "",
          error: "Not found user!",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  //Post admin/confirm-Recipe
  async ConfirmRecipe(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      var _IDRecipe = req.query.id;
      var updateValue = { Status: "CONFIRM" };
      const _id = await verifyToken(token);
      var result = await User.findOne({ _id }); //muc dich la lay role
      if (result != null) {
        const roleDT = result._doc.IDRole;
        var role = await Role.findOne({ _id: roleDT });
        if (role._doc.RoleName == "Admin") {
          var check = await Recipe.findOne({ _id: _IDRecipe });
          if (check != null) {
            var user = await User.findOne({ _id: check._doc.IDAuthor });
            var emailUser = user._doc.Email;
            console.log(emailUser);
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
            var nameRecipe = `${check.RecipesTitle}`;
            var mailOptions = {
              to: emailUser,
              from: process.env.EmailAdmin,
              subject: "Confirm Blog",
              text:
                "Recipe " +
                nameRecipe +
                " đã được admin xác nhận và đăng lên Recipes cộng đồng.",
            };
            smtpTransport.sendMail(
              mailOptions,
              async function (error, response) {
                if (error) {
                  console.log(error);
                  res.status(400).send({
                    data: "null",
                    error: "Gửi không thành công",
                  });
                } else {
                  var resultRecipe = await Recipe.findOneAndUpdate(
                    { _id: _IDRecipe },
                    updateValue,
                    {
                      new: true,
                    }
                  );
                  res.status(200).send({
                    Data: resultRecipe,
                    Success: "Đã gửi Email thành công",
                    error: "null",
                  });
                }
              }
            );
          } else {
            res.status(400).send({
              data: "",
              error: "No Recipes",
            });
          }
        } else {
          res.status(404).send({
            data: "",
            error: "No Authentication",
          });
        }
      } else {
        res.status(404).send({
          data: "",
          error: "Not found user!",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }

  // Delete admin/delete-blog
  async DeleteBlog(req, res, next) {
    try {
      var _IDBlog = req.query.id;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role.RoleName == "Admin") {
        var update = {Status: "Deleted"};
        var updateBlog = await Blog.findOneAndUpdate( {_id: _IDBlog},
          update,
          {
            new: true,
          }
          );
        res.status(200).send({
          data: "Xóa thành công",
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "No Autheraziton",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: error,
        error: "Internal Server Error",
      });
    }
  }
  // Delete admin/delete-recipe
  async DeleteRecipe(req, res, next) {
    try {
      var _IDRecipe = req.query.id;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role.RoleName == "Admin") {
        var update = {Status: "Deleted"};
        var updateRecipe = await Recipe.findOneAndUpdate( 
          {_id: _IDRecipe},
          update,
          {
            new: true,
          }
          );
        res.status(200).send({
          data: "Xóa thành công",
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "No Autheraziton",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: error,
        error: "Internal Server Error",
      });
    }
  }
  // Get /admin/show-blog-delete
  async ShowBlogDelete(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role._doc.RoleName == "Admin") {
        var listBlog = await Blog.find({ Status: "Deleted" });
        res.status(200).send({
          data: listBlog,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "No Autheraziton",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Get /me/show-recipe-delete
  async ShowRecipeDelete(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role._doc.RoleName == "Admin") {
        var listRecipe = await Recipe.find({ Status: "Deleted" });
        res.status(200).send({
          data: listRecipe,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "No Autheraziton",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }

  // Get admin/show-users
  async ShowUser(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role._doc.RoleName == "Admin") {
        var listUser = await User.find({ IDRole: "609d2ceafee09d75f011158b" });
        res.status(200).send({
          data: listUser,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "No Autheraziton",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  //Get admin/show-collaborator
  async ShowCollaborator(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var role = await Role.findOne({ _id: userDb._doc.IDRole });
      if (role._doc.RoleName == "Admin") {
        var listUser = await User.find({ IDRole: "609d2d03fee09d75f011158c" });
        res.status(200).send({
          data: listUser,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "No Autheraziton",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }

  //put admin/edit-information-user
  async EditInformationUserAll(req, res, next) {
    try {
      var idUser = req.query.id;
      const {
        FullName,
        Status
      } = req.body;
      var update = {
        FullName,
        Status
      }
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      var resultUser = await User.findOne({ _id, Status: "ACTIVE" }); //muc dich la lay role
      var role = await Role.findOne({ _id: resultUser._doc.IDRole });
      if (role._doc.RoleName == "Admin") {
        resultUser = await User.findOneAndUpdate(
          {_id: idUser},
          update,
          {
            new: true,
          }
        );
        res.status(200).send({
          data: resultUser,
          error: "null",
        });
      } else {
        res.status(404).send({
          data: "",
          error: "Not found user!",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
}
module.exports = new MeController();
