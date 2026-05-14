import { Injectable } from '@angular/core';

export type DatabaseProvider = 'mysql' | 'postgres';
export type FrontendFramework = 'ionic' | 'angular' | 'react' | 'react-native';

export interface GeneratePayload {
  name: string;
  frontend?: {
    framework: FrontendFramework;
  };
  database?: {
    provider: DatabaseProvider;
    host: string;
    port?: number;
    user: string;
    password?: string;
    database: string;
    ssl?: boolean;
  };
  schema?: unknown;
}

export interface GenerateResponse {
  status: boolean;
  message: string;
  jobId: string;
  projectName: string;
  outputPath: string;
  zipPath: string;
  downloadUrl: string;
  tables: string[];
  manifest: GeneratedProjectManifest;
}

export interface GeneratedProjectSummary {
  jobId: string;
  projectName: string;
  outputPath: string;
  zipPath: string;
  downloadUrl: string;
  createdAt: string;
  manifest?: GeneratedProjectManifest;
}

export interface GeneratedEndpointDoc {
  method: 'GET' | 'POST' | 'PUT' | 'DELETE';
  path: string;
  description: string;
}

export interface GeneratedComponentDoc {
  name: string;
  type: 'backend' | 'frontend';
  path: string;
  role: string;
}

export interface GeneratedScreenDoc {
  name: string;
  route: string;
  path: string;
  description: string;
}

export interface GeneratedProjectManifest {
  projectName: string;
  createdAt: string;
  demo: {
    login: string;
    password: string;
    otpCode?: string;
    startRoute: string;
  };
  components: GeneratedComponentDoc[];
  screens: GeneratedScreenDoc[];
  endpoints: GeneratedEndpointDoc[];
}

@Injectable({
  providedIn: 'root'
})
export class ApiService {
  private apiUrlPromise: Promise<string> | null = null;

  private async getApiUrl(): Promise<string> {
    if (!this.apiUrlPromise) {
      this.apiUrlPromise = fetch('/runtime-config.json')
        .then(async (response) => {
          if (!response.ok) {
            throw new Error('Runtime config unavailable.');
          }

          const config = await response.json();
          return String(config.apiUrl || 'http://localhost:3001').replace(/\/$/, '');
        })
        .catch(() => 'http://localhost:3001');
    }

    return this.apiUrlPromise;
  }

  async listGenerations(): Promise<GeneratedProjectSummary[]> {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/generations`);

    if (!response.ok) {
      throw new Error('Impossible de charger les generations.');
    }

    const result = await response.json();
    return result.map((item: GeneratedProjectSummary) => ({
      ...item,
      downloadUrl: `${apiUrl}${item.downloadUrl}`
    }));
  }

  async getGeneration(jobId: string): Promise<GeneratedProjectManifest> {
    const apiUrl = await this.getApiUrl();
    const response = await fetch(`${apiUrl}/generations/${jobId}`);

    if (!response.ok) {
      throw new Error('Impossible de charger le detail du projet.');
    }

    return response.json();
  }

  async generateProject(data: GeneratePayload): Promise<GenerateResponse> {
    const controller = new AbortController();
    const timeout = window.setTimeout(() => controller.abort(), 30000);
    const apiUrl = await this.getApiUrl();

    try {
      const response = await fetch(`${apiUrl}/generate`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json'
        },
        body: JSON.stringify(data),
        signal: controller.signal
      });

      if (!response.ok) {
        const error = await response.json().catch(() => null);
        throw new Error(error?.message || 'Generation impossible.');
      }

      const result = await response.json();
      return {
        ...result,
        downloadUrl: `${apiUrl}${result.downloadUrl}`
      };
    } catch (error) {
      if (error instanceof DOMException && error.name === 'AbortError') {
        throw new Error('La generation prend trop de temps. Verifie que la base est accessible depuis le backend.');
      }
      throw error;
    } finally {
      window.clearTimeout(timeout);
    }
  }
}
