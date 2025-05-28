import mongoose from 'mongoose';

const SemesterSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    match: /^[1-4]-[1-2]$/, // e.g., 1-1, 4-2
  },
  batch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
    required: true,
  },
  branch: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Branch',
    required: true,
  },
}, {
  timestamps: true,
  indexes: [{ key: { name: 1, batch: 1, branch: 1 }, unique: true }],
});
const Semester = mongoose.models.Semester || mongoose.model('Semester', SemesterSchema);

export default Semester;