import * as Yup from 'yup';

export const createSigningFlowValidation = Yup.object().shape({
  department: Yup.string()
    .required('Department  is required')
    .max(50, 'Department must be at most 50 characters long'),

  section: Yup.string()
    .required('Section is required')
    .max(50, 'Section must be at most 50 characters long'),

  numberOfLevel: Yup.number()
    .required('Number of Levels is required')
    .integer('Number of Levels must be a whole number')
    .positive('Number of Levels must be a positive number')
    .typeError('Number of Levels must be a number'),

  approvers: Yup.array()
    .of(
      Yup.number()
        .required('Approver ID is required')
        .integer('Approver ID must be a whole number')
        .positive('Approver ID must be a positive number')
        .typeError('Approver ID must be a number')
    )
    .min(
      Yup.ref('numberOfLevel'),
      'You must select at least the number of approvers equal to the number of levels'
    )
    .required('Approvers are required'),
});

export const editingSigningFlowValidation = Yup.object().shape({
  level: Yup.number()
    .required('Level is required')
    .integer('Level must be a whole number')
    .positive('Level must be a positive number')
    .typeError('Level must be a number'),
});
