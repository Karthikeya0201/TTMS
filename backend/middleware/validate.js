import { check, validationResult } from 'express-validator';
import asyncHandler from 'express-async-handler';

export const validate = (method) => {
  switch (method) {
    case 'createBatch':
      return [
        check('name').notEmpty().withMessage('Batch name is required'),
        check('startYear').isInt().withMessage('Start year must be a number'),
        check('endYear').isInt().withMessage('End year must be a number'),
      ];
    case 'createBranch':
      return [
        check('name').notEmpty().withMessage('Branch name is required'),
        check('branchCode').notEmpty().withMessage('Branch code is required'),
      ];
    case 'createSemester':
      return [
        check('name').notEmpty().withMessage('Semester name is required'),
        check('branch').isMongoId().withMessage('Valid branch ID is required'),
        check('batch').isMongoId().withMessage('Valid batch ID is required'),
      ];
    case 'createSubject':
      return [
        check('name').notEmpty().withMessage('Subject name is required'),
        check('code').notEmpty().withMessage('Subject code is required'),
        check('semester').isMongoId().withMessage('Valid semester ID is required'),
      ];
    case 'createFaculty':
      return [
        check('name').notEmpty().withMessage('Faculty name is required'),
        check('email').isEmail().withMessage('Valid email is required'),
      ];
    case 'createClassroom':
      return [
        check('name').notEmpty().withMessage('Classroom name is required'),
        check('capacity').isInt({ min: 1 }).withMessage('Capacity must be a positive number'),
      ];
    case 'checkConflicts':
      return [
        check('timeSlot').isMongoId().withMessage('Valid time slot ID is required'),
        check('faculty').isMongoId().withMessage('Valid faculty ID is required'),
        check('classroom').isMongoId().withMessage('Valid classroom ID is required'),
      ];
    case 'createTimetable':
      return [
        check('entries').isArray().withMessage('Entries must be an array'),
        check('entries.*.section').isMongoId().withMessage('Valid section ID is required'),
        check('entries.*.subject').isMongoId().withMessage('Valid subject ID is required'),
        check('entries.*.faculty').isMongoId().withMessage('Valid faculty ID is required'),
        check('entries.*.classroom').isMongoId().withMessage('Valid classroom ID is required'),
        check('entries.*.timeSlot').isMongoId().withMessage('Valid time slot ID is required'),
      ];
    case 'createTimeSlot':
      return [
        check('day')
          .isIn(['Monday', 'Tuesday', 'Wednesday', 'Thursday', 'Friday', 'Saturday'])
          .withMessage('Invalid day'),
        check('period').isInt({ min: 1, max: 10 }).withMessage('Period must be between 1 and 10'),
        check('startTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid start time format'),
        check('endTime').matches(/^([01]\d|2[0-3]):([0-5]\d)$/).withMessage('Invalid end time format'),
      ];
    case 'login':
      return [
        check('email').isEmail().withMessage('Valid email is required'),
        check('password').notEmpty().withMessage('Password is required'),
        check('role')
          .isIn(['admin', 'faculty'])
          .withMessage('Role must be either admin or faculty'),
      ];
      case 'checkConflicts':
      return [
        check('timeSlot').isMongoId().withMessage('Valid time slot ID is required'),
        check('faculty').isMongoId().withMessage('Valid faculty ID is required'),
        check('room').isMongoId().withMessage('Valid room ID is required'),
      ];
    case 'createTimetable':
      return [
        check('entries').isArray().withMessage('Entries must be an array'),
        check('entries.*.section').isMongoId().withMessage('Valid section ID is required'),
        check('entries.*.subject').isMongoId().withMessage('Valid subject ID is required'),
        check('entries.*.faculty').isMongoId().withMessage('Valid faculty ID is required'),
        check('entries.*.room').isMongoId().withMessage('Valid room ID is required'),
        check('entries.*.timeSlot').isMongoId().withMessage('Valid time slot ID is required'),
      ];
    default:
      return [];
  }
};

export const validateResult = asyncHandler(async (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
    res.status(400);
    throw new Error(errors.array()[0].msg);
  }
  next();
});
