const express = require("express");
const router = express.Router();
const adminController = require("../app/Controllers/AdminController");


router.get("/show-blog-inconfirm", adminController.ShowBlogInconfirm);
router.get("/show-recipe-inconfirm", adminController.ShowRecipeInconfirm);
router.post("/confirm-blog", adminController.ConfirmBlog);
router.post("/confirm-recipe", adminController.ConfirmRecipe);
router.put("/delete-blog", adminController.DeleteBlog);
router.put("/delete-recipe", adminController.DeleteRecipe);
router.get("/show-blog-delete", adminController.ShowBlogDelete);
router.get("/show-recipe-delete", adminController.ShowRecipeDelete);
router.get("/show-users", adminController.ShowUser);
router.get("/show-collaborator", adminController.ShowCollaborator);
router.put("/edit-information-user", adminController.EditInformationUserAll);

module.exports = router;