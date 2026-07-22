import { Component, computed, input, output } from '@angular/core';
import { RouterLink } from '@angular/router';
import { Resource, Task } from '../../core/declarations';
import { DatePipe } from '@angular/common';
import { ROUTES_CONSTANTS } from '../../routes-constants';

@Component({
  selector: 'app-task',
  imports: [DatePipe, RouterLink],
  templateUrl: './task.component.html',
  styleUrl: './task.component.css',
})
export class TaskComponent {
  task = input.required<Resource<Task>>();
  protected editLink = computed<string[] | string>(() => [
    this.task().title,
    ROUTES_CONSTANTS.editTask,
  ]);
  deleteClickEvent = output<Resource<Task>>();

  protected onComplete(): void {
    // TODO: Implement task completion logic
  }

  protected onDeleteClick(): void {
    this.deleteClickEvent.emit(this.task());
  }
}
