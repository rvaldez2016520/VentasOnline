'use strict'

var Category = require('../models/category.model');


function deafultCategory(){
    var nombre = 'Default'
    Category.findOne({name: nombre},(err,categoryFind)=>{
        if(err){
            console.log('Error al intentar buscar',err);
        }else if(categoryFind){
            console.log('Categoría default creada con éxito');
        }else{
            var category = new Category();
            category.name = 'Default';
            category.save((err,categorySaved)=>{
                if(err){
                    console.log('Error al intentar agregar');
                }else if(categorySaved){
                    console.log('Categoría default creada con éxito');
                }else{
                    console.log('No se creó la categoría Default');
                }
            })
        }
    })
}


function createCategory(req,res){
    var params = req.body;
    
    if(params.name){
        Category.findOne({name: params.name},(err,categoryFind)=>{
            if(err){
                return res.status(500).send({message: 'Error al intentar buscar'});
            }else if(categoryFind){
                return res.send({message: 'La categoría ya existente, intente crear otra'});
            }else{
                var category = new Category();
                category.name = params.name;
                category.save((err,categorySaved)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al intentar agregar'});
                    }else if(categorySaved){
                        return res.send({message: 'Categoría creada con éxito',categorySaved});
                    }else{
                        return res.status(404).send({message: 'No se pudo guardar'});
                    }
                })
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese los datos mínimos que son: (Nombre)'})
    }
}


function updateCategory(req,res){
    let categoryId = req.params.id;
    let update = req.body;

    if(update.name){
        Category.findOne({name: update.name},(err,categoryFind)=>{
            if(err){
                return res.status(500).send({message: 'Error al intentar buscar'});
            }else if(categoryFind){
                return res.send({message: 'El nombre de la categoría ya existe'});
            }else{
                Category.findByIdAndUpdate(categoryId,update,{new:true},(err,categoryUpdated)=>{
                    if(err){
                        return res.status(500).send({message: 'Error al intentar actualizar'});
                    }else if(categoryUpdated){
                        return res.send({message: 'Categoría actualizada con éxito',categoryUpdated});
                    }else{
                        return res.status(500).send({message: 'No se pudo actualizar'});
                    }
                })
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese el nuevo nombre de la categoría'});
    }
}


function removeCategory(req,res){
    let categoryId = req.params.id;

    Category.findOne({_id : categoryId},(err,categoryFind)=>{
        if(err){
            return res.status(500).send({message: 'Error al intentar buscar'});
        }else if(categoryFind){
            var productos = categoryFind.products;
            Category.findOneAndUpdate({name: 'Default'},{$push:{products:productos}},{new: true},(err,categoryUpdated)=>{
                if(err){
                    return res.status(500).send({message: 'Error al intentar actualizar'});
                }else if(categoryUpdated){
                    Category.findOne({_id : categoryId},(err,categoryFind)=>{
                        if(err){
                            return res.status(500).send({message: 'Error al intentar buscar'});
                        }else if(categoryFind){
                            Category.findByIdAndRemove(categoryId,(err,categoryRemoved)=>{
                                if(err){
                                    return res.status(500).send({message: 'Error al intentar eliminar'});
                                }else if(categoryRemoved){
                                    return res.send({message: 'Categoría eliminada con éxito'});
                                }else{
                                    return res.status(404).send({message: 'No se pudo eliminar'});
                                }
                            })
                        }else{
                            return res.status(403).send({message: 'ID de la categoría no existe o ya fue eliminada'});
                        }
                    })
                }else{
                    return res.status(404).send({message: 'No se pudo actualizar'});
                }
            })
        }else{
            return res.status(403).send({message: 'ID de la categoría no existe o ya fue eliminada'});
        }
    })
}


function getCategories(req,res){
    Category.find({}).populate('products').exec((err,categories)=>{
        if(err){
            return res.status(500).send({message: 'Error al obtener los datos'});
        }else if(categories){
            return res.send({message: 'Categorías:',categories});
        }else{
            return res.status(403).send({message: 'No hay datos'});
        }
    })
}


function searchCategory(req,res){
    var params = req.body;

    if(params.search){
        Category.find({name: params.search},(err,categoryFind)=>{
            if(err){
                return res.status(500).send({message: 'Error al intentar buscar'});
            }else if(categoryFind){
                if(categoryFind != ''){
                    return res.send({message: 'Coinciencias encontradas: ',categoryFind});
                }else{
                    return res.status(404).send({message: 'No se encontraron coincidencias'});
                }
            }else{
                return res.status(404).send({message: 'No se encontraron coincidencias'});
            }
        })
    }else if(params.search == ''){
        Category.find({}).exec((err,categories)=>{
            if(err){
                return res.status(500).send({message: 'Error al intentar obtener los datos'});
            }else if(categories){
                return res.send({message: 'Categorías:',categories});
            }else{
                return res.status(403).send({message: 'No hay datos'});
            }
        })
    }else{
        return res.status(403).send({message: 'Ingrese el dato de búsqueda'});
    }
}


module.exports = {
    deafultCategory,
    createCategory,
    updateCategory,
    removeCategory,
    getCategories,
    searchCategory
}
