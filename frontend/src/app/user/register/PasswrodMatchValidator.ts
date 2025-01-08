import { AbstractControl, ValidationErrors, FormGroup } from '@angular/forms';


export function passwordMatchValidator(group: FormGroup): ValidationErrors | null {
  const password = group.get('password');
  const confirmPassword = group.get('confirmPassword');

  // Check if both fields have the same value
  if (password?.value !== confirmPassword?.value) {
    return { passwordMismatch: true };  // Error if passwords don't match
  }

  return null;  // No error if they match
}
