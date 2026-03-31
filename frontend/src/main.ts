import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { isDevMode } from '@angular/core';

import { AppModule } from './app/app.module';

if (!isDevMode()) {
  window.console.log = function() {};
  // window.console.error = function() {}; // Keeping error for critical issues, but disabled if wanted
  window.console.warn = function() {};
  window.console.info = function() {};
}

platformBrowserDynamic().bootstrapModule(AppModule)
  .catch(err => console.error(err));
