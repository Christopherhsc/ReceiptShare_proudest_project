import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ImageCropperModule } from 'ngx-image-cropper';
import { ReactiveFormsModule } from '@angular/forms';
import { UserRoutingModule } from './user-routing.module';
import { SharedModule } from '../shared/shared.module';
import { FormsModule } from '@angular/forms';

//custom components
import { UserLandingPageComponent } from './user-landing-page/user-landing-page.component';
import { ProfileComponent } from './components/profile/profile.component';
import { HomeComponent } from './components/home/home.component';
import { AddGroupComponent } from './components/sub-components/group-add/add-group.component';
import { WelcomeComponent } from './components/sub-components/welcome/welcome.component';
import { GroupComponent } from './components/sub-components/group/group.component';

// CHILDS FOR GROUPCOMPONENT
import { GroupNameComponent } from './components/sub-components/group/group-name/group-name.component';
import { GroupUserManagementComponent } from './components/sub-components/group/group-user-management/group-user-management.component';
import { GroupSettingsComponent } from './components/sub-components/group/group-settings/group-settings.component';
import { GroupCrucialSettingsComponent } from './components/sub-components/group/group-crucial-settings/group-crucial-settings.component';
import { ReceiptNameComponent } from './components/sub-components/group/receipt-name/receipt-name.component';
import { ReceiptAddComponent } from './components/sub-components/group/receipt-add/receipt-add.component';

//ang materials
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatAutocompleteModule } from '@angular/material/autocomplete';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialogModule } from '@angular/material/dialog';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatExpansionModule } from '@angular/material/expansion'

@NgModule({
  declarations: [
    UserLandingPageComponent,
    ProfileComponent,
    HomeComponent,
    WelcomeComponent,
    AddGroupComponent,
    GroupComponent,
    GroupNameComponent,
    GroupUserManagementComponent,
    GroupCrucialSettingsComponent,
    GroupSettingsComponent,
    ReceiptNameComponent,
    ReceiptAddComponent,
  ],
  imports: [
    CommonModule,
    UserRoutingModule,
    SharedModule,
    ImageCropperModule,
    ReactiveFormsModule,
    FormsModule,

    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatAutocompleteModule,
    MatSnackBarModule,
    MatDialogModule,
    MatCheckboxModule,
    MatExpansionModule,
  ],
})
export class UserModule {}
