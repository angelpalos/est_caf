//se crea una constante que requiere y llama a 'bcrypt' que encripta informacion
const bcrypt = require('bcrypt');

//esta funcion sirve que al tener una sesion inciada ira a la raiz
//pero si la condicion no se cumple renderizara al Login
function index(req, res) {
  //console.log("Entre");
  if(req.oidc.isAuthenticated()){
    //console.log("Autentidado");
    res.redirect("/");
  } else{
    //console.log("NO autentidado");
    res.render("/logout");

  }
}

//esta funcion sirve que al tener una sesion inciada ira a la raiz
//pero si la condicion no se cumple ira del login al register
function register(req, res) {
  if (req.session.loggedin) {
    res.redirect('/');
  } else {
    res.render('login/register');
  }
  
}

//La fuincion tiene el trabajo de verificar si el usuario (email) se repite (Con el querie) entra a una condicion
//Que si es asi mandara un error al Usuario que dira 'El usuario ya existe'
//Si no es asi, la password se encriptara con la costante de 'bcrypt'
//Y toda la informacion del formulario se insertara a la base de datos (con el querie) 
function storeUser(req,res){
  const data=req.body;
  req.getConnection((err,conn) => {
    conn.query('SELECT * FROM users WHERE email= ?',[data.email], (err,userData) => {
      if (userData.length>0){
        res.render('login/register', {error: 'El usuario ya existe!'});
      } else {
        bcrypt.hash(data.password, 12).then(hash => {
          //console.log(hash);
          data.password=hash;
          //console.log(data);
          req.getConnection((err,conn) => {
              conn.query('INSERT INTO users SET ?',[data], (err,rows) => {
                res.redirect('/'); 
              });
          });
      
        });
      }
    });
  });
} 

//La fuincion hace una comparacion con la base de datos y la informacion dada en el formulario (Querie)
//Compara si el usuario (email) y el password es la misma con la base de datos, si es asi entarar a la raiz
//Si la informacion es erronea mandara un error que indicara que la informacion es incorrecta (siempre y cuando el email este en la base de datos)
//Si el email dado no se encuentra en la base de datos se mandara un error al usuario que le diara que la informacion no existe en ella
function auth(req, res) {
  const data = req.body;
	//let email = req.body.email;
	//let password = req.body.password;

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM users WHERE email = ?', [data.email], (err, userData) => {
      if(userData.length > 0) {
        userData.forEach(element => {
          bcrypt.compare(data.password,element.password, (err,isMatch) => {
            if(!isMatch){
              //console.log("out",userData);
              res.render('login/index', {error: '¡La contraseña o el correo electrónico es Incorrecto!'});
            } else {
              //console.log("wellcome");
              req.session.loggedin = true;
              req.session.name = element.name;
              res.redirect('/');
            }
          });   
        });     
      } else {
        res.render('login/index', {error: '¡La contraseña o el correo electrónico no existen!'});
      }    
    });
  });
}

//Hace que la sesion iniciada se cierrre y redirige al la pagina de "Login"
function logout(req, res) {
  if (req.session.loggedin == true) {
    req.session.destroy();
  }
  res.redirect('/login');
}

function mensaje(req, res){
  res.render('pages/mensaje')
}


//se exportan las funciones globalmente 
module.exports = {
  index: index,
  register: register,
  auth: auth,
  logout: logout,
  storeUser: storeUser,
  mensaje,
}

