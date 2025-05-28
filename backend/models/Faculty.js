import mongoose from 'mongoose';

const facultySchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
  },
  email: {
    type: String,
    required: true,
    trim: true,
    unique: true,
  },
  subjects: [
    {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Subject',
    },
  ],
  availability: [
    {
      day: {
        type: String,
        enum: ['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'],
      },
      timeSlots: [
        {
          type: mongoose.Schema.Types.ObjectId,
          ref: 'TimeSlot',
        },
      ],
    },
  ],
}, { timestamps: true });


const Faculty = mongoose.model('Faculty', facultySchema);

export default Faculty;