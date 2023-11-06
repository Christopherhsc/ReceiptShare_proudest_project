import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ReactiveFormsModule } from '@angular/forms';
import { ImageCropperModule } from 'ngx-image-cropper';
import { IonicModule } from '@ionic/angular';


//custom components
import { HeaderComponent } from './components/header/header.component';
import { FormsComponent } from './components/forms/forms.component';

//ang materials
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { ConfirmDialogComponent } from './components/confirm-dialog/confirm-dialog.component';


@NgModule({
  declarations: [HeaderComponent, FormsComponent, ConfirmDialogComponent],
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    ImageCropperModule,
    IonicModule,
    
    MatToolbarModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSnackBarModule,
    MatMenuModule,
  ],
  exports: [IonicModule, HeaderComponent, FormsComponent],
})
export class SharedModule {}
