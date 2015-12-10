var models = require('../models/models.js'); //coje el modelo estructura de cuestionario

exports.load = function(req, res, next, cuestionarioId) {
		models.Cuestionario.find({
			where: {
				id: Number(cuestionarioId)
			},
			include: [{ model: models.Profesor }]
		}).then(function(cuestionario) {
			if(cuestionario) {
				req.cuestionario = cuestionario;
				next();
			} else { next(new Error('No existe commentId=' + cuestionarioId))}	
		}
	).catch(function(error){next(error)});
}

//  GET/cuestionarios VISTA DE LISTA CUESTIONARIOS
exports.index = function(req, res) {
	models.Cuestionario.findAll({
			include: [{ model: models.Profesor }]
		}).then(
                function(cuestionarios) {
    res.render('cuestionarios/index.ejs', {cuestionarios: cuestionarios});
});
}

// GET /cuestionarios/:id/edit
exports.edit = function(req, res) {
    var cuestionario = req.cuestionario; //autoload de instancia de cuestionario
    res.render('cuestionarios/edit', {cuestionario: cuestionario});
};

exports.update = function(req, res) {
    req.cuestionario.observaciones = req.body.cuestionario.observaciones;
    req.cuestionario.fechaFin = req.body.cuestionario.fechaFin;
    
    req.cuestionario
            .validate()
            .then(
            function(err){
                if(err){
                    res.render('cuestionarios/edit',{cuestionario: req.cuestionario});
                }else{
                    req.cuestionario
                            .save({fields:["observaciones","fechaFin"]})
                            .then(function(){res.redirect('/admin/cuestionarios');});
                }
            }
        );
};

// show
exports.show = function(req, res) {
	
	req.cuestionario.getQuizzes().then(
	function(quizes){
		 res.render('cuestionarios/show', {cuestionario: req.cuestionario, quizes: quizes});
	
	});
   
}


//Borrar cuestionarios
exports.destroy = function(req, res){
	req.cuestionario.destroy().then(function(){
        res.redirect('/admin/cuestionarios');
    }).catch(function(error){next(error)});
}
// GET /cuestionarios/new
exports.new = function(req, res) {
	var cuestionario = models.Cuestionario.build( //crea objeto cuestionario
	{creador: "Creador", observaciones: "Observaciones", fechaFin: "Fecha de Finalizacion"}
	);
    res.render('cuestionarios/new', {cuestionario: cuestionario});
};

// POST /cuestionario/create
exports.create = function(req, res) {
	var cuestionario = models.Cuestionario.build( req.body.cuestionario );
	cuestionario.set('creador',req.session.profesor.id);
	cuestionario.validate()
	.then(
		function(err){
			if(err) {
			res.render('cuestionarios/new', {cuestionario: cuestionario, errors: err.errors});
			} else {
				for(prop in cuestionario.dataValues) {console.log(prop + ' - ' + cuestionario[prop])};
				cuestionario.save({fields: ["fechaFin", "observaciones", "creador"]}).then(function(){
					res.redirect('/admin/cuestionarios');
				})	//Redireccion HTTP (URL relativo) lista de cuestionarios
			}
		}
	);
};


// POST /cuestionario/duplicate
exports.duplicate = function(req, res) {
	var cuestionario = models.Cuestionario.build();
	cuestionario.set('creador',req.session.profesor.id);
	cuestionario.set('fechaFin',req.cuestionario.fechaFin);
	cuestionario.set('observaciones',req.cuestionario.observaciones);
	
	
	cuestionario.validate()
	.then(
		function(err){
			if(err) {
			res.render('cuestionarios/new', {cuestionario: cuestionario, errors: err.errors});
			} else {
				for(prop in cuestionario.dataValues) {console.log(prop + ' - ' + cuestionario[prop])};
				cuestionario.save({fields: ["fechaFin", "observaciones", "creador"]}).then(function(){
					
					var quizesN = [];
					req.cuestionario.getQuizzes().then(function(quizes){
						for(i=0; i < quizes.length; i++){
							quizesN[i] = models.Quiz.build();
							quizesN[i].set('pregunta', quizes[i].pregunta);
							quizesN[i].set('respuesta', quizes[i].respuesta);
							quizesN[i].set('CuestionarioId', cuestionario.id);
							quizesN[i].save({fields: ["pregunta", "respuesta", "CuestionarioId"]});
						}
						
					}
					);
						
					
					res.redirect('/admin/cuestionarios');
				})	//Redireccion HTTP (URL relativo) lista de cuestionarios
			}
		}
	);
};
