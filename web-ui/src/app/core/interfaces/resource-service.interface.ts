import { Signal } from '@angular/core';
import { Links, Resource, UnpackedResourceCollection } from '../declarations';
import { Observable } from 'rxjs';

export interface ResourceService<T> {
  resources: Signal<Resource<T>[]>;
  resource: Signal<Resource<T> | undefined>;

  create(data: Partial<T>, links?: Links): Observable<Resource<T>>;
  getAll(links?: Links): Observable<UnpackedResourceCollection<T>>;
  getOne(id: string | null): Observable<Resource<T> | null>;
  update(links: Links, updates: Partial<T>): Observable<Resource<T>>;
  delete(resource: Resource<T>): Observable<Resource<T>>;

  getLinks(id: string): Links | undefined;
  getResourceBySlug(slug: string): Resource<T> | undefined;
}
