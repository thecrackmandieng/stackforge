export interface Utilisateur {
  idUtilisateur: number;
  nom: string;
  email: string;
  password: string;
  createdAt: string;
}

export type UtilisateurFormValue = string | number | boolean | null;
export type UtilisateurPayload = Partial<Record<keyof Omit<Utilisateur, "idUtilisateur">, UtilisateurFormValue>>;
