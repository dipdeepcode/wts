import { Injectable } from '@angular/core';
import { Resource, Task, SlugType } from '../declarations';
import { BaseResourceService } from './base-resource.service';

@Injectable({
  providedIn: 'root',
})
export class TasksService extends BaseResourceService<Task> {
  protected readonly resourceName = 'tasks';

  findPredicate(item: Resource<Task>, slug: SlugType): boolean {
    return item.title === slug;
  }
}
