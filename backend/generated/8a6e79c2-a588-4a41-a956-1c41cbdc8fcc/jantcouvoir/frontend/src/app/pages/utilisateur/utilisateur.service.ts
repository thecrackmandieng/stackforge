import { Injectable } from '@angular/core';
import { environment } from '../../../environments/environment';
import { Utilisateur } from './utilisateur.model';

@Injectable({ providedIn: 'root' })
export class UtilisateurService {
  private readonly baseUrl = `${environment.apiUrl}/utilisateur`;

  async list(): Promise<Utilisateur[]> {
    const response = await fetch(this.baseUrl);
    if (!response.ok) throw new Error('Impossible de charger la liste.');
    return response.json();
  }

  async create(payload: Partial<Utilisateur>): Promise<Utilisateur> {
    const response = await fetch(this.baseUrl, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    if (!response.ok) throw new Error('Creation impossible.');
    return response.json();
  }

  async update(id: number, payload: Partial<Utilisateur>): Promise<Utilisateur> {
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
