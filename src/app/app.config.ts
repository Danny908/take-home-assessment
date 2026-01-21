import { ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideMomentDateAdapter } from '@angular/material-moment-adapter';

export const appConfig: ApplicationConfig = {
  providers: [provideBrowserGlobalErrorListeners(), provideMomentDateAdapter()],
};
