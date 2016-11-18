"use strict"

const basePath = process.cwd();
const fs = require('fs-extra');
const path = require('path');
var exec = require('child_process').exec;
const pkj = require(path.join(basePath, 'package.json'));
const git = require('simple-git');
const Heroku = require('heroku-client');
const inquirer = require('inquirer');
const jsonfile = require('jsonfile');

//-------------------------------------------------------------------------------------------------

var respuesta = ((error, stdout, stderr) =>
{
    if (error)
        console.error("Error:"+error);
    console.log("Stderr:"+stderr);
    console.log("Stdout:"+stdout);
});

//-------------------------------------------------------------------------------------------------

var deploy = (() => {
    console.log("Deploy to Heroku");
    exec('git add .; git commit -m "Deploy to Heroku"; git push heroku master', respuesta); 
});

//-------------------------------------------------------------------------------------------------

var escribir_gulpfile = (() => {
  
  return new Promise((resolve,reject) => {
    var tarea_gulp = `\n\ngulp.task("deploy-heroku", function(){`+
             `\n       require("gitbook-start-heroku-josue-nayra").deploy();`+
             `\n});`;

    fs.readFile('gulpfile.js', "utf8", function(err, data) {
        if (err) throw err;
        // console.log(data);
        if(data.search("deploy-heroku") != -1)
        {
          console.log("Ya existe una tarea de deploy-heroku");    
        }
        else
        {
          // console.log("No existe una tarea de deploy-iaas-ull-es");
          fs.appendFile(path.join(basePath,'gulpfile.js'), `${tarea_gulp}`, (err) => {
            if (err) throw err;
              console.log("Escribiendo tarea en gulpfile para próximos despliegues");
          });
        }
    });
  
  }); 
    
});

//-------------------------------------------------------------------------------------------------

var get_token = (() =>
{
  return new Promise((resolve,reject) =>
  {

      fs.readFile(path.join(process.env.HOME, '.gitbook-start','config.json'), (err,data) =>
      {
        if(err) throw err;
        var datos = JSON.parse(data);
        resolve(datos.token);
      });
  });
});

//-------------------------------------------------------------------------------------------------

var obtener_variables = (() =>
{
    return new Promise((result,reject) =>
    {
            get_token().then((resolve,reject) =>
            {
                var schema = [
                  {
                    name: 'clientID',
                    message: "Enter clientID for your application:"
                  },
                  {
                    name: 'clientSecret',
                    message: "Enter clientSecret for your application"
                  },
                  {
                    name: 'authentication',
                    message: "Do you want authentication?",
                    type: 'list',
                    default: 'Yes',
                    choices: ['Yes', 'No']
                  }
                ];

                inquirer.prompt(schema).then((respuestas) =>
                {
                    // console.log("Respuestas:"+JSON.stringify(respuestas));
                    result({ token: resolve, clientID: respuestas.clientID, clientSecret: respuestas.clientSecret, authentication: respuestas.authentication});
                });
            });
    });
});

//-------------------------------------------------------------------------------------------------

var generar_fileSecret = ((datos) =>
{
    return new Promise((resolve, reject) =>
    {
        var configuracion =
        `{ "token": "${datos.token}", "clientID": "${datos.clientID}", "clientSecret": "${datos.clientSecret}", "authentication": "${datos.authentication}" }`;

        fs.writeFile(path.join(basePath,'.secret.json'), configuracion, (err) =>
        {
          if(err) throw err;
        });
        resolve(configuracion);
    });
});

//-------------------------------------------------------------------------------------------------
// Funcion para cambiar el nombre del index.html y evitar ambiguedades.

var preparar_despliegue = (() => {
  return new Promise((resolve, reject) => {
      fs.rename(path.join(basePath,'gh-pages','index.html'), path.join(basePath,'gh-pages','introduccion.html'), (err) => {
        if (err) {
          console.log(err);
          throw err;
        }
        resolve(fs.existsSync(path.join(basePath,'gh-pages','introduccion.html')));
      });
  });
});

//-------------------------------------------------------------------------------------------------

var build_tokenHeroku = (() =>
{
  return new Promise((resolve,reject)=>
  {
    exec('heroku auth:token', ((error, stdout, stderr) =>
    {
      if (error)
      {
        console.error("Error:"+JSON.stringify(error));
        throw error;
      }

      console.log("Token heroku:"+stdout);

      var datos = `{ "token_heroku" : "${stdout}" }`;

      console.log("Datos:"+datos);

      fs.writeFile(path.join(process.env.HOME,'.heroku','heroku.json'), datos, (err) =>
      {
          if(err)
          {
            console.log(err);
            throw err;
          }
          resolve(stdout);
      });
    }));
  });
});


//-------------------------------------------------------------------------------------------------

