// src/models/submission.model.ts
import mongoose, { Schema } from 'mongoose';
import { ISubmissionDocument } from '../interfaces/submission.interface';

const SubmissionSchema: Schema = new Schema({
  evaluacion: { 
    type: Schema.Types.ObjectId, 
    ref: 'Evaluation', 
    required: [true, 'La evaluación asociada es requerida']
  },
  estudiante: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'El estudiante es requerido']
  },
  archivo: { 
    type: String, 
    required: [true, 'El archivo o URL del archivo es requerido']
  },
  comentarios: { 
    type: String, 
    default: ''
  },
  nota: { 
    type: Number, 
    min: [0, 'La nota mínima es 0'],
    max: [5, 'La nota máxima es 5'],
    default: null
  },
  fecha_entrega: { 
    type: Date, 
    default: Date.now
  }
}, { 
  timestamps: true 
});

// Índice compuesto
SubmissionSchema.index({ evaluacion: 1, estudiante: 1 }, { unique: true });

export default mongoose.model<ISubmissionDocument>('Submission', SubmissionSchema);