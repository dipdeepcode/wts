import { Component } from '@angular/core';
import { WorkspaceItemLayoutComponent } from '../workspace-item-layout/workspace-item-layout.component';
import { ROUTES_CONSTANTS } from '../../routes-constants';

@Component({
  selector: 'app-workspace-create',
  imports: [WorkspaceItemLayoutComponent],
  templateUrl: './workspace-item-create.component.html',
  styleUrl: './workspace-item-create.component.css',
})
export class WorkspaceItemCreateComponent {
  protected mainLink = ROUTES_CONSTANTS.newWorkspace;
  protected editLink = '';
}
