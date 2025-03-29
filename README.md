# Nexus - Sistema de Gestión con Node.js, TypeScript y MongoDB

## Descripción

Nexus es una API RESTful robusta desarrollada con Node.js, TypeScript y MongoDB, que implementa un sistema de autenticación y autorización basado en JWT. La aplicación permite operaciones CRUD en el módulo de usuarios y en módulos adicionales relacionados entre sí.

## Características

- **Autenticación y Autorización**: Sistema completo de autenticación mediante JWT y control de acceso basado en roles.
- **Gestión de Usuarios**: Operaciones CRUD completas con roles (superadmin, usuario regular).
- **Arquitectura Modular**: Estructura organizada en controladores, servicios, modelos y rutas.
- **Validación de Datos**: Validación robusta de entradas de usuario.
- **Manejo de Errores**: Sistema centralizado de manejo de errores.
- **Base de Datos**: Integración completa con MongoDB.
- **Docker**: Configuración lista para despliegue con Docker y Docker Compose.

## Estructura del Proyecto

```
src/
├── controllers/       # Controladores de la aplicación
│   ├── index.ts
│   └── user.controller.ts
├── interfaces/        # Interfaces y tipos TypeScript
│   ├── course.interface.ts
│   ├── submission.interface.ts
│   ├── user.interface.ts
│   └── JwtRequest.interface.ts
├── lib/               # Utilidades y herramientas
│   ├── appError.ts
│   └── connectionDB.ts
├── middlewares/       # Middlewares de Express
│   ├── auth.middleware.ts
│   └── errorHandler.ts
├── models/            # Modelos de Mongoose
│   ├── course.model.ts
│   ├── submission.model.ts
│   └── user.model.ts
├── routes/            # Definición de rutas
│   ├── index.ts
│   └── user.route.ts
├── services/          # Servicios de lógica de negocio
│   ├── index.ts
│   └── user.service.ts
└── index.ts           # Punto de entrada de la aplicación
```

## Requisitos

- Node.js 18 o superior
- MongoDB 6.0 o superior
- Docker y Docker Compose (opcional)

## Instalación

### Usando NPM

1. Clonar el repositorio:
   ```bash
   it clone https://github.com/Dantesiio/Nexus.git
   cd nexus
   ```

2. Instalar dependencias:
   ```bash
   npm install
   ```

3. Configurar variables de entorno:
   - Crear un archivo `.env` basado en el ejemplo `.env.example`

4. Compilar el proyecto:
   ```bash
   npm run build
   ```

5. Iniciar la aplicación:
   ```bash
   npm start
   ```

### Usando Docker

1. Clonar el repositorio:
   ```bash
   git clone https://github.com/Dantesiio/Nexus.git
   cd nexus
   ```

2. Iniciar con Docker Compose:
   ```bash
   docker-compose up -d
   ```

## Endpoints de la API

### Autenticación

- `POST /api/auth/login` - Iniciar sesión
- `GET /api/auth/profile` - Obtener perfil del usuario autenticado

### Usuarios (requiere rol superadmin)

- `GET /api/usuarios` - Obtener todos los usuarios
- `GET /api/usuarios/:id` - Obtener un usuario específico
- `POST /api/usuarios` - Crear un nuevo usuario
- `PUT /api/usuarios/:id` - Actualizar un usuario
- `DELETE /api/usuarios/:id` - Eliminar un usuario

## Pruebas con Postman

Se incluye una colección de Postman para probar todos los endpoints de la API. La colección incluye:
- Variables de entorno para facilitar las pruebas
- Scripts para establecer automáticamente el token JWT después del login
- Ejemplos de solicitudes para todos los endpoints

### Pasos para probar la API:


## Seguridad

- Almacenamiento seguro de contraseñas mediante bcrypt
- Autorización basada en roles
- Protección de rutas sensibles
- Validación de entradas
- Manejo seguro de JWT

## Despliegue

## Dificultades encontradas y soluciones

- **Problema**: Conflictos con Docker al tener contenedores existentes con los mismos nombres.
  **Solución**: Usar nombres específicos para los contenedores, redes y volúmenes en el proyecto.

- **Problema**: Manejo de errores de Mongoose en TypeScript.
  **Solución**: Implementación de un middleware centralizado de manejo de errores con tipado correcto.

