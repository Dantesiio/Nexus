
# Nexus - Sistema de Gestión con Node.js, TypeScript y MongoDB

## Descripción

Nexus es una API RESTful robusta desarrollada con Node.js, TypeScript y MongoDB, que implementa un sistema de autenticación y autorización basado en JWT. La aplicación permite operaciones CRUD en el módulo de usuarios y en módulos adicionales relacionados entre sí.

## Características

-   **Autenticación y Autorización**: Sistema completo de autenticación mediante JWT y control de acceso basado en roles.
    
-   **Gestión de Usuarios**: Operaciones CRUD completas con roles (superadmin, usuario regular).
    
-   **Arquitectura Modular**: Estructura organizada en controladores, servicios, modelos y rutas.
    
-   **Validación de Datos**: Validación robusta de entradas de usuario.
    
-   **Manejo de Errores**: Sistema centralizado de manejo de errores.
    
-   **Base de Datos**: Integración completa con MongoDB.
    
-   **Docker**: Configuración lista para despliegue con Docker y Docker Compose.
  

## Requisitos

-   Node.js 18 o superior
    
-   MongoDB 6.0 o superior
    
-   Docker y Docker Compose (opcional)
    

## Instalación

### Usando NPM

```
git clone https://github.com/Dantesiio/Nexus.git
cd nexus
npm install
```

Configurar variables de entorno:

-   Crear un archivo `.env` basado en el ejemplo `.env.example`
    

```
npm run build
npm start
```

### Usando Docker

```
git clone https://github.com/Dantesiio/Nexus.git
cd nexus
docker-compose up -d
```

## Endpoints de la API

### Autenticación

-   `POST /api/auth/login` - Iniciar sesión
    
-   `GET /api/auth/profile` - Obtener perfil del usuario autenticado
    

### Usuarios (requiere rol superadmin)

-   `GET /api/usuarios` - Obtener todos los usuarios
    
-   `GET /api/usuarios/:id` - Obtener un usuario específico
    
-   `POST /api/usuarios` - Crear un nuevo usuario
    
-   `PUT /api/usuarios/:id` - Actualizar un usuario
    
-   `DELETE /api/usuarios/:id` - Eliminar un usuario
    

## Pruebas con Postman

Se incluye una colección de Postman para probar todos los endpoints de la API.

### Pasos para probar la API:

1.  Importar la colección de Postman ubicada en `docs/postman_collection.json`.
    
2.  Configurar las variables de entorno en Postman.
    
3.  Ejecutar la solicitud de login y copiar el token generado.
    
4.  Probar los diferentes endpoints utilizando el token de autenticación.
    

## Seguridad

-   **Almacenamiento seguro de contraseñas mediante bcrypt**
    
-   **Autorización basada en roles**
    
-   **Protección de rutas sensibles**
    
-   **Validación de entradas**
    
-   **Manejo seguro de JWT**
    

## Despliegue

## Dificultades encontradas y soluciones

-   **Problema**: Conflictos con Docker al tener contenedores existentes con los mismos nombres.
    
    -   **Solución**: Usar nombres específicos para los contenedores, redes y volúmenes en el proyecto.
        
-   **Problema**: Manejo de errores de Mongoose en TypeScript.
    
    -   **Solución**: Implementación de un middleware centralizado de manejo de errores con tipado correcto.
        
-   **Problema**: Configuración incorrecta de variables de entorno.
    
    -   **Solución**: Se creó un archivo `.env.example` como referencia.
