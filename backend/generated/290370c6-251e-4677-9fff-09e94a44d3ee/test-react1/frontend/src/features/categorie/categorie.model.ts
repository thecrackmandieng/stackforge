export interface Categorie {
  idCategorie: number;
  nomCategorie: string;
  description: string;
  createdAt: string;
}

export type CategorieFormValue = string | number | boolean | null;
export type CategoriePayload = Partial<Record<keyof Omit<Categorie, "idCategorie">, CategorieFormValue>>;
