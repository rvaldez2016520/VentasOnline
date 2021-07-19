'use strict'

var Bill = require('../models/bill.model');
var User = require('../models/user.model');
var Cart = require('../models/cart.model');
var Product = require('../models/product.model');


function addBill(req,res){
    var userId = req.user.sub;

    Cart.findOne({owner: userId},(err,cartFind)=>{
        if(err){
            return res.status(500).send({message: 'Error al encontrar su carrito'});
        }else if(cartFind){
            if(cartFind.products != ''){
                let cantidad = cartFind.stock;
                let producto = cartFind.products;
                let i = 0;
                let j = 0;
                producto.forEach(element =>{
                    Product.findOne({_id:element},(err,productFind)=>{
                        if(err){
                            res.status(500).send({message: 'Error al encontrar el producto'})
                        }else if(productFind){
                            let stockP = productFind.stock;
                            if(stockP<cantidad[i]){
                                i++;
                                return res.send({message: 'Cantidad de carrito (stock) ahora no es válida'});
                            }else{
                                i++;
                            }
                        }else{
                        res.status(403).send({message: 'No se pudo encontrar el producto'});
                        }
                    })
                })
                producto.forEach(element =>{
                    Product.findOne({_id:element},(err,productFind)=>{
                        if(err){
                            res.status(500).send({message: 'Error al encontrar el producto'})
                        }else if(productFind){
                            let stockP = productFind.stock;
                            let stockT = stockP - cantidad[j];
                            j++;
                            Product.findByIdAndUpdate(element,{stock:stockT},{new:true},(err,stockUpdated)=>{
                                if(err){
                                    res.status(500).send({message: 'Error al intentar actualizar el stock'});
                                }else if(stockUpdated){
                                    console.log('El stock del producto se actualizó exitosamente');
                                }else{
                                    res.status(500).send({message: 'No se pudo actualizar'});
                                }
                            })
                        }else{
                        res.status(403).send({message: 'No se encontró el producto'});
                        }
                    })
                })
                var bill = new Bill();
                bill.name = req.user.name;
                bill.products = producto;
                bill.save((err,billSaved)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al intentar guardar la factura'});
                    }else if(billSaved){
                        User.findByIdAndUpdate(userId,{$push:{bills:billSaved._id}},{new:true},(err,userUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error al conectar factura con el usuario'});
                            }else if(userUpdated){
                                Cart.findOneAndRemove({owner: userId},(err,cartRemoved)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error al intentar eliminar el carrito'});
                                    }else if(cartRemoved){
                                        var cart = new Cart();
                                        cart.owner = req.user.sub;
                                        cart.save((err,cartSaved)=>{
                                            if(err){
                                                return res.status(500).send({message: 'Error al intentar limpiar el carrito'});
                                            }else if(cartSaved){
                                                return res.send({message: 'Carrito listo para otra realizar otra compra',billSaved});
                                            }else{
                                                return res.status(404).send({message: 'No se pudo limpiar el carrito'});
                                            }
                                        })
                                    }else{
                                        return res.status(404).send({message: 'El carrito no existe'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message: 'No se conectó la factura con el usuario'});
                            }
                        })
                    }else{
                        return res.status(404).send({message: 'Factura no creada'});
                    }
                })
            }else{
                return res.status(403).send({message: 'No tiene productos en su carrito'});
            }
        }else{
            return res.status(403).send({message: 'No se encontró el carrito'});
        }
    })
}


function getBills(req,res){
    var userId = req.user.sub;

    if(req.user.role == 'ROLE_ADMIN'){
        Bill.find({}).exec((err,bills)=>{
            if(err){
                return res.status(500).send({message: 'Error al obtener la factura'});
            }else if(bills){
                return res.send({message: 'Todas las facturas: ',bills});
            }else{
                return res.status(403).send({message: 'No hay facturas para mostrar'});
            }
        })
    }else{
        User.findOne({_id : userId}).populate('bills').exec((err,user)=>{
            if(err){
                console.log(err);
                return res.status(500).send({message: 'Error al intentar obtener los datos'});
            }else if(user){
                var facturas = user.bills;
                return res.send({message: 'Facturas: ',facturas});
            }else{
                return res.status(403).send({message: 'No hay registro'});
            }
        })
    }
}


function getProductsBill(req,res){
    var billId = req.params.id;

    Bill.findById({_id:billId}).populate('products').exec((err,billFind)=>{
        if(err){
            return res.status(500).send({message: 'Error al intentar buscar la factura'});
        }else if(billFind){
            var productos = billFind.products;
            return res.send({message: 'Los productos de la factura son: ',productos});
        }else{
            return res.status(403).send({message: 'ID de la factura no existe'});
        }
    })
}


function getMostProducts(req,res){
    Bill.find({}).populate('products').exec((err,bills)=>{
        if(err){
            return res.status(500).send({message: 'Error al intentar buscar productos'});
        }else if(bills){
            let productos = [];
            bills.forEach(element => {
                if(productos.includes(element.products)){
                    //No hace nada
                }else{
                    productos.push(element.products);
                }
            });
            return res.send({message: 'Los productos más vendidos: ',productos});
        }else{
            return res.status(403).send({message: 'No hay productos para mostrar'});
        }
    })
}


module.exports = {
    addBill,
    getBills,
    getProductsBill,
    getMostProducts
}