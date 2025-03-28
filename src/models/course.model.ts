// src/models/Course.ts
import mongoose, { Schema } from 'mongoose';
import { ICourseDocument, CourseStatus } from '../interfaces/course.interface';

const CourseSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre del curso es requerido'],
    trim: true
  },
  descripcion: { 
    type: String, 
    required: [true, 'La descripción del curso es requerida']
  },
  codigo: { 
    type: String, 
    required: [true, 'El código del curso es requerido'],
    unique: true,
    trim: true
  },
  docente: { 
    type: Schema.Types.ObjectId, 
    ref: 'User', 
    required: [true, 'El docente es requerido']
  },
  estado: { 
    type: String, 
    enum: Object.values(CourseStatus),
    default: CourseStatus.ACTIVE 
  },
  fecha_inicio: { 
    type: Date, 
    required: [true, 'La fecha de inicio es requerida']
  },
  fecha_fin: { 
    type: Date, 
    required: [true, 'La fecha de fin es requerida']
  }
}, { 
  timestamps: true 
});

// Validación de fechas
CourseSchema.pre<ICourseDocument>('validate', function(next) {
  if (this.fecha_fin && this.fecha_inicio && this.fecha_fin < this.fecha_inicio) {
    this.invalidate('fecha_fin', 'La fecha de fin debe ser posterior a la fecha de inicio');
  }
  next();
});

export default mongoose.model<ICourseDocument>('Course', CourseSchema);