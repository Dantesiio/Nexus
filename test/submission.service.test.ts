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

describe('SubmissionService', () => {
  let estudianteId: string;
  let evaluacionId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/test', {});
    }
  });

  beforeEach(async () => {
    await Submission.deleteMany({});
    await User.deleteMany({});
    await Evaluation.deleteMany({});

    // Crear un estudiante válido
    const user = await User.create({
      nombre: 'Estudiante Test',
      correo: 'estudiante@test.com',
      contraseña: 'password123',
    });
    estudianteId = user.id.toString();

    // Crear una evaluación válida
    const evaluation = await Evaluation.create({
      titulo: 'Evaluación de Prueba',
      descripcion: 'Descripción de prueba',
    });
    evaluacionId = evaluation.id.toString();
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  it('should create a submission successfully', async () => {
    const submissionData: ISubmissionInput = {
      evaluacion: evaluacionId, // Usamos ObjectId como string
      estudiante: estudianteId,
      archivo: 'tarea.pdf',
      comentarios: 'Entrega inicial',
    };

    const submission = await SubmissionService.createSubmission(submissionData);
    expect(submission).toBeDefined();
    expect(submission.archivo).toBe(submissionData.archivo);
    expect(submission.comentarios).toBe(submissionData.comentarios);
    expect(submission.evaluacion.toString()).toBe(evaluacionId);
  });

  it('should not allow duplicate submissions for the same evaluation and student', async () => {
    const submissionData: ISubmissionInput = {
      evaluacion: evaluacionId,
      estudiante: estudianteId,
      archivo: 'tarea.pdf',
      comentarios: 'Primera entrega',
    };

    await SubmissionService.createSubmission(submissionData);
    await expect(SubmissionService.createSubmission(submissionData)).rejects.toThrow(
      new AppError('Ya existe una entrega para esta evaluación', 400)
    );
  });

  it('should get all submissions', async () => {
    await Submission.create({
      evaluacion: new Types.ObjectId(evaluacionId), // ObjectId para el modelo
      estudiante: new Types.ObjectId(estudianteId),
      archivo: 'tarea1.pdf',
      comentarios: 'Entrega 1',
      nota: null,
      fecha_entrega: new Date(),
    });

    const submissions = await SubmissionService.getAllSubmissions();
    expect(submissions.length).toBe(1);
    expect(submissions[0].estudiante).toHaveProperty('nombre'); // estudiante poblado
    expect(submissions[0].evaluacion).toHaveProperty('titulo'); // evaluacion poblada
  });

  it('should get a submission by ID', async () => {
    const newSubmission = await Submission.create({
      evaluacion: new Types.ObjectId(evaluacionId),
      estudiante: new Types.ObjectId(estudianteId),
      archivo: 'tarea2.pdf',
      comentarios: 'Entrega 2',
      nota: null,
      fecha_entrega: new Date(),
    });

    const submission = await SubmissionService.getSubmissionById(newSubmission.id.toString());
    expect(submission).toBeDefined();
    expect(submission?.archivo).toBe('tarea2.pdf');
    expect(submission?.comentarios).toBe('Entrega 2');
    expect(submission?.evaluacion).toHaveProperty('titulo'); // evaluacion poblada
    expect(submission?.estudiante).toHaveProperty('nombre'); // estudiante poblado
  });

  it('should throw an error when submission is not found', async () => {
    await expect(
      SubmissionService.getSubmissionById(new Types.ObjectId().toString())
    ).rejects.toThrow(new AppError('Entrega no encontrada', 404));
  });

  it('should grade a submission successfully', async () => {
    const newSubmission = await Submission.create({
      evaluacion: new Types.ObjectId(evaluacionId),
      estudiante: new Types.ObjectId(estudianteId),
      archivo: 'tarea3.pdf',
      comentarios: 'Entrega sin calificar',
      nota: null,
      fecha_entrega: new Date(),
    });

    const gradeData: ISubmissionGrade = { nota: 5, comentarios: 'Buen trabajo' };
    const gradedSubmission = await SubmissionService.gradeSubmission(
      newSubmission.id.toString(),
      gradeData
    );

    expect(gradedSubmission).toBeDefined();
    expect(gradedSubmission?.nota).toBe(5);
    expect(gradedSubmission?.comentarios).toBe('Buen trabajo');
  });

  it('should delete a submission successfully', async () => {
    const newSubmission = await Submission.create({
      evaluacion: new Types.ObjectId(evaluacionId),
      estudiante: new Types.ObjectId(estudianteId),
      archivo: 'tarea4.pdf',
      comentarios: 'Entrega para eliminar',
      nota: null,
      fecha_entrega: new Date(),
    });

    await SubmissionService.deleteSubmission(newSubmission.id.toString());
    const deletedSubmission = await Submission.findById(newSubmission.id);
    expect(deletedSubmission).toBeNull();
  });
});