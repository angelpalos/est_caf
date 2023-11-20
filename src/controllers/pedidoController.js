function mostrar_ped(req,res){
    const email = req.oidc.user.email;
    req.getConnection((err,conn) =>{
        conn.query('Select a.folio,b.tip_status from pedido a, status b where a.id_status=b.id_status and a.correo_clie=?',[email],(err,ped) =>{
            if(err) throw err;
            //console.log('Datos: ',ped);
            res.render('pages/lista_ped',{ped});
        })
    })
}

function return_menu(req,res){
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

function detalle(req,res){
    const email = req.oidc.user.email;
    const folio = req.body.folio;
    req.getConnection((err,conn)=>{
        conn.query('SELECT b.folio, b.id_status , c.name, a.cantidad, a.precio, a.id_producto FROM pedido b JOIN detalle a ON a.folio = b.folio JOIN product c ON a.id_producto = c.id_producto where b.folio = ? and b.correo_clie=?',[folio,email],(err,details)=>{
            console.log(details)
            res.render('pages/detalle',{details,folio:folio});
        })
    })
}

module.exports = {
    mostrar_ped,
    return_menu,
    detalle
}