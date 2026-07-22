import { AbstractControl, ValidationErrors, ValidatorFn } from '@angular/forms';

export function uniqueValueValidator<T>(items: T[], getValue: (item: T) => string): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    if (!control.value) return null;
    const exists = items.some(
      (item) => getValue(item).toLowerCase() === control.value.toLowerCase(),
    );
    return exists ? { unique: true } : null;
  };
}
