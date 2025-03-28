// src/models/user.model.ts
import mongoose, { Schema } from 'mongoose';
import bcrypt from 'bcrypt';
import { IUserDocument, UserRole } from '../interfaces/user.interface';

const UserSchema: Schema = new Schema({
  nombre: { 
    type: String, 
    required: [true, 'El nombre es requerido']
  },
  correo: { 
    type: String, 
    required: [true, 'El correo es requerido'], 
    unique: true,
    lowercase: true,
    match: [
      /^\w+([.-]?\w+)*@\w+([.-]?\w+)*(\.\w{2,3})+$/,
      'Por favor, proporciona un correo válido'
    ]
  },
  contraseña: { 
    type: String, 
    required: [true, 'La contraseña es requerida'],
    minlength: [6, 'La contraseña debe tener al menos 6 caracteres'],
    select: false
  },
  rol: { 
    type: String, 
    enum: Object.values(UserRole),
    default: UserRole.REGULAR 
  },
  estado: { 
    type: Boolean, 
    default: true 
  }
}, { 
  timestamps: true 
});

// Middleware para encriptar la contraseña antes de guardar
UserSchema.pre<IUserDocument>('save', async function(next) {
  if (!this.isModified('contraseña')) return next();
  
  try {
    const salt = await bcrypt.genSalt(10);
    this.contraseña = await bcrypt.hash(this.contraseña, salt);
    next();
  } catch (error: any) {
    next(error);
  }
});

// Método para comparar contraseñas
UserSchema.methods.comparePassword = async function(candidatePassword: string): Promise<boolean> {
  try {
    return await bcrypt.compare(candidatePassword, this.contraseña);
  } catch (error) {
    return false;
  }
};

export default mongoose.model<IUserDocument>('User', UserSchema);