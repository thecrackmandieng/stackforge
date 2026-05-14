import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';

import { routes } from './app.routes';
import { provideClientHydration, withEventReplay } from '@angular/platform-browser';
import { provideIonicAngular } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  cloudDownloadOutline,
  codeSlashOutline,
  flashOutline,
  layersOutline,
  playCircleOutline,
  serverOutline
} from 'ionicons/icons';

addIcons({
  cloudDownloadOutline,
  codeSlashOutline,
  flashOutline,
  layersOutline,
  playCircleOutline,
  serverOutline
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideIonicAngular(),
    provideRouter(routes),
    provideClientHydration(withEventReplay())
  ]
};
