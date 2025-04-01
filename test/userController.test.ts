import request from 'supertest';
import app from '../src/index';

let superadminEmail: string;

beforeAll(async () => {
  const response = await request(app)
    .post('/api/users')
    .send({
      nombre: 'Super Admin',
      correo: 'superadmin@example.com',
      contraseña: 'supersecurepassword',
      rol: 'superadmin',
    });

  superadminEmail = response.body.data.correo;
});

// Prueba para obtener el usuario por correo
describe('GET /api/users', () => {
  it('debería obtener el usuario usando el correo', async () => {
    const response = await request(app)
      .get(`/api/users?correo=${superadminEmail}`);

    expect(response.status).toBe(200);
    expect(response.body.data).toHaveProperty('correo', superadminEmail);
  });
});

// Prueba para crear un nuevo usuario
describe('POST /api/users', () => {
  it('debería crear un nuevo usuario', async () => {
    const newUser = {
      nombre: 'Usuario de Prueba',
      correo: 'testuser@example.com',
      contraseña: 'password123',
      rol: 'user',
    };

    const response = await request(app)
      .post('/api/users')
      .send(newUser);

    expect(response.status).toBe(201);
    expect(response.body.data).toHaveProperty('correo', newUser.correo);
  });
});
