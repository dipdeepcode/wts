import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { WorkspacesComponent } from '../workspaces/workspaces/workspaces.component';


@Component({
  selector: 'app-main',
  imports: [RouterOutlet, WorkspacesComponent],
  templateUrl: './main.component.html',
  styleUrl: './main.component.css',
})
export class MainComponent {}
