import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Customers } from './customers.model';

@Injectable({ providedIn: 'root' })
export class CustomersService {
  private readonly baseUrl = `${environment.apiUrl}/customers`;

  async list(): Promise<Customers[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Impossible de charger la liste.');
    return response.json();
  }

  async create(payload: Partial<Customers>): Promise<Customers> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Creation impossible.');
    return response.json();
  }

  async update(id: number, payload: Partial<Customers>): Promise<Customers> {
    const response = await fetch(`${this.baseUrl}/${id}`, {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Modification impossible.');
    return response.json();
  }

  async delete(id: number): Promise<void> {
    const response = await fetch(`${this.baseUrl}/${id}`, { method: 'DELETE' });
    if (!response.ok) throw new Error('Suppression impossible.');
  }
}
