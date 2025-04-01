import request from 'supertest';
import app from '../src/index';
import Course from '../src/models/course.model';
import mongoose from 'mongoose';


afterAll(async () => {
  await mongoose.connection.close();
});

afterEach(async () => {
  await Course.deleteMany({}); // Limpiar la base de datos después de cada prueba
});

describe('Course Controller', () => {
  it('should create a new course successfully', async () => {
    const courseData = {
      nombre: 'Matemáticas',
      docente: new mongoose.Types.ObjectId(),
      descripcion: 'Curso de matemáticas básicas',
      fecha_inicio: new Date(),
      fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      codigo: 'MAT101',
    };

    const response = await request(app).post('/api/courses').send(courseData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('nombre', 'Matemáticas');
  });

  it('should get all courses', async () => {
    await Course.create([
      { 
        nombre: 'Matemáticas', 
        docente: new mongoose.Types.ObjectId(), 
        descripcion: 'Curso básico', 
        fecha_inicio: new Date(), 
        fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)), 
        codigo: 'MAT101' 
      },
      { 
        nombre: 'Física', 
        docente: new mongoose.Types.ObjectId(), 
        descripcion: 'Curso avanzado', 
        fecha_inicio: new Date(), 
        fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)), 
        codigo: 'FIS102' 
      }
    ]);

    const response = await request(app).get('/api/courses');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(2);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty('nombre', 'Matemáticas');
  });

  it('should get a course by ID', async () => {
    const course = await Course.create({
      nombre: 'Química',
      docente: new mongoose.Types.ObjectId(),
      descripcion: 'Curso introductorio',
      fecha_inicio: new Date(),
      fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      codigo: 'QUI103',
    });

    const response = await request(app).get(`/api/courses/${course._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('nombre', 'Química');
  });

  it('should update a course by ID', async () => {
    const course = await Course.create({
      nombre: 'Biología',
      docente: new mongoose.Types.ObjectId(),
      descripcion: 'Curso inicial',
      fecha_inicio: new Date(),
      fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      codigo: 'BIO104',
    });

    const updateData = { descripcion: 'Curso actualizado' };

    const response = await request(app).put(`/api/courses/${course._id}`).send(updateData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('descripcion', 'Curso actualizado');
  });

  it('should delete a course by ID', async () => {
    const course = await Course.create({
      nombre: 'Historia',
      docente: new mongoose.Types.ObjectId(),
      descripcion: 'Curso histórico',
      fecha_inicio: new Date(),
      fecha_fin: new Date(new Date().setMonth(new Date().getMonth() + 1)),
      codigo: 'HIS105',
    });

    const response = await request(app).delete(`/api/courses/${course._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Curso eliminado correctamente');

    const deletedCourse = await Course.findById(course._id);
    expect(deletedCourse).toBeNull();
  });
});
