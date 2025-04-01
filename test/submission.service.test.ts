import mongoose, { Types, Schema, model } from 'mongoose';
import Submission from '../src/models/submission.model';
import User from '../src/models/user.model';
import SubmissionService from '../src/services/submission.service';
import { ISubmissionInput, ISubmissionGrade } from '../src/interfaces/submission.interface';
import { AppError } from '../src/lib/appError';

// Modelo simulado de Evaluation para las pruebas
const evaluationSchema = new Schema({
  titulo: { type: String, required: true },
  descripcion: { type: String },
});
const Evaluation = model('Evaluation', evaluationSchema);

// Suite de pruebas para el servicio SubmissionService
describe('SubmissionService', () => {
  let estudianteId: string; // ID del estudiante para usar en las pruebas
  let evaluacionId: string; // ID de la evaluación para asociar a las entregas

  // Configuración global: conecta a la base de datos antes de todas las pruebas
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/test', {}); // Usa una base de datos de prueba
    }
  });

  // Preparación antes de cada prueba: limpia colecciones y crea datos iniciales
  beforeEach(async () => {
    await Submission.deleteMany({}); // Elim Boxina todas las entregas existentes
    await User.deleteMany({}); // Elimina todos los usuarios existentes
    await Evaluation.deleteMany({}); // Elimina todas las evaluaciones existentes

    // Crea un estudiante válido para asociarlo a las entregas
    const user = await User.create({
      nombre: 'Estudiante Test',
      correo: 'estudiante@test.com',
      contraseña: 'password123',
    });
    estudianteId = user.id.toString(); // Almacena el ID como string para ISubmissionInput

    // Crea una evaluación válida para asociarla a las entregas
    const evaluation = await Evaluation.create({
      titulo: 'Evaluación de Prueba',
      descripcion: 'Descripción de prueba',
    });
    evaluacionId = evaluation.id.toString(); // Almacena el ID como string
  });

  // Limpieza global: desconecta de la base de datos después de todas las pruebas
  afterAll(async () => {
    await mongoose.disconnect(); // Cierra la conexión para evitar fugas
  });

  // Prueba la creación exitosa de una entrega
  it('should create a submission successfully', async () => {
    const submissionData: ISubmissionInput = {
      evaluacion: evaluacionId, // ID de la evaluación como string
      estudiante: estudianteId, // ID del estudiante como string
      archivo: 'tarea.pdf', // Nombre del archivo entregado
      comentarios: 'Entrega inicial', // Comentario opcional
    };

    const submission = await SubmissionService.createSubmission(submissionData); // Crea la entrega
    expect(submission).toBeDefined(); // Verifica que se haya creado
    expect(submission.archivo).toBe(submissionData.archivo); // Confirma que el archivo coincide
    expect(submission.comentarios).toBe(submissionData.comentarios); // Verifica los comentarios
    expect(submission.evaluacion.toString()).toBe(evaluacionId); // Asegura que la evaluación está asociada
  });

  // Prueba la restricción de entregas duplicadas para la misma evaluación y estudiante
  it('should not allow duplicate submissions for the same evaluation and student', async () => {
    const submissionData: ISubmissionInput = {
      evaluacion: evaluacionId,
      estudiante: estudianteId,
      archivo: 'tarea.pdf',
      comentarios: 'Primera entrega',
    };

    await SubmissionService.createSubmission(submissionData); // Crea la primera entrega
    // Intenta crear una segunda entrega con los mismos estudiante y evaluación
    await expect(SubmissionService.createSubmission(submissionData)).rejects.toThrow(
      new AppError('Ya existe una entrega para esta evaluación', 400) // Espera un error específico
    );
  });

  // Prueba la obtención de todas las entregas
  it('should get all submissions', async () => {
    // Crea una entrega directamente en la base de datos
    await Submission.create({
      evaluacion: new Types.ObjectId(evaluacionId), // ObjectId para el modelo
      estudiante: new Types.ObjectId(estudianteId),
      archivo: 'tarea1.pdf',
      comentarios: 'Entrega 1',
      nota: null,
      fecha_entrega: new Date(),
    });

    const submissions = await SubmissionService.getAllSubmissions(); // Obtiene todas las entregas
    expect(submissions.length).toBe(1); // Verifica que haya exactamente una entrega
    expect(submissions[0].estudiante).toHaveProperty('nombre'); // Confirma que el estudiante está poblado
    expect(submissions[0].evaluacion).toHaveProperty('titulo'); // Asegura que la evaluación está poblada
  });

  // Prueba la obtención de una entrega por ID
  it('should get a submission by ID', async () => {
    // Crea una entrega para luego buscarla
    const newSubmission = await Submission.create({
      evaluacion: new Types.ObjectId(evaluacionId),
      estudiante: new Types.ObjectId(estudianteId),
      archivo: 'tarea2.pdf',
      comentarios: 'Entrega 2',
      nota: null,
      fecha_entrega: new Date(),
    });

    const submission = await SubmissionService.getSubmissionById(newSubmission.id.toString()); // Busca por ID
    expect(submission).toBeDefined(); // Verifica que se encontró la entrega
    expect(submission?.archivo).toBe('tarea2.pdf'); // Confirma el archivo
    expect(submission?.comentarios).toBe('Entrega 2'); // Verifica los comentarios
    expect(submission?.evaluacion).toHaveProperty('titulo'); // Asegura que la evaluación está poblada
    expect(submission?.estudiante).toHaveProperty('nombre'); // Confirma que el estudiante está poblado
  });

  // Prueba el manejo de errores cuando una entrega no existe
  it('should throw an error when submission is not found', async () => {
    // Intenta buscar una entrega con un ID inexistente
    await expect(
      SubmissionService.getSubmissionById(new Types.ObjectId().toString())
    ).rejects.toThrow(new AppError('Entrega no encontrada', 404)); // Espera un error 404 específico
  });

  // Prueba la calificación de una entrega
  it('should grade a submission successfully', async () => {
    // Crea una entrega sin calificar
    const newSubmission = await Submission.create({
      evaluacion: new Types.ObjectId(evaluacionId),
      estudiante: new Types.ObjectId(estudianteId),
      archivo: 'tarea3.pdf',
      comentarios: 'Entrega sin calificar',
      nota: null,
      fecha_entrega: new Date(),
    });

    const gradeData: ISubmissionGrade = { nota: 5, comentarios: 'Buen trabajo' }; // Datos de calificación
    const gradedSubmission = await SubmissionService.gradeSubmission(
      newSubmission.id.toString(),
      gradeData
    ); // Califica la entrega

    expect(gradedSubmission).toBeDefined(); // Verifica que se actualizó la entrega
    expect(gradedSubmission?.nota).toBe(5); // Confirma la nota asignada
    expect(gradedSubmission?.comentarios).toBe('Buen trabajo'); // Verifica los comentarios actualizados
  });

  // Prueba la eliminación de una entrega
  it('should delete a submission successfully', async () => {
    // Crea una entrega para luego eliminarla
    const newSubmission = await Submission.create({
      evaluacion: new Types.ObjectId(evaluacionId),
      estudiante: new Types.ObjectId(estudianteId),
      archivo: 'tarea4.pdf',
      comentarios: 'Entrega para eliminar',
      nota: null,
      fecha_entrega: new Date(),
    });

    await SubmissionService.deleteSubmission(newSubmission.id.toString()); // Elimina la entrega
    const deletedSubmission = await Submission.findById(newSubmission.id); // Busca en la base de datos
    expect(deletedSubmission).toBeNull(); // Confirma que la entrega ya no existe
  });
});