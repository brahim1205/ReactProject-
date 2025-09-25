import { useMemo } from 'react';
import { container } from '../container.js';


export const useValidation = () => {
  const validationService = useMemo(() => container.getValidationService(), []);

  const validateEmail = (email) => {
    return validationService.validateEmail(email);
  };

  const validatePassword = (password) => {
    return validationService.validatePassword(password);
  };

  const validateUserRegistration = (data) => {
    return validationService.validateUserRegistration(data);
  };

  const validateTodoCreation = (data) => {
    return validationService.validateTodoCreation(data);
  };

  const validateTodoUpdate = (data) => {
    return validationService.validateTodoUpdate(data);
  };

  return {
    validateEmail,
    validatePassword,
    validateUserRegistration,
    validateTodoCreation,
    validateTodoUpdate,
  };
};