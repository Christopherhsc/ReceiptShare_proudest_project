import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { AuthRoutingModule } from './auth-routing.module';

//custom components
import { LoginComponent } from './components/login/login.component';
import { RegisterComponent } from './components/register/register.component';
import { AuthLandingPageComponent } from './auth-landing-page/auth-landing-page.component';

// custom modules
import { SharedModule } from '../shared/shared.module';

@NgModule({
  declarations: [LoginComponent, RegisterComponent, AuthLandingPageComponent],
  imports: [
    CommonModule,
    AuthRoutingModule,
    SharedModule,
  ],
})
export class AuthModule {}
