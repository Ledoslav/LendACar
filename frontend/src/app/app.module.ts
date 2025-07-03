import { NgModule } from '@angular/core';
import { BrowserModule } from '@angular/platform-browser';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { provideAnimationsAsync } from '@angular/platform-browser/animations/async';
import {HTTP_INTERCEPTORS, HttpClient, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import { LayoutComponent } from './layout/layout.component';
import { ForgotPasswordComponent } from './forgot-password/forgot-password.component';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
//import { DashboardComponent } from './employee/dashboard/dashboard.component';
import { TooltipModule } from 'ngx-bootstrap/tooltip';
import {DatePipe} from '@angular/common';
import {MatStepperModule} from '@angular/material/stepper';
import { NgxCaptchaModule } from 'ngx-captcha';
import { JwtModule } from "@auth0/angular-jwt";
import {TokenInterceptor} from './interceptors/token.interceptor';
import {ErrorInterceptor} from './interceptors/error.interceptor';
import {
  MatDialogModule,
} from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import {TranslateLoader, TranslateModule} from '@ngx-translate/core';
import {CustomTranslateLoader} from './services/custom-translate-loader';
import {MatOption, MatSelect} from '@angular/material/select';


@NgModule({
  declarations: [
    AppComponent,
    LayoutComponent,
    ForgotPasswordComponent,
    //DashboardComponent,
  ],
  imports: [
    BrowserModule,
    AppRoutingModule,
    HttpClientModule,
    ReactiveFormsModule,
    FormsModule,
    BrowserAnimationsModule,
    TooltipModule,
    DatePipe,
    MatStepperModule,
    NgxCaptchaModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    JwtModule.forRoot({
      config: {
        tokenGetter: () => '',
        headerName: "my-auth-token"
      }
    }),
    TranslateModule.forRoot({
      loader: {
        provide: TranslateLoader,
        useFactory: (http: HttpClient) => new CustomTranslateLoader(http),
        deps: [HttpClient]
      },
      defaultLanguage: 'bs' // Podrazumijevani jezik
    }),
    MatSelect,
    MatOption

  ],
  providers: [
    provideAnimationsAsync(),
    DatePipe,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: TokenInterceptor,
      multi: true,
    },
    {
      provide: HTTP_INTERCEPTORS,
      useClass: ErrorInterceptor,
      multi: true,
    }
  ],
  exports: [
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
