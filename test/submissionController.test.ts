import request from 'supertest';
import app from '../src/index'; // Importamos la app desde index.ts
import Submission from '../src/models/submission.model'; // Asumiendo que tienes un modelo Submission
import mongoose from 'mongoose';

describe('Submission Controller', () => {
  beforeEach(async () => {
    await Submission.deleteMany({}); // Limpiar la colección de entregas antes de cada prueba
  }, 10000); // Timeout de 10 segundos para dar tiempo a la conexión

  // Prueba para crear una nueva entrega (POST /api/submissions)
  it('should create a new submission successfully', async () => {
    const submissionData = {
      estudiante: new mongoose.Types.ObjectId(), // ID simulado de estudiante
      curso: new mongoose.Types.ObjectId(), // ID simulado de curso
      archivo: 'http://example.com/file.pdf', // URL simulada del archivo
      comentario: 'Entrega inicial',
    };

    const response = await request(app)
      .post('/api/submissions')
      .send(submissionData);

    expect(response.status).toBe(201);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('estudiante');
    expect(response.body.data).toHaveProperty('curso');
    expect(response.body.data).toHaveProperty('archivo', 'http://example.com/file.pdf');
    expect(response.body.data).toHaveProperty('comentario', 'Entrega inicial');
  });

  // Prueba para obtener todas las entregas (GET /api/submissions)
  it('should get all submissions', async () => {
    await Submission.create([
      {
        estudiante: new mongoose.Types.ObjectId(),
        curso: new mongoose.Types.ObjectId(),
        archivo: 'http://example.com/file1.pdf',
        comentario: 'Entrega 1',
      },
      {
        estudiante: new mongoose.Types.ObjectId(),
        curso: new mongoose.Types.ObjectId(),
        archivo: 'http://example.com/file2.pdf',
        comentario: 'Entrega 2',
      },
    ]);

    const response = await request(app).get('/api/submissions');

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.count).toBe(2);
    expect(response.body.data).toHaveLength(2);
    expect(response.body.data[0]).toHaveProperty('archivo', 'http://example.com/file1.pdf');
  });

  // Prueba para obtener una entrega por ID (GET /api/submissions/:id)
  it('should get a submission by ID', async () => {
    const submission = await Submission.create({
      estudiante: new mongoose.Types.ObjectId(),
      curso: new mongoose.Types.ObjectId(),
      archivo: 'http://example.com/file3.pdf',
      comentario: 'Entrega específica',
    });

    const response = await request(app).get(`/api/submissions/${submission._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('archivo', 'http://example.com/file3.pdf');
    expect(response.body.data).toHaveProperty('comentario', 'Entrega específica');
  });

  // Prueba para calificar una entrega (PUT /api/submissions/:id/grade)
  it('should grade a submission by ID', async () => {
    const submission = await Submission.create({
      estudiante: new mongoose.Types.ObjectId(),
      curso: new mongoose.Types.ObjectId(),
      archivo: 'http://example.com/file4.pdf',
      comentario: 'Entrega para calificar',
    });

    const gradeData = {
      calificacion: 85,
      retroalimentacion: 'Buen trabajo, pero puede mejorar',
    };

    const response = await request(app)
      .put(`/api/submissions/${submission._id}/grade`)
      .send(gradeData);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.data).toHaveProperty('calificacion', 85);
    expect(response.body.data).toHaveProperty('retroalimentacion', 'Buen trabajo, pero puede mejorar');
  });

  // Prueba para eliminar una entrega (DELETE /api/submissions/:id)
  it('should delete a submission by ID', async () => {
    const submission = await Submission.create({
      estudiante: new mongoose.Types.ObjectId(),
      curso: new mongoose.Types.ObjectId(),
      archivo: 'http://example.com/file5.pdf',
      comentario: 'Entrega para eliminar',
    });

    const response = await request(app).delete(`/api/submissions/${submission._id}`);

    expect(response.status).toBe(200);
    expect(response.body.success).toBe(true);
    expect(response.body.message).toBe('Entrega eliminada correctamente');

    const deletedSubmission = await Submission.findById(submission._id);
    expect(deletedSubmission).toBeNull();
  });
});