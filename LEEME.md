### Propósito:
- Generar reportes como archivos con extensión pdf de base de datos sqlserver 2008

### Que tiene incluido:
- Bootstrap 4+ & SCSS
- Express v4.16.4
- PdfKit 0.9.0

### Preparando el entorno por primera vez:
- Descargue e instale node desde:
    - https://nodejs.org/es/download/
- Cree una carpeta en el destino
- Abra una consola de comandos y clone el repositorio de github:
    - git clonne https://github.com/operezs/reporte-pdf.git
- Luego instale las dependencias con:
    - npm install 

### Cómo configurar la conexión con base de datos:
- Entrar en la carpeta "connection" y abrir el archivo "connect.js"
- Introducir los datos correspondientes a la base de datos privada:
    - user: 'username',        // usuario que tiene acceso a la conexión
    - password: 'pass',       // contraseña del usuario
    - server: '127.0.0.1',    // ip o nombre del servidor
    - database: 'JUNTAS'      // nombre de la base de datos

### Cómo ejecutar el proyecto:
- Abra la consola como administrador dentro del proyecto
- Escriba el comando npm start
- Diríjase al navegador y entre a la dirección:
    - http://localhost:3000/

### Generando el reporte:
- Complete los campos del formulario
- Presiones el botón "Crear Reporte"
- El reporte se descargará automáticamente en la carpeta de descargas 
por defecto de su navegador 

### Consideraciones finales:
- Para un proyecto de mayor envergadura, considere crear una aplicación 
de front-end que permita una mejor experiencia al usuario
- Migrar base de datos a motores más modernos y comerciales

