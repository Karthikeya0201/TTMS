import mongoose from 'mongoose';

const BatchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  startYear: {
    type: Number,
    required: true,
    min: 2000,
  },
  endYear: {
    type: Number,
    required: true,
    min: 2000,
    validate: {
      validator: function (value) {
        return value >= this.startYear;
      },
      message: 'endYear must be greater than or equal to startYear',
    },
  },
}, { timestamps: true });

export default mongoose.models.Batch || mongoose.model('Batch', BatchSchema);