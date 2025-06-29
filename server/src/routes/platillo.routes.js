const { isAdmin } = require("../middleware/auth.middleware.js"); // Importar middleware

module.exports = app => {
  const platillos = require("../controllers/platillo.controller.js");

  var router = require("express").Router();

  router.post("/", isAdmin, platillos.create);

  router.get("/", platillos.findAll);

  router.get("/:id", platillos.findOne);

  router.put("/:id", isAdmin, platillos.update);

  router.delete("/:id", isAdmin, platillos.delete);

  router.delete("/deleteAll", isAdmin, platillos.deleteAll); 

  app.use('/api/platillos', router);
}; 