import mongoose, { Types } from 'mongoose';
import Course from '../src/models/course.model';
import User from '../src/models/user.model';
import CourseService from '../src/services/course.service';
import { ICourseInput, ICourseUpdate } from '../src/interfaces/course.interface';
import { AppError } from '../src/lib/appError';

// Suite de pruebas para el servicio CourseService
describe('CourseService', () => {
  let docenteId: string; // Variable para almacenar el ID del docente creado en beforeEach

  // Configuración global: establece la conexión a la base de datos antes de todas las pruebas
  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/test', {}); // Conecta a una base de datos de prueba
    }
  });

  // Limpieza global: desconecta de la base de datos después de todas las pruebas
  afterAll(async () => {
    await mongoose.disconnect(); // Asegura que no queden conexiones abiertas
  });

  // Configuración previa a cada prueba: limpia las colecciones y crea un usuario docente
  beforeEach(async () => {
    await Course.deleteMany({}); // Elimina todos los cursos existentes
    await User.deleteMany({}); // Elimina todos los usuarios existentes
    // Creamos un usuario docente para asociarlo a los cursos
    const user = await User.create({
      nombre: 'Profesor Test',
      correo: 'profesor@test.com',
      contraseña: 'password123',
    });
    docenteId = user.id.toString(); // Almacena el ID como string para usar en ICourseInput
  });

  // Prueba la creación de un curso exitoso
  it('should create a course successfully', async () => {
    // Datos de entrada para un curso nuevo, cumpliendo con ICourseInput
    const courseData: ICourseInput = {
      nombre: 'Matemáticas',
      descripcion: 'Curso de algebra',
      codigo: 'MAT101',
      docente: docenteId, // Usa el ID del docente creado en beforeEach
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    };

    const course = await CourseService.createCourse(courseData);
    expect(course).toBeDefined(); // Verifica que el curso se haya creado
    expect(course.nombre).toBe(courseData.nombre); // Confirma que los datos coinciden
  });

  // Prueba la obtención de todos los cursos
  it('should get all courses', async () => {
    // Crea un curso directamente en la base de datos para simular datos existentes
    await Course.create({
      nombre: 'Física',
      descripcion: 'Curso de física',
      codigo: 'FIS102',
      docente: new Types.ObjectId(docenteId), // Usa ObjectId para el modelo de Mongoose
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    });

    const courses = await CourseService.getAllCourses();
    expect(courses.length).toBe(1); // Verifica que se devuelva exactamente un curso
  });

  // Prueba la obtención de un curso por ID
  it('should get a course by ID', async () => {
    // Crea un curso para luego buscarlo por su ID
    const newCourse = await Course.create({
      nombre: 'Química',
      descripcion: 'Curso de química',
      codigo: 'QUI103',
      docente: new Types.ObjectId(docenteId),
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    });

    const course = await CourseService.getCourseById(newCourse.id.toString());
    expect(course).toBeDefined(); // Verifica que se encuentre el curso
    expect(course?.nombre).toBe('Química'); // Confirma que el nombre coincide
  });

  // Prueba el manejo de errores cuando un curso no existe
  it('should throw an error when course is not found', async () => {
    // Intenta buscar un curso con un ID inexistente
    await expect(
      CourseService.getCourseById(new Types.ObjectId().toString())
    ).rejects.toThrow(AppError); // Espera que se lance un AppError (404 probablemente)
  });

  // Prueba la actualización de un curso existente
  it('should update a course successfully', async () => {
    // Crea un curso inicial para luego modificarlo
    const newCourse = await Course.create({
      nombre: 'Historia',
      descripcion: 'Curso de historia',
      codigo: 'HIS104',
      docente: new Types.ObjectId(docenteId),
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    });

    const updateData: ICourseUpdate = { nombre: 'Historia Universal' }; // Datos a actualizar
    const updatedCourse = await CourseService.updateCourse(
      newCourse.id.toString(),
      updateData
    );

    expect(updatedCourse?.nombre).toBe('Historia Universal'); // Verifica que el nombre se haya actualizado
  });

  // Prueba la eliminación de un curso
  it('should delete a course successfully', async () => {
    // Crea un curso para luego eliminarlo
    const newCourse = await Course.create({
      nombre: 'Biología',
      descripcion: 'Curso de biología',
      codigo: 'BIO105',
      docente: new Types.ObjectId(docenteId),
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    });

    await CourseService.deleteCourse(newCourse.id.toString()); // Elimina el curso
    const deletedCourse = await Course.findById(newCourse.id); // Busca el curso en la BD
    expect(deletedCourse).toBeNull(); // Verifica que el curso ya no exista
  });
});