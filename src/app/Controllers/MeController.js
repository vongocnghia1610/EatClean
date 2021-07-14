require("dotenv").config();
const User = require("../Models/User");
const Role = require("../Models/Role");
const Blog = require("../Models/Blog");
const Recipe = require("../Models/Recipe");
const BlogImage = require("../Models/BlogImage");
const RecipeImage = require("../Models/RecipeImage");
const FavoriteBlog = require("../Models/FavoriteBlog");
const FavoriteRecipe = require("../Models/FavoriteRecipe");
const Comment = require("../Models/Comment");
const twilio = require("twilio");
const client = twilio(process.env.accountSID, process.env.authToken);
const bcrypt = require("bcrypt");
const nodemailer = require("nodemailer");
const {
  createToken,
  verifyToken,
  createTokenTime,
  makePassword,
  UploadImage,
} = require("./index");
const { VerificationCheckInstance } = require("twilio/lib/rest/verify/v2/service/verificationCheck");
class MeController {
  //get me/information / get || post put delete
  async Information(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      var resultUser = await User.findOne({ _id, Status: "ACTIVE" }); //muc dich la lay role
      if (resultUser != null) {
        var token1 = await createToken(`${resultUser._id}`);
        resultUser._doc.token = token1;
        resultUser.save();
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
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  //Put me/change-password
  async ChangePassword(req, res, next) {
    try {
      const passwordOld = req.body.PasswordOld;
      const passwordNew = req.body.PasswordNew;
      const confirmPassword = req.body.ConfirmPassword;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      console.log(_id);
      var result = await User.findOne({ _id, Status: "ACTIVE" });
      console.log(result);
      if (result != null) {
        const isEqualPassword = await bcrypt.compare(
          passwordOld,
          result.Password
        );
        console.log(isEqualPassword);
        if (isEqualPassword) {
          if (passwordNew == confirmPassword) {
            const hashPassword = await bcrypt.hash(passwordNew, 5);
            result.Password = hashPassword;
            const token = await createToken(`${result._id}`);
            result._doc.token = token;
            result.save();
            res.status(200).send({
              data:result,
              error: "null"
            });
          } else {
            res.status(400).send({
              error: "New password is not same password confirm",
            });
          }
        } else {
          res.status(400).send({
            error: " Wrong Old Password ",
          });
        }
      }
      else
      {
        res.status(500).send({
          data: "null",
          error: "Token sai",
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
  //Post me/favorite-blog
  async FavortiteBlog(req, res, next) {
    try {
      const IDBlog = req.body.IDBlog;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const result = await User.findOne({ _id, Status: "ACTIVE" });

      if (result != null) {
        var fv = {
          IDUser: result._doc._id,
          IDBlog,
        };
        var favoriteBlog = await FavoriteBlog.create(fv);
        res.status(200).send({
          data: favoriteBlog,
          error: "",
        });
      } else {
        res.status(404).send({
          error: "User not found",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }

  //Post me/favorite-recipe
  async FavortiteRecipe(req, res, next) {
    try {
      const IDRecipe = req.body.IDRecipe;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const result = await User.findOne({ _id, Status: "ACTIVE" });

      if (result != null) {
        var fv = {
          IDUser: result._doc._id,
          IDRecipe,
        };
        var findFavortieRecipe = await FavoriteRecipe.find({IDUser: result._doc._id, IDRecipe: IDRecipe});
        console.log(findFavortieRecipe);
        if(findFavortieRecipe.length!=0)
        {
          res.status(404).send({
            data: "null",
            error: "Bạn đã có Recipe này trong danh sách yêu thích",
          });
        }
        else
        {
          var favoriteRecipe = await FavoriteRecipe.create(fv);
          res.status(200).send({
            data: favoriteRecipe,
            error: "",
          });
        }
      } else {
        res.status(404).send({
          error: "User not found",
        });
      }
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Get /me/show-blog
  async ShowBlog(req, res, next) {
    try {
      var listBlog = await Blog.find({ Status: "CONFIRM" }).sort({createdAt: -1});
      // var listBlog = await Blog.find({ Status: "CONFIRM" });
      res.status(200).send({
        data: listBlog,
        error: "",
      });
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Get /me/show-recipe
  async ShowRecipe(req, res, next) {
    try {
      var listRecipe = await Recipe.find({ Status: "CONFIRM" }).sort({createdAt: -1});
      res.status(200).send({
        data: listRecipe,
        error: "",
      });
    } catch (error) {
      res.status(500).send({
        data: "",
        error: error,
      });
    }
  }
  // Post create-comment
  async CreateComment(req, res, next) {
    try {
      const comment = req.body.Comment;
      const stars = req.body.Stars;
      const idRecipe = req.body.IDRecipe;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      if (userDb != null) {
        const commentRecipe = await Comment.create({
          Comment: comment,
          Stars: stars,
          IDUser: userDb._doc._id,
          IDRecipe: idRecipe,
        });
        res.status(200).send({
          data: commentRecipe,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "Not Found User",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: error,
        error: "Internal Server Error",
      });
    }
  }
  // Put edit-comment
  async EditComment(req, res, next) {
    try {
      const comment = req.body.Comment;
      const stars = req.body.Stars;
      const idComment = req.body.IDComment;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _Comment = await Comment.findOne({ _id: idComment });
      const _id = await verifyToken(token);
      if (_id == _Comment._doc.IDUser) {
        var update = {
          Comment: comment,
          Stars: stars,
        };
        var commentRecipe = await Comment.findOneAndUpdate(
          { _id: idComment },
          update,
          {
            new: true,
          }
        );
        res.status(200).send({
          data: commentRecipe,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "Not Found User",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: error,
        error: "Internal Server Error",
      });
    }
  }

  // Delete delete-comment
  async DeleteComment(req, res, next) {
    try {
      var update = {
        Status: "Deleted",
      };
      var _IDComment = req.query.id;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const userDb = await User.findOne({ _id, Status: "ACTIVE" });
      var comment = await Comment.findOne({ _id: _IDComment });
      if (comment._doc.IDUser == userDb._doc._id) {
        const commentUpdate = await Comment.findOneAndUpdate(
          { _id: _IDComment },
          update,
          {
            new: true,
          }
        );
        res.status(200).send({
          data: commentUpdate,
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
        data: error,
        error: "Internal Server Error",
      });
    }
  }

  //put me/edit-informationAnh
  async EditInformationAnh(req, res, next) {
    try {
      var FullName = req.body.FullName;
      var Email = req.body.Email;
      var SoDienThoai = req.body.SoDienThoai;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      var resultUser = await User.findOne({ _id, Status: "ACTIVE" }); //muc dich la lay role
      if (resultUser != null) {
        if (resultUser.Email == Email) {
          const token = await createToken(`${resultUser._id}`);
          if (req.files["Image"] != null) {
            var addImage = req.files["Image"][0];
            const urlImage = await UploadImage(addImage.filename, "Avatars/");
            resultUser = await User.findOneAndUpdate(
              { _id, Status: "ACTIVE" },
              {
                FullName,
                SoDienThoai,
                Image: urlImage,
              },
              {
                new: true,
              }
            );
            resultUser._doc.token = token;
            resultUser.save();
            res.status(200).send({
              data: resultUser,
              error: "null",
            });
          } else {
            resultUser = await User.findOneAndUpdate(
              { _id, Status: "ACTIVE" },
              {
                FullName,
                SoDienThoai,
              },
              {
                new: true,
              }
            );
            resultUser._doc.token = token;
            resultUser.save();
            res.status(200).send({
              data: resultUser,
              error: "null",
            });
          }
        } else {
          var resultUpdate = await User.find({ Email}); //muc dich la lay role
          if (resultUpdate.length > 0) {
            res.status(400).send({
              data: "null",
              error: "Email đã tồn tại",
            });
          }
          else
          {
            if (req.files["Image"] != null) {
              var addImage = req.files["Image"][0];
              const urlImage = await UploadImage(addImage.filename, "Avatars/");
              const token = await createToken(`${resultUser._id}`);
              resultUser = await User.findOneAndUpdate(
                { _id, Status: "ACTIVE" },
                {
                  FullName,
                  Email,
                  Image: urlImage,
                  SoDienThoai,
                },
                {
                  new: true,
                }
              );
              resultUser._doc.token = token;
              resultUser.save();
              res.status(200).send({
                data: resultUser,
                error: "null",
              });
            } else {
              resultUser = await User.findOneAndUpdate(
                { _id, Status: "ACTIVE" },
                {
                  FullName,
                  Email,
                  SoDienThoai,
                },
                {
                  new: true,
                }
              );
              resultUser._doc.token = token;
              resultUser.save();
              res.status(200).send({
                data: resultUser,
                error: "null",
              });
            }
          }
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
  async EditAnh(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      var resultUser = await User.findOne({ _id, Status: "ACTIVE" }); //muc dich la lay role
      if (resultUser != null) {
            if (req.files["Image"] != null) {
              var addImage = req.files["Image"][0];
              const urlImage = await UploadImage(addImage.filename, "Avatars/");
              resultUser = await User.findOneAndUpdate(
                { _id, Status: "ACTIVE" },
                {
                  Image: urlImage,
                },
                {
                  new: true,
                }
              );
              res.status(200).send({
                data: resultUser,
                error: "null",
              });
          }
          else
          {
            var imageOld = resultUser.Image;
            resultUser = await User.findOneAndUpdate(
              { _id, Status: "ACTIVE" },
              {
                Image: imageOld,
              },
              {
                new: true,
              }
            );
            res.status(200).send({
              data: resultUser,
              error: "null",
            });
          }
      }
      else
      {
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

    //get me/send-password-sms
    async SendPasswordSms(req, res, next) {
      try {
        var Username =req.query.Username;
        var SoDienThoai = req.query.SoDienThoai;
        var user = await User.findOne({ Username,SoDienThoai,Status: "ACTIVE" }); 
        console.log(user);
        if(user !=null)
        {
          var tachSoDienThoai = [];
          var k=0;
          for(let i=1;i<SoDienThoai.length;i++)
          {
            tachSoDienThoai[k]=SoDienThoai[i];
            k++;
          }
          tachSoDienThoai.toString();
          const token = await createTokenTime(`${user._id}`); 
          var url = `http://${req.headers.host}/me/reset-password-sms/${token}`; 
            client.messages
            .create({
              body: 'Nếu bạn muốn reset Password thì click vào link này thời gian link còn hiệu lực là 3 phút:'+`${url}`,
              from: process.env.Phone,
              to: '+84'+`${tachSoDienThoai}` //replace this with your registered phone number
            })
            .then((data)=> {
              res.status(200).send({
                data: data,
                error: "null",
              });
            })
            .catch((error)=> {
              res.status(400).send({
                data: "null",
                error: "Không gửi được qua SMS vì số điện thoại chưa được xác minh",
              });
            });
            console.log(url);
        }
        else
        {
          res.status(400).send({
            data: "null",
            error: "Username hoặc Số điện thoại không trùng khớp",
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

     //Post me/reset-password/:token
  async ResetPassword(req, res, next) {
    // const { Email, Password, TenDoanhNghiep, SoDienThoai, DiaChi, GiayPhep } = req.body;
    try {
      const token = req.params.token;
      const data = await verifyToken(token);
      console.log(data);
      const _id = data.data;
      console.log(_id);
      var result = await User.findOne({ _id });
      if (result != null) {
        var soDienThoai = result.SoDienThoai;
        var tachSoDienThoai = [];
        var k=0;
        for(let i=1;i<soDienThoai.length;i++)
        {
          tachSoDienThoai[k]=soDienThoai[i];
          k++;
        }
        tachSoDienThoai.toString();
        var passwordNew = makePassword(6);
        const hashPassword = await bcrypt.hash(passwordNew, 5);
        var updateValue = { Password: hashPassword };
        await User.findOneAndUpdate({ _id }, updateValue, {
          new: true,
        });
        client.messages
        .create({
          body: 'Pass mới của bạn là: '+`${passwordNew}`,
          from: process.env.Phone,
          to: '+84'+`${tachSoDienThoai}` //replace this with your registered phone number
        })
        .then((data)=> {
          res.status(200).send({
            data: "Đổi Password thành công",
            error: "null",
          });
        })
        .catch((error)=> {
          res.status(400).send({
            data: "null",
            error: "Không gửi được qua SMS vì số điện thoại chưa được xác minh",
          });
        });
      } else {
        res.status(400).send({
          error: "Not Found User",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(400).send("Token hết hạn");
    }
  }
   //Delete me/delete-favorite-recipe
   async DeleteFavortiteRecipe(req, res, next) {
    try {
      var IDRecipe = req.query.IDRecipe;
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const result = await User.findOne({ _id, Status: "ACTIVE" });
      if (result != null) {
        var IDUser = result._doc._id;
        var check= await FavoriteRecipe.deleteOne({IDUser: IDUser,IDRecipe: IDRecipe});
        if(check.n == 0)
        {
          res.status(200).send({
            data: "Recipe này hiện tại không được thêm vào danh sách yêu thích",
            error: "",
          });
        }
        else
        {
          res.status(200).send({
            data: "Xóa thành công",
            error: "",
          });
        }
      } else {
        res.status(404).send({
          error: "User not found",
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
     //Delete me/delete-favorite-blog
     async DeleteFavortiteBlog(req, res, next) {
      try {
        var IDBlog = req.query.IDBlog;
        const token = req.get("Authorization").replace("Bearer ", "");
        const _id = await verifyToken(token);
        const result = await User.findOne({ _id, Status: "ACTIVE" });
        if (result != null) {
          var IDUser = result._doc._id;
          console.log(IDUser);
          console.log(IDBlog);
          var check = await FavoriteBlog.deleteOne({IDUser,IDBlog});
          if(check.n == 0)
          {
            res.status(200).send({
              data: "Blog này hiện tại không được thêm vào danh sách yêu thích",
              error: "",
            });
          }
          else
          {
            res.status(200).send({
              data: "Xóa thành công",
              error: "",
            });
          }
        } else {
          res.status(404).send({
            error: "User not found",
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
    // Get /me/show-blog-favorite
  async ShowBlogFavorite(req, res, next) {
    try {
      const token = req.get("Authorization").replace("Bearer ", "");
      const _id = await verifyToken(token);
      const result = await User.findOne({ _id, Status: "ACTIVE" });
      var blog = [];
      if(result!=null)
      {
        var blogFavorite = await FavoriteBlog.find({IDUser: result._doc._id}).sort({createdAt: 1});
          for(var i=0;i<blogFavorite.length;i++)
          {
             blog[i] = await Blog.findOne( {_id: blogFavorite[i].IDBlog});
  
          }
          res.status(200).send({
            data: blog,
            error: "null",
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
    // Get /me/show-blog-recipe
    async ShowRecipeFavorite(req, res, next) {
      try {
        const token = req.get("Authorization").replace("Bearer ", "");
        const _id = await verifyToken(token);
        const result = await User.findOne({ _id, Status: "ACTIVE" });
        var recipe = [];
        if(result!=null)
        {
          var recipeFavorite = await FavoriteRecipe.find({IDUser: result._doc._id}).sort({createdAt: 1});
            for(var i=0;i<recipeFavorite.length;i++)
            {
              recipe[i] = await Recipe.findOne( {_id: recipeFavorite[i].IDRecipe});
    
            }
            res.status(200).send({
              data: recipe,
              error: "null",
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

     // get show-comment-recipe
  async ShowCommentRecipe(req, res, next) {
    try {
      var _id = req.query.IDRecipe;
      const recipe = await Recipe.findOne({ _id, Status: "CONFIRM" });
      if (recipe != null) {
        var resultComment = [];
        var binhluanRecipe =  await Comment.find({IDRecipe: _id,Status: "ACTIVE"}).sort({createdAt: -1});
        for(var i=0;i<binhluanRecipe.length;i++)
        {
          var update ={
            _id: "",
            Comment: "",
            IDRecipe: "",
            Image: "",
            Username:"",
            IDUser: ""
          }
          const user = await User.findOne({ _id: binhluanRecipe[i].IDUser, Status: "ACTIVE" });
          update._id=  binhluanRecipe[i]._id;
          update.Image = user.Image;
          update.Comment =  binhluanRecipe[i].Comment;
          update.IDRecipe =  binhluanRecipe[i].IDRecipe;
          update.Username =  user.Username;
          update.IDUser =  user._id;

          resultComment[i] = update;
        }
        res.status(200).send({
          data: resultComment,
          error: "",
        });
      } else {
        res.status(400).send({
          data: "",
          error: "Not Found Recipe",
        });
      }
    } catch (error) {
      console.log(error);
      res.status(500).send({
        data: error,
        error: "Internal Server Error",
      });
    }
  }
}
module.exports = new MeController();
