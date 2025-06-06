import mongoose from 'mongoose';

const branchSchema = new mongoose.Schema({
  name: {
    type: String,
    required: [true, 'Branch name is required'],
    trim: true,
  },
  branchCode: {
    type: String,
    required: [true, 'Branch code is required'],
    trim: true,
    unique: true,
  },
  batches: [{
    type: mongoose.Schema.Types.ObjectId,
    ref: 'Batch',
  }],
}, {
  timestamps: true,
});

const Branch = mongoose.model('Branch', branchSchema);

export default Branch;
