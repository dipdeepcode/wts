import { Component, computed, input, output } from '@angular/core';
import { Resource, Workspace } from '../../core/declarations';
import { WorkspaceItemLayoutComponent } from '../workspace-item-layout/workspace-item-layout.component';
import { ROUTES_CONSTANTS } from '../../routes-constants';

@Component({
  selector: 'app-workspace',
  imports: [WorkspaceItemLayoutComponent],
  templateUrl: './workspace.component.html',
  styleUrl: './workspace.component.css',
})
export class WorkspaceComponent {
  workspace = input.required<Resource<Workspace>>();
  protected mainLink = computed<string[] | string>(() => [
    this.workspace().name,
    ROUTES_CONSTANTS.tasks,
  ]);
  protected editLink = computed<string[] | string>(() => [
    this.workspace().name,
    ROUTES_CONSTANTS.editWorkspace,
  ]);
  deleteClickEvent = output<Resource<Workspace>>();

  protected onDeleteClick() {
    this.deleteClickEvent.emit(this.workspace());
  }
}
