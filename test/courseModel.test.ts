import mongoose from 'mongoose';
import Course from '../src/models/course.model';

describe('Course Model', () => {
    it('should create a course successfully', async () => {
        const courseData = {
            nombre: 'Matemáticas Avanzadas',
            descripcion: 'Curso intensivo de matemáticas',
            codigo: 'MAT101',
            docente: new mongoose.Types.ObjectId(),
            fecha_inicio: new Date('2025-01-01'),
            fecha_fin: new Date('2025-06-01'),
        };

        const course = new Course(courseData);
        const savedCourse = await course.save();

        expect(savedCourse._id).toBeDefined();
        expect(savedCourse.nombre).toBe(courseData.nombre);
        expect(savedCourse.codigo).toBe(courseData.codigo);
    });

    it('should fail to create a course without a name', async () => {
        try {
            const courseData = {
                descripcion: 'Curso sin nombre',
                codigo: 'NONAME101',
                docente: new mongoose.Types.ObjectId(),
                fecha_inicio: new Date('2025-01-01'),
                fecha_fin: new Date('2025-06-01'),
            };

            const course = new Course(courseData);
            await course.save();
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                expect(error.errors.nombre).toBeDefined();
            } else {
                throw error;
            }
        }
    });

    it('should fail to create a course with an end date earlier than the start date', async () => {
        try {
            const courseData = {
                nombre: 'Curso con fechas incorrectas',
                descripcion: 'Prueba de validación de fechas',
                codigo: 'DATE101',
                docente: new mongoose.Types.ObjectId(),
                fecha_inicio: new Date('2025-06-01'),
                fecha_fin: new Date('2025-01-01'),
            };

            const course = new Course(courseData);
            await course.save();
        } catch (error) {
            if (error instanceof mongoose.Error.ValidationError) {
                expect(error.errors.fecha_fin).toBeDefined();
                expect(error.errors.fecha_fin.message).toBe('La fecha de fin debe ser posterior a la fecha de inicio');
            } else {
                throw error;
            }
        }
    });
});
