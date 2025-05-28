import mongoose from 'mongoose';

const classroomSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Classroom name is required'],
    trim: true,
  },
  capacity: {
    type: Number,
    required: [true, 'Capacity is required'],
    min: 1,
  },
  type: {
    type: String,
    enum: ['lecture', 'lab', 'seminar'],
    default: 'lecture',
  },
  location: {
    type: String,
    trim: true,
  },
}, {
  timestamps: true,
});

const Classroom = mongoose.model('Classroom', classroomSchema);

export default Classroom;