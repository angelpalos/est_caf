//esta funcion hace que aparezca toda la informacion de la tabla carrito
function indexcr(req, res) {
  const name = req.oidc.user.email
  const id = req.params.id
  req.getConnection((err, conn) => {
    //hace una consulta en la base de datos y recupera la informacion consultado
    conn.query('SELECT a.id_producto, a.email, b.name, a.cantidad, b.precio FROM carrito a, product b  WHERE a.id_producto=b.id_producto and a.email=?', [name],(err, pers) => {
      if (err) {  
        res.json(err);
      }
      req.getConnection((err,conn) => {
        conn.query('SELECT SUM(cantidad*precio) FROM carrito WHERE id_producto',[id],(err,tota) =>{
          const to = tota[0]["SUM(cantidad*precio)"]
          res.render('pages/carrito',{pers,total: to, name: req.oidc.user.name})
          console.log(tota, '---------')
        })
      })
      //console.log("--------", pers)
      //rederiza la pagina de carrito
      //res.render('pages/carrito', { pers, name: req.oidc.user.name });
    });
  });
}

//agrega los productos solicitados al carrito de compras por medio de los queries 
//se definen dos constantes y recolecta el email obtenuido del auth0
function agregar(req, res) {
  const data = req.body
  const name = req.oidc.user.email
  //console.log("Nombre: ",name);

  req.getConnection((err, conn) => { 
    conn.query('SELECT * FROM carrito WHERE id_producto = ? AND email = ?, precio =?', [data.id_producto, name, data.precio], (err, rows) => {
      //valida si ya existe el producto, si es asi se actualiza la columna de cantidad agregando una unidad mas
      if (rows.length > 0) {
        const can = rows[0].cantidad + 1
        req.getConnection((err, conn) => {
          conn.query('UPDATE carrito SET cantidad = ? WHERE id_producto= ? AND email = ?, precio =?', [can, data.id_producto, name, data.precio], (err, carr) => {
            if (err) throw err;
            res.redirect('/')
          });
        });
      } else {
        //agrega los productos solicitados al carrito de compras por medio de los queries 
        req.getConnection((err, conn) => {
          conn.query('INSERT INTO carrito SET id_producto = ?, email = ?,cantidad = 1, precio =?', [data.id_producto, name, data.precio], (err, carr) => {
            if (err) throw err;
            res.redirect('/');
          });
        });
      }
    })
  })
}

//esta funcion selecciona, actualiza y/o borra la columna de cantidad
//recolecta el correo del usuario del auth0 
function elimina(req, res) {
  const data = req.body;
  const name = req.oidc.user.email
  //console.log(data)
  req.getConnection((err, conn) => {
    //selecciona la tabla de carrito
    conn.query('SELECT * FROM carrito WHERE id_producto = ? AND email = ?', [data.id_producto, name], (err, rows) => {
      //console.log(rows)
      //valida si ya existe el producto, si es asi se actualiza la columna de cantidad restando una unidad
      const can = rows[0].cantidad - 1;
      if (can >= 1) {
        req.getConnection((err, conn) => {
          conn.query('UPDATE carrito SET cantidad = ? WHERE id_producto= ? AND email = ?', [can, data.id_producto, name], (errr, carr) => {
            if (errr) throw err;
            res.redirect('/carrito')
          });
        });
      } else {
        //si esta la cantidad de una unidad, se elimina de la tabla de carrito
        req.getConnection((errr, conn) => {
          conn.query('DELETE FROM carrito WHERE id_producto= ? AND email = ?', [data.id_producto, name], (err, carr) => {
            if (errr) throw err;
            res.redirect('/carrito');

          });
        });
      }
    })
  })
}

function pedido(req, res){
  const name = req.oidc.user.email
  let date = new Date();
  let datenow =  date.getFullYear() + '-' + String(date.getMonth() + 1).padStart(2, '0') + '-' + String(date.getDate()).padStart(2, '0');
  req.getConnection((err, conn) => {
    //selecciona la tabla de carrito
    conn.query("INSERT INTO pedido (fecha,id_status,correo_clie) VALUES (?,1,?)",[datenow,name],(err,row)=>{
      if(err) throw err
      req.getConnection((err, conn) => {
        //selecciona la tabla de carrito
        conn.query('SELECT * FROM pedido',(err,data)=>{
          if(err) throw err
          const nump = data.length - 1;
          const num = data[nump].folio;
          //console.log(data);
          req.getConnection((err,conn) =>{
            conn.query('SELECT a.id_producto, a.email, a.cantidad, b.precio, b.name FROM carrito a, product b WHERE b.id_producto=a.id_producto and a.email=?',[name],(err,carr) =>{
              let cont = 0;
              let row = carr.length;
              while(cont < row){
                let carr_pr = carr[cont].name;
                console.log(carr_pr);
                conn.query('insert into detalle(folio,id_producto,cantidad,precio,name) values(?,?,?,?,?)',[num,carr[cont].id_producto,carr[cont].cantidad,carr[cont].precio,carr[cont].name],(err,details)=>{
                  if(err) throw err;
                })
                cont=cont+1;  
              }
              conn.query('DELETE FROM carrito WHERE email = ?',[name],(err,rowa) => {
                res.redirect('/pedido/'+num)
              })
            }) 
          })
        })
      });
    })
  });
}

function recp(req,res) {
  const id = req.params.id

      req.getConnection((err, conn) => {
        //selecciona la tabla de carrito
        conn.query('SELECT a.folio,a.fecha,d.tip_status,a.corre_emp,a.correo_clie,b.cantidad,b.precio,c.name FROM pedido a,detalle b, product c, status d WHERE a.folio = ? AND a.folio = b.folio AND b.id_producto = c.id_producto and a.id_status=d.id_status',[id],(err,ped)=>{
          //console.log(ped)
          if(err) throw err
            req.getConnection((err,conn) => {
              conn.query('SELECT SUM(cantidad*precio) FROM detalle WHERE folio =?',[id],(err,tota) =>{
                const to = tota[0]["SUM(cantidad*precio)"]
                res.render('pages/compra',{ped,total: to, name: req.oidc.user.name})
                console.log(to, '---------')
              })
            })
        })})
}

function agregacarrito(req, res){
  const data = req.body
  const name = req.oidc.user.email

  req.getConnection((err, conn) => {
    conn.query('SELECT * FROM carrito WHERE id_producto = ? AND email = ?', [data.id_producto, name], (err, rows) => {
      //valida si ya existe el producto, si es asi se actualiza la columna de cantidad agregando una unidad mas
      if (rows.length > 0) {
        const can = rows[0].cantidad + 1
        req.getConnection((err, conn) => {
          conn.query('UPDATE carrito SET cantidad = ? WHERE id_producto= ? AND email = ?', [can, data.id_producto, name], (err, carr) => {
            if (err) throw err;
            res.redirect('/carrito')
          });
        });
      }
    })
  })
      

}
//se exportan las funciones globalmente 
module.exports = {
  indexcr,
  agregar,
  elimina,
  pedido,
  recp,
  agregacarrito,
}