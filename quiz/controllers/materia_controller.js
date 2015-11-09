var models = require('../models/models.js');

// Autoload - factoriza el c�digo si ruta incluye :materiaId
exports.load = function(req, res, next, materiaId) {
	models.Materia.find({
		where : {
			id : Number(materiaId)
		},
	}).then(function(materia) {
		if (materia) {
			req.materia = materia;
			next();
		} else {
			next(new Error('No existe materiaId=' + materiaId));
		}
	}).catch(function(error) {
		next(error);
	});
};

// GET /materia/new
exports.index = function(req, res) {
	models.Materia.findAll().then(
                function(materias) {
    res.render('materias/index.ejs', {materias: materias});
});
}

// GET /materias/:materiaId
exports.show = function(req, res) {
    res.render('materias/show', {materia: req.materia});
};

// POST /quizes/create
exports.create = function(req, res) {
	var materia = models.Materia.build( req.body.materia );
	
	//guarda en DB los campos de materias
	materia.validate()
	.then(
		function(err){
			if(err) {
			res.render('materias/new', {materia: materia, errors: err.errors});
			} else {
				materia.save({fields: ["id", "materia", "ensenanza", "curso"]}).then(function(){
					res.redirect('/materias');
				})	//Redireccion HTTP (URL relativo) lista de materias
			}
		}
	);
};

//Elimina materia

exports.destroy = function(req, res) {
	req.materia.destroy().then(function() {
		res.redirect('/materias');
	}).catch(function(error) {
		next(error)
	});
}; 