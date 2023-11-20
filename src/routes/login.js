const express = require('express');
const { requiresAuth } = require('express-openid-connect');
const LoginController = require('../controllers/LoginController');
const carritoController = require('../controllers/carritoController');
const MenuController = require('../controllers/MenuController');
const pedidoController = require('../controllers/pedidoController');

const router = express.Router();

router.get('/login', LoginController.index);
router.get('/register', LoginController.register);
router.post('/register', LoginController.storeUser);
router.post('/login', LoginController.auth);
router.get('/logout', LoginController.logout);
router.get('/mensaje', LoginController.mensaje);


router.get('/carrito', carritoController.indexcr);
router.post('/pers/agregar', carritoController.agregar);
router.post('/pers/elimina', carritoController.elimina);
router.get('/comprar', carritoController.pedido);
router.get('/pedido/:id',carritoController.recp);
router.post('/pers/agregacarrito', carritoController.agregacarrito);

router.post('/pers/busca', MenuController.busca);

router.get('/pedidos',pedidoController.mostrar_ped);
router.get('/menu',pedidoController.return_menu);
router.post('/detalle',pedidoController.detalle);


module.exports = router;
