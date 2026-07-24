import { inject, Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { map, Observable, of, shareReplay, switchMap, tap, throwError } from 'rxjs';

import {
  Resource,
  ResourceCollection,
  UnpackedResourceCollection,
  Links,
} from '../declarations';
import { ConfigService } from './config.service';

@Injectable({
  providedIn: 'root',
})
export class HalService {
  private readonly http = inject(HttpClient);
  private readonly config = inject(ConfigService);

  private rootCache$: Observable<Resource<unknown>> | null = null;

  private getRoot<T>(): Observable<Resource<T>> {
    if (!this.rootCache$) {
      this.rootCache$ = this.http.get<Resource<T>>(this.config.baseUrl).pipe(
        tap(response => console.log(response)),
        shareReplay(1));
    }
    return this.rootCache$ as Observable<Resource<T>>;
  }

  getResource<T>(relation: string, links?: Links): Observable<Resource<T>> {
    const url = links?._links[relation]?.href;
    if (!url) {
      return throwError(() => new Error(`Link "${relation}" not found`));
    }
    return this.http.get<Resource<T>>(url);
  }

  getResourceCollection<T>(
    relation: string,
    links?: Links,
    projection?: string,
  ): Observable<UnpackedResourceCollection<T>> {
    const source$ = links ? of(links) : this.getRoot<unknown>();
    return source$.pipe(
      switchMap((res) => {
        const link = res._links[relation];

        if (!link) {
          return throwError(() => new Error(`Link "${relation}" not found`));
        }

        const url =
          link.templated && projection
            ? link.href.replace('{?projection}', `?projection=${projection}`)
            : link.href.replace(/\{.*}/, '');

        return this.http.get<ResourceCollection<T>>(url).pipe(
          map((response) => {
            const embedded = response._embedded;
            const items = embedded ? Object.values(embedded)[0] || [] : [];
            const { _embedded, ...rest } = response;
            return {
              items: items as Resource<T>[],
              ...rest,
            } as UnpackedResourceCollection<T>;
          }),
        );
      }),
    );
  }

  deleteResource<T>(resource: Resource<T>): Observable<Resource<T>> {
    const selfLink = resource._links['self'];
    if (!selfLink) {
      return throwError(() => new Error('Link "self" not found'));
    }
    return this.http.delete<Resource<T>>(selfLink.href);
  }

  createResource<C>(
    relation: string,
    childResource: Partial<C>,
    parentResource?: Resource<unknown>,
  ): Observable<Resource<C>> {
    return this.getRoot().pipe(
      switchMap((resource) => {
        const link = resource._links[relation];
        if (!link) {
          return throwError(() => new Error(`Link "${relation}" not found`));
        }
        const url = link.href.replace(/\{.*}/, '');
        const payload = {
          ...childResource,
          workspace: parentResource?._links['self']?.href,
        };
        return this.http.post<Resource<C>>(url, payload);
      }),
    );
  }

  patchResource<T>(links: Links, updates: Partial<T>): Observable<Resource<T>> {
    const link = links._links['self'];
    if (!link) {
      return throwError(() => new Error('Link "self" not found'));
    }
    const url = link.href.replace(/\{.*}/, '');
    return this.http.patch<Resource<T>>(url, updates);
  }

  clearRootCache(): void {
    this.rootCache$ = null;
  }
}
