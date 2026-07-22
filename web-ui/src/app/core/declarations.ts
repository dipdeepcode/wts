export interface Link {
  href: string;
  templated?: boolean;
}

export interface Links {
  _links: Record<string, Link | undefined>;
}

export type SlugType = string;

export interface Workspace {
  name: string;
  description: string;
  orderBy: number;
}

export interface Task {
  title: string;
  summary: string;
  dueDate: string;
  orderBy: number;
}

export type Resource<T> = T & Links;

export interface PageMetadata {
  size: number;
  totalElements: number;
  totalPages: number;
  number: number;
}

export interface ResourceCollection<T> {
  _embedded: Record<string, Resource<T>[]>;
  page?: PageMetadata;
}

export interface UnpackedResourceCollection<T> {
  items: Resource<T>[];
  page?: PageMetadata;
}

export interface AppConfig {
  baseUrl: string;
  meUrl: string;
  loginOptionsUrl: string;
  logoutUri: string;
}

export interface UserinfoDto {
  username: string;
  email: string;
  roles: string[];
  exp: number;
}

export interface LoginOptionDto {
  label: string;
  loginUri: string;
}
