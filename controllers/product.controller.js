'use strict'

var Product = require('../models/product.model');
var Category = require('../models/category.model');


function setProduct(req,res){
    var categoryId = req.params.id;
    var params = req.body;

    if(params.name && params.price && params.stock){
        Category.findById(categoryId,(err,categoryFind)=>{
            if(err){
                return res.status(500).send({message: 'Error al intentar buscar'});
            }else if(categoryFind){
                Product.findOne({name: params.name},(err,productFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al intentar buscar producto'});
                    }else if(productFind){
                        return res.send({message: 'El producto ya existe'});
                    }else{
                        var product = new Product();
                        product.name = params.name;
                        product.price = params.price;
                        product.stock = params.stock;
                        product.save((err,productSaved)=>{
                            if(err){
                                return res.status(500).send({message: 'Error al intentar agregar'});
                            }else if(productSaved){
                                Category.findByIdAndUpdate(categoryId,{$push:{products:productSaved._id}},{new: true},(err,categoryUpdated)=>{
                                    if(err){
                                        return res.status(500).send({message: 'Error al agregar producto a categoría'});
                                    }else if(categoryUpdated){
                                        return res.send({message: 'Producto agregado a la categoría con éxito',categoryUpdated});
                                    }else{
                                        return res.status(404).send({message: 'No se agregó el producto a categoría'});
                                    }
                                })
                            }else{
                                return res.status(404).send({message: 'No se pudo guardar'});
                            }
                        })
                    }
                })
            }else{
                return res.status(403).send({message: 'La categoría no existe'});
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese los datos mínimos que son: (Nombre, precio y cantidad)'});
    }
}


function updateProduct(req,res){
    let categoryId = req.params.idC;
    let productId = req.params.idP;
    let update = req.body;

    if(update.stock){
        Product.findById(productId,(err,productFind)=>{
            if(err){
                return res.status(500).send({message: 'Error al intentar buscar producto'});
            }else if(productFind){
                Category.findOne({_id:categoryId,products:productId},(err,categoryFind)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al intentar buscar categoría'});
                    }else if(categoryFind){
                        Product.findByIdAndUpdate(productId,update,{new:true},(err,productUpdated)=>{
                            if(err){
                                return res.status(500).send({message: 'Error al actualizar el producto'});
                            }else if(productUpdated){
                                return res.send({message: 'Producto actualizado con éxito',productUpdated});
                            }else{
                                return res.status(404).send({message: 'No se pudo actualizar'});
                            }
                        })
                    }else{
                        return res.status(403).send({message: 'ID de la categoría no existe'});
                    }
                })
            }else{
                return res.status(403).send({message: 'ID de el producto no existe'});
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese los datos mínimos que son: (cantidad)'});
    }
}


function removeProduct(req,res){
    let categoryId = req.params.idC;
    let productId = req.params.idP;

    Category.findOneAndUpdate({_id:categoryId,products:productId},{$pull:{products:productId}},{new:true},(err,categoryUpdated)=>{
        if(err){
            return res.status(500).send({message: 'Error al intentar eliminar de categoría'});
        }else if(categoryUpdated){
            Product.findByIdAndRemove(productId,(err,productRemoved)=>{
                if(err){
                    return res.status(500).send({message: 'Error al intentar eliminar producto'});
                }else if(productRemoved){
                    return res.send({message: 'Producto eliminado con éxito'});
                }else{
                    return res.status(403).send({message: 'No se pudo eliminar'});
                }
            })
        }else{
            return res.status(404).send({message: 'Producto no existe o ya fue eliminado'});
        }
    })
}


function getProducts(req,res){
    Product.find({}).exec((err,productos)=>{
        if(err){
            return res.status(500).send({message: 'Error al intentar buscar'});
        }else if(productos){
            return res.send({message: 'Productos: ',productos});
        }else{
            return res.status(403).send({message: 'No se pudo encontrar productos'});
        }
    })
}


function searchProduct(req,res){
    var params = req.body;

    if(params.search){
        Product.find({name: params.search},(err,resultSearch)=>{
            if(err){
                return res.status(500).send({message: 'Error al intentar buscar coincidencias'});
            }else if(resultSearch){
                return res.send({message: 'Coincidencias encontradas: ',resultSearch});
            }else{
                return res.status(403).send({message: 'No se encontraron coincidencias'});
            }
        })
    }else if(params.search == ''){
        Product.find({}).exec((err,productos)=>{
            if(err){
                return res.status(500).send({message: 'Error al  intentar buscar'});
            }else if(productos){
                return res.send({message: 'Productos: ',productos});
            }else{
                return res.status(403).send({message: 'No se encontraron productos'});
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese el campo de búsqueda (search)'});
    }
}


function spentProducts(req,res){
    Product.find({stock: 0},(err,resultSearch)=>{
        if(err){
            return res.status(500).send({message: 'Error al intentar buscar productos agotados'});
        }else if(resultSearch){
            if(resultSearch != ''){
                return res.send({message: 'Productos agotados: ',resultSearch});
            }else{
                return res.status(404).send({message: 'No se encontraron productos agotados'});
            }
        }else{
            return res.status(404).send({message: 'No se encontraron productos agotados'});
        }
    })
}


module.exports = {
    setProduct,
    updateProduct,
    removeProduct,
    getProducts,
    searchProduct,
    spentProducts
}