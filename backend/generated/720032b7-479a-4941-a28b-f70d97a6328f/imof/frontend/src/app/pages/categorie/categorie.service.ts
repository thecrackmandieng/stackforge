import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Categorie } from './categorie.model';

@Injectable({ providedIn: 'root' })
export class CategorieService {
  private readonly baseUrl = `${environment.apiUrl}/categorie`;

  async list(): Promise<Categorie[]> {
    const response = await fetch(this.baseUrl);
    return this.handle<Categorie[]>(response);
  }

  async create(payload: Partial<Categorie>): Promise<Categorie> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return this.handle<Categorie>(response);
  }

  async update(id: string | number, payload: Partial<Categorie>): Promise<Categorie> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    return this.handle<Categorie>(response);
  }

  async remove(id: string | number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    await this.handle<void>(response);
  }

  private async handle<T>(response: Response): Promise<T> {
    if (!response.ok) {
      throw new Error(await response.text());
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json() as Promise<T>;
  }
}
