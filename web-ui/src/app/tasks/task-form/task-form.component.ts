import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Task, SlugType, Links } from '../../core/declarations';
import { ManageLayoutComponent } from '../../manage-layout/manage-layout.component';
import { TasksService } from '../../core/services/tasks.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, switchMap, tap } from 'rxjs';
import { WorkspacesService } from '../../core/services/workspaces.service';
import { ToastService } from '../../core/services/toast.service';
import { uniqueValueValidator } from '../../core/validators/unique-value.validator';

@Component({
  selector: 'app-task-form',
  imports: [ReactiveFormsModule, ManageLayoutComponent, RouterLink],
  templateUrl: './task-form.component.html',
  styleUrl: './task-form.component.css',
})
export class TaskFormComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly tasksService = inject(TasksService);
  private readonly workspacesService = inject(WorkspacesService);
  private readonly route = inject(ActivatedRoute);
  workspaceSlug = input.required<SlugType>();
  private workspace = computed(() =>
    this.workspacesService.getResourceBySlug(this.workspaceSlug()),
  );
  task = this.tasksService.resource;
  private readonly tasks = this.tasksService.resources;

  submitted = signal<boolean>(false);
  isEdit = input.required<boolean>();

  form = new FormGroup({
    title: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, uniqueValueValidator(this.tasks(), (task) => task.title)],
    }),
    summary: new FormControl('', { nonNullable: true }),
    date: new FormControl('', { nonNullable: true }),
  });

  protected layoutHeader = computed(() =>
    this.isEdit() ? `Edit "${this.task()?.title}" task` : 'New task',
  );
  protected formSubmitButtonName = computed<string>(() => (this.isEdit() ? 'Apply' : 'Create'));

  constructor() {
    effect(() => {
      const task = this.task();
      if (this.isEdit() && task) {
        this.form.patchValue({
          title: task.title,
          summary: task.summary,
          date: task.dueDate,
        });
      }
    });
  }

  protected onSubmit() {
    if (this.form.invalid) return;
    const isEdit = this.isEdit();
    this.submitted.set(true);

    const links: Links = { _links: this.workspace()!._links };
    if (!links) return;

    const taskData: Partial<Task> = this.form.getRawValue();

    const request$ = isEdit
      ? this.tasksService.update(this.task()!, taskData)
      : this.tasksService.create(
          {
            ...taskData,
            orderBy: this.tasksService.getMaxOrderBy(),
          },
          links,
        );

    request$
      .pipe(
        tap(() => this.toastService.show(isEdit ? 'Task updated!' : 'Task created!')),
        catchError(() => {
          const errorMsg = isEdit ? 'Failed to update task' : 'Failed to create task';
          this.toastService.show(errorMsg);
          return EMPTY;
        }),
        switchMap(() => this.tasksService.getAll(links)),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe(() => {
        const navigatePath = isEdit ? ['../../'] : ['../'];
        this.router.navigate(navigatePath, { relativeTo: this.route }).then();
      });
  }
}
