
function busca(req, res) {
    const data = req.body;
    const busc = data.buscador + '%'
    //console.log(busc)

    req.getConnection((err, conn) => {
        conn.query('SELECT  a.costo, a.unidad, a.id_producto, a.name, b.descripcion, a.precio, c.description, a.imagen FROM product a, articulo b, units c WHERE a.tipo_art=b.tipo_art and a.unidad=c.unidad ORDER BY `name` ASC', (err, pers) => {
            req.getConnection((err, conn) => {
                conn.query('SELECT SUM(cantidad) AS canti FROM carrito WHERE email=?', [req.oidc.user.email], (err, cant) => {
                    req.getConnection((err, conn) => {
                        conn.query("SELECT a.costo, a.imagen, a.unidad, a.id_producto, a.name, b.descripcion, a.precio, c.description FROM product a, articulo b, units c WHERE a.tipo_art=b.tipo_art and a.unidad=c.unidad and a.name LIKE ? ORDER BY name ASC ", [busc], (err, pers) => {
                            let contador = cant[0].canti
                            //console.log(contador)
                            if (err) {
                                res.json(err);
                            }
                            //console.log("--------", pers)
                            res.render('pages/menu', { name: req.oidc.user.name, pers, contador });

                        })
                    })
                })
            })
        });
    });
}
module.exports = {
    busca,
}