var get_tokenHeroku = (() =>
{
    return new Promise((result,reject)=>
    {
      if(fs.existsSync(path.join(process.env.HOME,'.heroku')))
      {
          if(fs.existsSync(path.join(process.env.HOME,'.heroku','heroku.json')))
          {
            fs.readFile(path.join(process.env.HOME,'.heroku','heroku.json'), (err,data) =>
            {
                if(err)
                {
                  throw err;
                }

                var datos = JSON.parse(data);
                result(datos.token_heroku);
            });
          }
          else
          {
              build_tokenHeroku().then((resolve,reject) =>
              {
                 //Construyo el heroku.json
                 result(resolve);
              });
          }
      }
      else
      {
          fs.mkdirp(path.join(process.env.HOME,'.heroku'), (err) =>
          {
              if(err)
                throw err;

              build_tokenHeroku().then((resolve,reject) =>
              {
                  //Construyo heroku.json
                  result(resolve);
              });
          });
      }
    });
});

//-------------------------------------------------------------------------------------------------

var get_AppName = (() =>
{
    return new Promise((resolve,reject) =>
    {
        if((pkj.Heroku.nombre_app).match(/\S/g))
        {
            console.log("1");
            resolve(pkj.Heroku.nombre_app);
        }
        else
        {
            console.log("2");
            var schema = [
              {
                name: 'nombre_app',
                message: "Enter HerokuApp Name:"
              }
            ];

            inquirer.prompt(schema).then((respuestas) =>
            {
                //Escribir en el package.json
                fs.readFile(path.join(basePath,'package.json'),(err,data) =>
                {
                    if(err)
                      throw err;
                    // console.log("PREDATA:"+data);
                    var datos = JSON.parse(data);
                    // console.log("POSTDATA:"+datos);
                    datos.Heroku.nombre_app = respuestas.nombre_app;
                    // console.log("POSTDATA1:"+datos);
                    jsonfile.spaces = 10;
                    jsonfile.writeFileSync(path.join(basePath,'package.json'),datos,{spaces: 10});
                    // fs.writeFile(path.join(basesPath,'package.json'),JSON.stringify(datos),(err)=>
                    // {
                    //     if(err)
                    //       throw err;
                    // });
                });

                resolve(respuestas.nombre_app);
            });
        }
    });
});


//-------------------------------------------------------------------------------------------------

var crear_app = (() => {
  return new Promise((result,reject) => {
    console.log("Creando app.js y Procfile");
    fs.copy(path.join(__dirname,'template','app.js'), path.join(basePath, 'app.js'));
    fs.copy(path.join(__dirname,'template','Procfile'), path.join(basePath, 'Procfile'));

    fs.copy(path.join(__dirname,'template','views'), path.join(basePath,'views'), (err) =>
    {
        if(err)
        {
          console.log(err);
          throw err;
        }
    });

    //Copiamos ficheros necesarios para el uso de materialize
    fs.copy(path.join(__dirname,'template','public'), path.join(basePath, 'public'), (err) =>
    {
        if(err)
        {
          console.log("Error:"+err);
          throw err;
        }
    });
    
    //Creamos aplicacion
    get_tokenHeroku().then((resolve,reject) =>
    {
      console.log("RESOLVEEEE:"+resolve);
      const heroku = new Heroku({ token: resolve });

      // console.log("Nombre de la app:"+pkj.Heroku.nombre_app);
      get_AppName().then((resolve1,reject1) =>
      {
	      try {
		// console.log("EEEEEE MACARENA O SA MACARENA O LA LA MACARENA EH YEAH MEN");
		heroku.post('/apps', {body: {name: resolve1}}).then((app) => {

		      var respuesta = JSON.stringify(app);
		      var respuesta1 = JSON.parse(respuesta);
		      var git_url = respuesta1.git_url;
		      console.log("Git url:"+respuesta1.git_url);
		      git()
		        .init()
		        .add('./*')
		        .commit("Deploy to Heroku")
		        .addRemote('heroku', git_url);

		      result(respuesta1.git_url);
		});
	      } 
	      catch (e) {
		  throw e;
	      }
	});
    });
    
  }); 
});



//-------------------------------------------------------------------------------------------------

var initialize = (() => {
    console.log("Método initialize del plugin deploy-heroku");

    obtener_variables().then((resolve,reject) =>
    {
        // console.log("Obtener_variables:"+JSON.stringify(resolve));
        generar_fileSecret(resolve).then((resolve,reject) =>
        {
            // console.log("generar_fileSecret");
            preparar_despliegue().then((resolve, reject) => 
            {
              crear_app().then((resolve,reject) =>
              {
                    escribir_gulpfile();
              });  
            });
            
        });
    });
});

//-------------------------------------------------------------------------------------------------

exports.initialize = initialize;
exports.deploy = deploy;
