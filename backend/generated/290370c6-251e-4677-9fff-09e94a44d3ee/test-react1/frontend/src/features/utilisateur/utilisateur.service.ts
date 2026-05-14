import { apiRequest } from '../../api';
import { Utilisateur, UtilisateurPayload } from './utilisateur.model';

const route = '/utilisateur';

export const utilisateurService = {
  list(): Promise<Utilisateur[]> {
    return apiRequest<Utilisateur[]>(route);
  },

  create(payload: UtilisateurPayload): Promise<Utilisateur> {
    return apiRequest<Utilisateur>(route, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  update(id: string | number, payload: UtilisateurPayload): Promise<Utilisateur> {
    return apiRequest<Utilisateur>(`${route}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  remove(id: string | number): Promise<void> {
    return apiRequest<void>(`${route}/${id}`, { method: 'DELETE' });
  }
};
