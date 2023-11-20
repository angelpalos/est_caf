//console.log('iniciando');

// Carga de librerias 
const express = require('express');
const { engine } = require('express-handlebars');
const myconnection = require('express-myconnection');
const mysql = require('mysql2');
const session = require('express-session');
const bodyParser = require('body-parser');
const { Session } = require('express-session');
const MemoryStore = require('memorystore')(session);

//Define que si hay un valor existente lo uso sino usa el ya definido
const PORT = process.env.PORT || 3000 ;

const DB_HOST = process.env.DB_HOST || 'localhost';
const DB_USER = process.env.DB_USER || 'root';
const DB_PASSWORD = process.env.DB_PASSWORD || '';
const DB_NAME = process.env.DB_NAME || 'sistema3bd';
const DB_PORT = process.env.DB_PORT || 3307;

console.log(DB_HOST,' ',DB_NAME,' ',DB_PASSWORD,' ',DB_PORT,' ',DB_USER);


//--------------------------------------------------------------
require('dotenv').config()

const { auth } = require('express-openid-connect');

const config = {
  authRequired: false,
  auth0Logout: true,
  secret: process.env.SECRET,
  baseURL: process.env.BASEURL,
  clientID: process.env.CLIENTID,
  issuerBaseURL: process.env.ISSUER
};

//--------------------------------------------------------------




//Definición de las rutas de acceso a procesos 
const loginRoutes = require('./routes/login');
const { alert } = require('./controllers/LoginController');

// creacion de la aplicación y asignación del puerto 
const app = express();
app.set('port',PORT);
//definicion de la carpeta de plantillas (templates, views)
app.set('views', __dirname+'/views');
//Define al motor de vistas de Node.js para usar el "hbs" 
//este usa templetes para renderizar HTML.
app.engine('hbs', engine({
    extname: '.hbs',
}))
//el motor de plantillas se define como Handlebars
app.set('view engine', 'hbs');
//configura el middleware mediante el paquete body-parser para analizar los cuerpos 
//de las solicitudes HTTP entrantes, Para analizar las solicitudes entrantes 
//con cargas útiles codificadas en URL, que a menudo se usan al enviar datos de 
//formularios HTML.
app.use(bodyParser.urlencoded({
    extended: true
}));
//configura el middleware para analizar las solicitudes entrantes con cargas JSON.
app.use(bodyParser.json());
//define las credenciales de conección a la Base de datos 
app.use(myconnection(mysql,{
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASSWORD,
    port: DB_PORT,
    database: DB_NAME
}));

//define los parametros para crear una sesión
app.use(session({
  cookie: { maxAge: 86400000 },
  store: new MemoryStore({
    checkPeriod: 86400000 // prune expired entries every 24h
  }),
    secret: 'secret',
    resave: true,
    saveUninitialized: true 
}));

//---------------------------------------------------------
// auth router attaches /login, /logout, and /callback routes to the baseURL
app.use(auth(config));  //ERROR

//---------------------------------------------------------

//En este caso específico, el middleware que se configura es loginRoutes 
//y se monta en la ruta raíz ('/'). 
//Esto significa que cualquier solicitud a la aplicación pasará primero por el 
//middleware loginRoutes antes de pasar a cualquier middleware posterior.
app.use('/',loginRoutes);


//este es método Express.js configura una ruta para la aplicación. 
//Toma dos parámetros: el primer parámetro es la ruta de la ruta y 
//el segundo parámetro es una función de devolución de llamada 
//que se ejecuta cuando se realiza una solicitud a esa ruta.
app.get('/', (req,res) => {
    //if (req.session.loggedin == true) {
    if(req.oidc.isAuthenticated()) {
        //console.log(req.oidc.user)
        let val = /\w+@\w.+[edu]+\.mx/;
        if(!val.test(req.oidc.user.email)){

            //console.log('error')
            
            res.redirect('/mensaje')
         }//
         else{
            //req.session.email = req.oidc.name.email
            req.getConnection((err, conn) => {
                conn.query('SELECT  a.costo, a.unidad, a.id_producto, a.name, b.descripcion, a.precio, c.description, a.imagen FROM product a, articulo b, units c WHERE a.tipo_art=b.tipo_art and a.unidad=c.unidad ORDER BY `name` ASC', (err, pers) => {
                  req.getConnection((err,conn) => {
                    conn.query('SELECT SUM(cantidad) AS canti FROM carrito WHERE email=?',[req.oidc.user.email],(err,cant)=>{
                      let contador = cant[0].canti
                      //console.log(contador)
                      if(err) {
                        res.json(err);
                      }
                      //console.log("--------",pers)
                      res.render('pages/menu',{name: req.oidc.user.name,pers,contador});
                    })
                  })
                });
              });       
             }      
    } else {
        //console.log("NO autenticado");
        res.redirect('/login');    
        
    }
})


/*app.get('/', (req,res) => {
    if (req.session.loggedin == true) {
        req.getConnection((err, conn) => {
            conn.query('SELECT  a.costo, a.unidad, a.id_producto, a.name, b.descripcion, a.precio, c.description, a.imagen FROM product a, articulo b, units c WHERE a.tipo_art=b.tipo_art and a.unidad=c.unidad ORDER BY `name` ASC', (err, pers) => {
              if(err) {
                res.json(err);
              }
              console.log("--------",pers)
              res.render('pages/menu', { pers, name:req.session.name});
            });
          });       
    } else {
        res.redirect('/login');
    }
})*/

//------------------------------------------------------------
// req.isAuthenticated is provided from the auth router
//app.get('/', (req, res) => {
//    res.send(req.oidc.isAuthenticated() ? 'Logged in' : 'Logged out');
// });
//------------------------------------------------------------

//inicia la ejecución de la aplicación en el puert 4000
app.listen (app.get('port'), () =>{
    console.log('listening on port ', app.get('port'));
})
