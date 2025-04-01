import mongoose from 'mongoose';
import Submission from '../src/models/submission.model';

// Suite de pruebas para el modelo Submission de Mongoose
describe('Submission Model', () => {
  // Configuración global: conecta a la base de datos antes de todas las pruebas
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/test', {}); // Usa una base de datos de prueba
    }
  });

  // Limpieza global: desconecta de la base de datos después de todas las pruebas
  afterAll(async () => {
    await mongoose.disconnect(); // Cierra la conexión para evitar fugas
  });

  // Prueba la creación exitosa de una entrega con datos válidos
  it('should create a submission successfully', async () => {
    // Datos válidos para una entrega, cumpliendo con el esquema esperado
    const submissionData = {
      evaluacion: new mongoose.Types.ObjectId(), // ID de evaluación como ObjectId
      estudiante: new mongoose.Types.ObjectId(), // ID de estudiante como ObjectId
      archivo: 'http://example.com/file.pdf', // URL del archivo entregado
      comentarios: 'Buen trabajo', // Comentario opcional
      nota: 4.5, // Nota válida dentro del rango esperado
      fecha_entrega: new Date(), // Fecha de entrega actual
    };

    const submission = new Submission(submissionData); // Crea una instancia del modelo
    const savedSubmission = await submission.save(); // Persiste la entrega en la base de datos

    // Verificaciones clave
    expect(savedSubmission._id).toBeDefined(); // Confirma que se generó un ID único
    expect(savedSubmission.archivo).toBe(submissionData.archivo); // Verifica que el archivo coincide
    expect(savedSubmission.comentarios).toBe(submissionData.comentarios); // Confirma los comentarios
    expect(savedSubmission.nota).toBe(submissionData.nota); // Asegura que la nota se guardó correctamente
  });

  // Prueba el fallo al crear una entrega sin campos requeridos
  it('should not create a submission without required fields', async () => {
    // Intenta crear una entrega sin ningún dato, lo que debería fallar por campos obligatorios
    await expect(new Submission({}).save()).rejects.toThrow(mongoose.Error.ValidationError); // Espera un error de validación de Mongoose
  });

  // Prueba la validación de nota máxima (suponiendo un límite de 5)
  it('should not allow a grade above the maximum limit', async () => {
    // Datos con una nota superior al máximo permitido
    const submission = new Submission({
      evaluacion: new mongoose.Types.ObjectId(),
      estudiante: new mongoose.Types.ObjectId(),
      archivo: 'http://example.com/file.pdf',
      nota: 6, // Nota inválida (> 5)
    });

    // Verifica que se lance un error con el mensaje específico de validación
    await expect(submission.save()).rejects.toThrow('La nota máxima es 5');
  });

  // Prueba la validación de nota mínima (suponiendo un límite de 0)
  it('should not allow a grade below the minimum limit', async () => {
    // Datos con una nota inferior al mínimo permitido
    const submission = new Submission({
      evaluacion: new mongoose.Types.ObjectId(),
      estudiante: new mongoose.Types.ObjectId(),
      archivo: 'http://example.com/file.pdf',
      nota: -1, // Nota inválida (< 0)
    });

    // Verifica que se lance un error con el mensaje específico de validación
    await expect(submission.save()).rejects.toThrow('La nota mínima es 0');
  });
});