import mongoose from 'mongoose';
import Course from '../src/models/course.model';

// Suite de pruebas para el modelo Course de Mongoose
describe('Course Model', () => {
  // Prueba la creación exitosa de un curso con datos válidos
  it('should create a course successfully', async () => {
   
    const courseData = {
      nombre: 'Matemáticas Avanzadas', 
      descripcion: 'Curso intensivo de matemáticas', 
      codigo: 'MAT101', 
      docente: new mongoose.Types.ObjectId(), 
      fecha_inicio: new Date('2025-01-01'), 
      fecha_fin: new Date('2025-06-01'),
    };

    const course = new Course(courseData); // Crea una instancia del modelo
    const savedCourse = await course.save(); // Persiste el curso en la base de datos

    // Verificaciones clave
    expect(savedCourse._id).toBeDefined(); // Confirma que se generó un ID único
    expect(savedCourse.nombre).toBe(courseData.nombre); // Verifica que el nombre se guardó correctamente
    expect(savedCourse.codigo).toBe(courseData.codigo); // Asegura que el código coincide
  });

  // Prueba el fallo al crear un curso sin un campo requerido (nombre)
  it('should fail to create a course without a name', async () => {
    try {
      // Datos incompletos: falta el campo 'nombre', que es obligatorio
      const courseData = {
        descripcion: 'Curso sin nombre',
        codigo: 'NONAME101',
        docente: new mongoose.Types.ObjectId(),
        fecha_inicio: new Date('2025-01-01'),
        fecha_fin: new Date('2025-06-01'),
      };

      const course = new Course(courseData);
      await course.save(); // Intenta guardar, debería lanzar un error de validación
    } catch (error) {
      // Maneja el error esperado de Mongoose
      if (error instanceof mongoose.Error.ValidationError) {
        expect(error.errors.nombre).toBeDefined(); // Verifica que el error esté relacionado con 'nombre'
      } else {
        throw error; // Si no es un ValidationError, falla la prueba
      }
    }
  });

  // Prueba la validación de fechas: fecha_fin debe ser posterior a fecha_inicio
  it('should fail to create a course with an end date earlier than the start date', async () => {
    try {
      // Datos con fechas inválidas: fecha_fin anterior a fecha_inicio
      const courseData = {
        nombre: 'Curso con fechas incorrectas',
        descripcion: 'Prueba de validación de fechas',
        codigo: 'DATE101',
        docente: new mongoose.Types.ObjectId(),
        fecha_inicio: new Date('2025-06-01'), // Fecha de inicio tardía
        fecha_fin: new Date('2025-01-01'), // Fecha de fin temprana (inválida)
      };

      const course = new Course(courseData);
      await course.save(); // Intenta guardar, debería fallar por validación de fechas
    } catch (error) {
      // Verifica que el error sea de validación y esté relacionado con 'fecha_fin'
      if (error instanceof mongoose.Error.ValidationError) {
        expect(error.errors.fecha_fin).toBeDefined(); // Confirma que el error es por 'fecha_fin'
        expect(error.errors.fecha_fin.message).toBe(
          'La fecha de fin debe ser posterior a la fecha de inicio'
        ); // Verifica el mensaje específico de la validación
      } else {
        throw error; // Si no es un ValidationError, falla la prueba
      }
    }
  });
});