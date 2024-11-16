import { HttpClient } from './http/HttpClient';

export abstract class Manager {
  constructor(protected readonly http: HttpClient) {}
}