import mongoose from 'mongoose';
import Submission from '../src/models/submission.model';

describe('Submission Model', () => {
    beforeAll(async () => {
        if (mongoose.connection.readyState === 0) {
            await mongoose.connect('mongodb://localhost:27017/test', {});
        }
    });

    afterAll(async () => {
        await mongoose.disconnect();
    });

    it('should create a submission successfully', async () => {
        const submissionData = {
            evaluacion: new mongoose.Types.ObjectId(),
            estudiante: new mongoose.Types.ObjectId(),
            archivo: 'http://example.com/file.pdf',
            comentarios: 'Buen trabajo',
            nota: 4.5,
            fecha_entrega: new Date(),
        };

        const submission = new Submission(submissionData);
        const savedSubmission = await submission.save();

        expect(savedSubmission._id).toBeDefined();
        expect(savedSubmission.archivo).toBe(submissionData.archivo);
        expect(savedSubmission.comentarios).toBe(submissionData.comentarios);
        expect(savedSubmission.nota).toBe(submissionData.nota);
    });

    it('should not create a submission without required fields', async () => {
        await expect(new Submission({}).save()).rejects.toThrow(mongoose.Error.ValidationError);
    });

    it('should not allow a grade above the maximum limit', async () => {
        const submission = new Submission({
            evaluacion: new mongoose.Types.ObjectId(),
            estudiante: new mongoose.Types.ObjectId(),
            archivo: 'http://example.com/file.pdf',
            nota: 6,
        });

        await expect(submission.save()).rejects.toThrow('La nota máxima es 5');
    });

    it('should not allow a grade below the minimum limit', async () => {
        const submission = new Submission({
            evaluacion: new mongoose.Types.ObjectId(),
            estudiante: new mongoose.Types.ObjectId(),
            archivo: 'http://example.com/file.pdf',
            nota: -1,
        });

        await expect(submission.save()).rejects.toThrow('La nota mínima es 0');
    });
});
