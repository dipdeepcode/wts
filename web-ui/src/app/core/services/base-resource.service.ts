import { ResourceService } from '../interfaces/resource-service.interface';
import { inject } from '@angular/core';
import { HalService } from './hal.service';
import { Links, Resource, SlugType, UnpackedResourceCollection, Workspace, Task } from '../declarations';
import { Observable, of, tap } from 'rxjs';
import { ResourceStore } from './resource.store';

// Constraint type for resources that have orderBy
export type OrderableResource = Workspace | Task;

export abstract class BaseResourceService<T extends OrderableResource = OrderableResource> implements ResourceService<T> {
  protected readonly halService = inject(HalService);
  protected readonly store = new ResourceStore<T>();

  protected abstract readonly resourceName: string;
  protected abstract findPredicate(item: Resource<T>, slug: SlugType): boolean;

  readonly resources = this.store.resources;
  readonly resource = this.store.resource;

  create(data: Partial<T>, links?: Links): Observable<Resource<T>> {
    return this.halService
      .createResource<T>(this.resourceName, data, links)
  }

  getAll(links?: Links): Observable<UnpackedResourceCollection<T>> {
    return this.halService
      .getResourceCollection<T>(this.resourceName, links, 'list')
      .pipe(tap((col) => this.store.setResources(col.items || [])));
  }

  getOne(slug: SlugType | null): Observable<Resource<T> | null> {
    if (!slug) return of(null);
    const links = this.getLinks(slug);
    if (!links) return of(null);
    return this.halService
      .getResource<T>('self', links)
      .pipe(tap((res) => this.store.setResource(res)));
  }

  update(links: Links, updates: Partial<T>): Observable<Resource<T>> {
    return this.halService.patchResource<T>(links, updates);
  }

  delete(resource: Resource<T>): Observable<Resource<T>> {
    return this.halService.deleteResource(resource);
  }

  getLinks(slug: SlugType): Links | undefined {
    const resource = this.resources().find((item) => this.findPredicate(item, slug));
    return resource ? { _links: resource._links } : undefined;
  }

  getResourceBySlug(slug: SlugType): Resource<T> | undefined {
    return this.resources().find((item) => this.findPredicate(item, slug));
  }

  getMaxOrderBy(): number {
    return this.store.maxOrderBy();
  }
}
