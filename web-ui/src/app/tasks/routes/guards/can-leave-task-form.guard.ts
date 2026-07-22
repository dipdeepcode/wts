import { CanDeactivateFn } from '@angular/router';
import { TaskFormComponent } from '../../task-form/task-form.component';

export const canLeaveTaskForm: CanDeactivateFn<TaskFormComponent> = (component): boolean => {
  if (component.submitted()) return true;
  const isDirty = component.form.dirty;
  return !isDirty || window.confirm('Do you really want to leave? You will lose the entered data.');
};
