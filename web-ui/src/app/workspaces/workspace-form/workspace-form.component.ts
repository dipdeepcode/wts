import { Component, computed, DestroyRef, effect, inject, input, signal } from '@angular/core';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { FormControl, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ManageLayoutComponent } from '../../manage-layout/manage-layout.component';
import { WorkspacesService } from '../../core/services/workspaces.service';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { catchError, EMPTY, map, switchMap, tap } from 'rxjs';
import { ToastService } from '../../core/services/toast.service';
import { uniqueValueValidator } from '../../core/validators/unique-value.validator';

@Component({
  selector: 'app-workspace-form',
  imports: [ReactiveFormsModule, ManageLayoutComponent, RouterLink],
  templateUrl: './workspace-form.component.html',
  styleUrl: './workspace-form.component.css',
})
export class WorkspaceFormComponent {
  private readonly destroyRef = inject(DestroyRef);
  private readonly toastService = inject(ToastService);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly workspacesService = inject(WorkspacesService);

  private readonly workspaces = this.workspacesService.resources;
  workspace = this.workspacesService.resource;
  isEdit = input.required<boolean>();

  submitted = signal<boolean>(false);

  form = new FormGroup({
    name: new FormControl('', {
      nonNullable: true,
      validators: [Validators.required, uniqueValueValidator(this.workspaces(), (ws) => ws.name)],
    }),
    description: new FormControl('', { nonNullable: true }),
  });

  protected layoutHeader = computed(() =>
    this.isEdit() ? `Edit "${this.workspace()?.name}" workspace` : 'New workspace',
  );
  protected formSubmitButtonName = computed<string>(() => (this.isEdit() ? 'Apply' : 'Create'));

  constructor() {
    effect(() => {
      const ws = this.workspace();
      if (this.isEdit() && ws) {
        this.form.patchValue({
          name: ws.name,
          description: ws.description,
        });
      }
    });
  }

  protected onSubmit() {
    if (this.form.invalid) return;
    const isEdit = this.isEdit();
    this.submitted.set(true);

    const workspaceData = this.form.getRawValue();

    const request$ = isEdit
      ? this.workspacesService.update(this.workspace()!, workspaceData)
      : this.workspacesService.create({
          ...workspaceData,
          orderBy: this.workspacesService.getMaxOrderBy(),
        });

    request$
      .pipe(
        tap(() => this.toastService.show(isEdit ? 'Workspace updated!' : 'Workspace created!')),
        catchError(() => {
          const errorMsg = isEdit ? 'Failed to update workspace' : 'Failed to create workspace';
          this.toastService.show(errorMsg);
          return EMPTY;
        }),
        switchMap((res) => this.workspacesService.getAll().pipe(map(() => res))),
        takeUntilDestroyed(this.destroyRef),
      )
      .subscribe((res) => {
        const navigatePath = isEdit ? ['../../', res.name] : ['../', res.name];
        this.router.navigate(navigatePath, { relativeTo: this.route }).then();
      });
  }
}
