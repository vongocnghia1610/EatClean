const userRouter = require("./user");
const meRouter = require("./me");
const collaboratorRouter = require("./collaborator");
const adminRouter = require("./admin");
function route(app) {
  app.use("/user", userRouter);
  app.use("/me", meRouter);
  app.use("/collaborator", collaboratorRouter);
  app.use("/admin", adminRouter);
}
module.exports = route;
