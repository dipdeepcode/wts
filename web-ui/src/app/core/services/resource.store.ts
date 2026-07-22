import { computed, signal } from '@angular/core';
import { Resource } from '../declarations';

interface WithOrderBy {
  orderBy?: number;
}

export class ResourceStore<T extends WithOrderBy = WithOrderBy> {
  private readonly _resources = signal<Resource<T>[]>([]);
  readonly resources = this._resources.asReadonly();

  private readonly _resource = signal<Resource<T> | undefined>(undefined);
  readonly resource = this._resource.asReadonly();

  setResources(items: Resource<T>[]): void {
    this._resources.set(items);
  }

  setResource(item: Resource<T> | undefined): void {
    this._resource.set(item);
  }

  readonly maxOrderBy = computed(() => {
    const items = this.resources();
    return items.length > 0 ? Math.max(...items.map((item) => item.orderBy ?? 0)) + 1 : 0;
  });
}
