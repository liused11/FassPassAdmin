import { ApplicationConfig, provideZoneChangeDetection, importProvidersFrom } from "@angular/core";
import { provideAnimationsAsync } from "@angular/platform-browser/animations/async";
import { provideRouter } from "@angular/router";
import { routes } from "./app.routes";
import { providePrimeNG } from "primeng/config";
import { provideHttpClient } from '@angular/common/http'; // ✅ เพิ่ม


// ✅ Import definePreset to create a custom theme
import { definePreset } from '@primeuix/themes';
import Aura from "@primeuix/themes/aura";

import { DynamicDialogModule, DialogService } from "primeng/dynamicdialog";

// ✅ Create a custom preset based on Aura
const MyPreset = definePreset(Aura, {
    semantic: {
        primary: {
            50: '{blue.50}',
            100: '{blue.100}',
            200: '{blue.200}',
            300: '{blue.300}',
            400: '{blue.400}',
            500: '{blue.500}', // This is your main primary color
            600: '{blue.600}',
            700: '{blue.700}',
            800: '{blue.800}',
            900: '{blue.900}',
            950: '{blue.950}'
        }
    }
});

export const appConfig: ApplicationConfig = {
  providers: [
    provideZoneChangeDetection({ eventCoalescing: true }),
    provideRouter(routes),
    provideAnimationsAsync(),
    providePrimeNG({
      ripple: true,
      theme: {
        preset: MyPreset, // ✅ Use the custom preset here
        options: {
            darkModeSelector: 'none' // Disables dark mode
        }
      },
    }),
    importProvidersFrom(DynamicDialogModule),
    DialogService,
    provideHttpClient(),
  ],
};