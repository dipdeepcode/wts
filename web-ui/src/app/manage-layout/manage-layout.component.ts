import { Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ROUTES_CONSTANTS } from '../routes-constants';

@Component({
  selector: 'app-manage-layout',
  imports: [RouterLink],
  templateUrl: './manage-layout.component.html',
  styleUrl: './manage-layout.component.css',
})
export class ManageLayoutComponent {
  layoutHeader = input.required<string>();
  showMenu = input.required<boolean>();
  newTaskLink = ROUTES_CONSTANTS.newTask;
}
