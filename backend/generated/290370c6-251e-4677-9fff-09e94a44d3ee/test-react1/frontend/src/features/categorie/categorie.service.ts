import { apiRequest } from '../../api';
import { Categorie, CategoriePayload } from './categorie.model';

const route = '/categorie';

export const categorieService = {
  list(): Promise<Categorie[]> {
    return apiRequest<Categorie[]>(route);
  },

  create(payload: CategoriePayload): Promise<Categorie> {
    return apiRequest<Categorie>(route, {
      method: 'POST',
      body: JSON.stringify(payload)
    });
  },

  update(id: string | number, payload: CategoriePayload): Promise<Categorie> {
    return apiRequest<Categorie>(`${route}/${id}`, {
      method: 'PUT',
      body: JSON.stringify(payload)
    });
  },

  remove(id: string | number): Promise<void> {
    return apiRequest<void>(`${route}/${id}`, { method: 'DELETE' });
  }
};
