import mongoose from 'mongoose';

const sectionSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Section name is required'],
  },
  semester: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Semester',
    required: [true, 'Semester is required'],
  },
}, {
  timestamps: true,
  indexes: [{ key: { name: 1, semester: 1 }, unique: true }],

});

const Section = mongoose.model('Section', sectionSchema);

export default Section;