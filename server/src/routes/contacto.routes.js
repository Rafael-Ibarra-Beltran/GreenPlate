const { isAdmin } = require("../middleware/auth.middleware.js"); // Importar middleware

module.exports = app => {
  const contactos = require("../controllers/contacto.controller.js");
  var router = require("express").Router();

  router.post("/", contactos.create);

  router.get("/", isAdmin, contactos.findAll);
  router.get("/:id", isAdmin, contactos.findOne);
  router.put("/:id/estado", isAdmin, contactos.updateStatus);
  router.delete("/:id", isAdmin, contactos.delete);

  app.use('/api/contactos', router);
}; 