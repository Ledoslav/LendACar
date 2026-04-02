import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { isDevMode } from '@angular/core';

import { AppModule } from './app/app.module';

// console overrides removed to ensure code cleanliness as requested by professor


platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => {});
