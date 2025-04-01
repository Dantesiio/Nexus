import mongoose, { Types } from 'mongoose';
import Course from '../src/models/course.model';
import User from '../src/models/user.model'; // Asegúrate de que este modelo esté definido
import CourseService from '../src/services/course.service';
import { ICourseInput, ICourseUpdate } from '../src/interfaces/course.interface';
import { AppError } from '../src/lib/appError';

describe('CourseService', () => {
  let docenteId: string;

  beforeAll(async () => {
    if (mongoose.connection.readyState === 0) {
      await mongoose.connect('mongodb://localhost:27017/test', {});
    }
  });

  afterAll(async () => {
    await mongoose.disconnect();
  });

  beforeEach(async () => {
    await Course.deleteMany({});
    await User.deleteMany({});
    // Creamos un usuario con todos los campos obligatorios según IUserDocument
    const user = await User.create({
      nombre: 'Profesor Test',
      correo: 'profesor@test.com',
      contraseña: 'password123',
    });
    docenteId = user.id.toString(); // Guardamos el ID como string para ICourseInput
  });

  it('should create a course successfully', async () => {
    const courseData: ICourseInput = {
      nombre: 'Matemáticas',
      descripcion: 'Curso de algebra',
      codigo: 'MAT101',
      docente: docenteId, // String, como requiere ICourseInput
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    };

    const course = await CourseService.createCourse(courseData);
    expect(course).toBeDefined();
    expect(course.nombre).toBe(courseData.nombre);
  });

  it('should get all courses', async () => {
    await Course.create({
      nombre: 'Física',
      descripcion: 'Curso de física',
      codigo: 'FIS102',
      docente: new Types.ObjectId(docenteId), // ObjectId para el modelo
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    });

    const courses = await CourseService.getAllCourses();
    expect(courses.length).toBe(1);
  });

  it('should get a course by ID', async () => {
    const newCourse = await Course.create({
      nombre: 'Química',
      descripcion: 'Curso de química',
      codigo: 'QUI103',
      docente: new Types.ObjectId(docenteId),
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    });

    const course = await CourseService.getCourseById(newCourse.id.toString());
    expect(course).toBeDefined();
    expect(course?.nombre).toBe('Química');
  });

  it('should throw an error when course is not found', async () => {
    await expect(
      CourseService.getCourseById(new Types.ObjectId().toString())
    ).rejects.toThrow(AppError);
  });

  it('should update a course successfully', async () => {
    const newCourse = await Course.create({
      nombre: 'Historia',
      descripcion: 'Curso de historia',
      codigo: 'HIS104',
      docente: new Types.ObjectId(docenteId),
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    });

    const updateData: ICourseUpdate = { nombre: 'Historia Universal' };
    const updatedCourse = await CourseService.updateCourse(
      newCourse.id.toString(),
      updateData
    );

    expect(updatedCourse?.nombre).toBe('Historia Universal');
  });

  it('should delete a course successfully', async () => {
    const newCourse = await Course.create({
      nombre: 'Biología',
      descripcion: 'Curso de biología',
      codigo: 'BIO105',
      docente: new Types.ObjectId(docenteId),
      fecha_inicio: new Date(),
      fecha_fin: new Date(),
    });

    await CourseService.deleteCourse(newCourse.id.toString());
    const deletedCourse = await Course.findById(newCourse.id);
    expect(deletedCourse).toBeNull();
  });
});