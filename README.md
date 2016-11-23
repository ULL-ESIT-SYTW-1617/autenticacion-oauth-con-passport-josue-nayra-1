# Práctica 7. Sistemas y Tecnologías Web

## Plugin: Autenticación OAuth con Passport

El servidor proveído por el plugin (sea iaas o heroku) deberá autenticar que el lector del libro pertenece a una organización dada de GitHub (por ejemplo ULL-ESIT-SYTW-1617).
Si es el caso que pertenece podrá seguir leyendo el libro, sino será redirigido a la ruta de autenticación.


[Plugin: gitbook-start-heroku-p7-josue-nayra](https://github.com/ULL-ESIT-SYTW-1617/gitbook-start-heroku-josue-nayra)

**Versiones de los paquetes:**

* gitbook-start-josue-nayra: **latest**
* gitbook-start-heroku-p7-josue-nayra: **latest** (nuevo paquete para esta práctica)
* gitbook-start-iaas-ull-es-josue-nayra: **@1.1.9**


### Pasos a seguir:

Seguimos los pasos especificados de nuestro plugin para la creación del libro:

1- Descargar el paquete inicial: **gitbook-start-josue-nayra**

```bash
$ npm install -g gitbook-start-josue-nayra
```

2- Crear el libro mediante el comando:

```bash
$ gitbook-start -d <directorio> --autor <autor> --name <nombre_libro> --url <url_repo>
```

Se construye así la estructura inicial por **gitbook-start**, es decir, la jerarquía de directorios conteniendo los scripts y ficheros markdown para el libro.


3- Colocarse en la carpeta que contiene el libro.

```bash
$ cd <directorio en el que se ha desplegado el libro>
```


4- Instalar las dependencias necesarias mediante el comando:

```bash
$ npm install
```


5- Instalar el plugin requerido como dependendecia con la opción --save, como por ejemplo: **gitbook-start-heroku-p7-josue-nayra** para el despliegue en Heroku.

```bash
$ npm install --save gitbook-start-heroku-p7-josue-nayra
```


6- Es necesario tener el repositorio remoto actualizado. Para ello podemos ejecutar una de las tareas descritas en el gulpfile.

```
$ gulp push --mensaje <mensaje commit>
```


7- Nos **logueamos en Heroku** a través del siguiente comando:

```bash
$ heroku login
```


8- Ahora debemos **asignarle un nombre a la aplicación** de Heroku que se creará en el siguiente paso. Para ello accedemos al package.json y rellenamos la sección de Heroku:

```json
  "Heroku":{
    "nombre_app": "<nombre de la aplicación"
  },
```


9- Construcción del libro. Para hacerlo disponemos de una tarea en el gulpfile denominada **"build"**.

```bash
$ gulp build
```

10.- Previamente a crear nuestra APP en Heroku, debemos configurar una Oauth Application en Github, puesto que en el paso siguiente se pide que se introduzca por pantalla un clientID y un clientSecret para la misma. Debemos acceder al siguiente enlace y hacer click en "Register a new Application":

  [Generar Oauth Application](https://github.com/settings/developers)

NOTA: Es importante rellenar correctamente las secciones de **Homepage URL (*http://localhost:8080/home*)** y **Authorization callback URL(*http:// < nombreAppHeroku > .herokuapp.com/login/github/return*)**.

11- Una vez que hemos instalado el plugin de Heroku,  ejecutamos el **deploy**:

```bash
$ gitbook-start --deploy heroku  
```

Una vez ejecutado el comando anterior, se generará automáticamente en el gulpfile.js una tarea llamada
"deploy-<máquina en la que realizar el despliegue>" que permitirá al usuario actualizar el contenido de dicha máquina.

```javascript
gulp.task("deploy-<máquina en la que realizar el despliegue>", function(){
    require(path.join(basePath, 'node_modules','<plugin de depliegue>')).deploy(...);
});
```


12- Ahora el usuario podrá ejecutar el siguiente comando y se le actualizarán los cambios en el Gitbook desplegado en Heroku:

```
$ gulp deploy-heroku
```


### Tareas Gulp


* **push**

Tarea habilitada para que el usuario pueda actualizar el repositorio que contiene el gitbook. Está disponible una opción --mensaje para especificar el mensaje del commit.

```bash
$ gulp push --mensaje <mensaje del commit>
```

* **instalar_recursos**

Tarea que permite al usuario instalar plugins y dependencias necesarias para su gitbook.

```bash
$ gulp instalar_recursos
```

* **build**

Tarea para la construcción del libro.

```bash
$ gulp build
```


* **deploy**

Tarea deploy genérica que actualiza las gh-pages del gitbook.
```
$ gulp deploy
```

* **deploy-heroku**

Tarea generada posteriormente a la realización y ejecución del comando gitbook-start --deploy, que permite al usuario realizar posteriores despliegues y actualizaciones de su gitbook en Heroku con gulp.
Por ejemplo, en el caso de que el usuario despliegue en Heroku, después de haber desplegado con la opción gitbook-start --deploy heroku, en el gulpfile se generará una tarea
con el nombre deploy-heroku.

```
$ gulp deploy-heroku
```


### Enlaces

- [Campus virtual](https://campusvirtual.ull.es/1617/course/view.php?id=1175)

- [Descripción de la práctica](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/practicas/practicapassport.html)

- [Publicación del paquete gitbook-start-josue-nayra](https://www.npmjs.com/package/gitbook-start-josue-nayra)

- [Plugin para el despliegue en IAAS](https://www.npmjs.com/package/gitbook-start-iaas-ull-es-josue-nayra)

- [Plugin para el despliegue con Heroku](https://www.npmjs.com/package/gitbook-start-heroku-p7-josue-nayra)

- [Repositorio del plugin IAAS](https://github.com/ULL-ESIT-SYTW-1617/gitbook-start-iaas-ull-es-josue-nayra)

- [Repositorio de gitbook-start-josue-nayra](https://github.com/ULL-ESIT-SYTW-1617/crear-repositorio-en-github-josue-nayra.git)



### Referencias

- [Tutorial para publicar paquetes nodejs](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/nodejspackages.html)

- [Gulp](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/gulp/)

- [Uso de templates](https://www.npmjs.com/package/ejs)

- [Fyle System de Nodejs para el manejo de archivos](https://casianorodriguezleon.gitbooks.io/ull-esit-1617/content/apuntes/fs.html)

- [Construyendo package.json](https://docs.npmjs.com/files/package.json)



### Integrantes

- Josué Toledo Castro
    [Github personal](www.github.com/JosueTC94)
- María Nayra Rodríguez Pérez
    [Github personal](www.github.com/alu0100406122)
