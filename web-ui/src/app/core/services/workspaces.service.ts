import { Injectable } from '@angular/core';
import { Resource, Workspace, SlugType } from '../declarations';
import { BaseResourceService } from './base-resource.service';

@Injectable({
  providedIn: 'root',
})
export class WorkspacesService extends BaseResourceService<Workspace> {
  protected readonly resourceName = 'workspaces';

  findPredicate(item: Resource<Workspace>, slug: SlugType): boolean {
    return item.name === slug;
  }
}
