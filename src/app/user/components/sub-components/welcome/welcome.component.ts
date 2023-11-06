import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { DomSanitizer } from '@angular/platform-browser';
import { ImageCroppedEvent } from 'ngx-image-cropper';
import { ImageUploadService } from 'src/app/shared/services/image-upload.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { UntilDestroy, untilDestroyed } from '@ngneat/until-destroy';
import { MatSnackBar } from '@angular/material/snack-bar';
import { switchMap, tap } from 'rxjs/operators';
import { ProfileUser } from 'src/app/shared/models/user-profile';
import { Router } from '@angular/router';

@UntilDestroy()
@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.component.html',
  styleUrls: ['./welcome.component.scss'],
})
export class WelcomeComponent implements OnInit {
  user$ = this.user.currentUserProfile$;

  imageChangedEvent: any = '';
  croppedImage: ImageCroppedEvent;
  croppedImagePreview: any = '';
  isCropping: boolean = false;
  newPassword: string;
  editProfile: boolean = false;
  constructor(
    private imageUpload: ImageUploadService,
    private sanitizer: DomSanitizer,
    private user: UsersService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}
  profileForm = new FormGroup({
    uid: new FormControl(''),
    email: new FormControl('', [Validators.required, Validators.email]),
    displayName: new FormControl('', [
      Validators.required,
      Validators.minLength(2),
      Validators.maxLength(15),
    ]),
    firstName: new FormControl(''),
    lastName: new FormControl(''),
  });

  get name() {
    return this.profileForm.get('displayName');
  }
  get firstName() {
    return this.profileForm.get('firstName');
  }
  get lastName() {
    return this.profileForm.get('lastName');
  }

  get email() {
    return this.profileForm.get('email');
  }
  fileChangedEvent(event: any): void {
    if (event !== null) {
      this.isCropping = true;
    }
    this.imageChangedEvent = event;
  }

  imageCropped(event: ImageCroppedEvent) {
    this.croppedImagePreview = this.sanitizer.bypassSecurityTrustUrl(
      event.objectUrl
    );
    this.croppedImage = event;
  }

  uploadFile(event: any, { uid }: ProfileUser) {
    this.isCropping = false;
    let file = new File([this.croppedImage.blob], '', { type: 'image/png' });
    this.imageUpload
      .uploadImage(file, `images/profile/${uid}`)
      .pipe(
        switchMap((photoURL) =>
          this.user.updateUser({
            uid,
            photoURL,
          })
        )
      )
      .subscribe();
  }

  saveProfile() {
    const { uid, ...data } = this.profileForm.value;

    if (!uid) {
      return;
    }

    this.user
      .updateUser({ uid, ...data })
      .pipe()
      .subscribe();
  }

  discardChanges() {
    this.isCropping = false;
    this.croppedImagePreview = null;
  }

  editProfileSubmit() {
    if (!this.profileForm.valid) return;
    const profileData = this.profileForm.value;
    this.user
      .updateUser(profileData)
      .pipe(
        tap(() => {
          this.snackbar.open('Profile updated successfully', 'Close', {
            duration: 3000,
          });
        })
      )
      .subscribe();
    this.router.navigate(['/user/home']);
  }

  ngOnInit(): void {
    this.user.currentUserProfile$
      .pipe(untilDestroyed(this))
      .subscribe((user) => {
        this.profileForm.patchValue({ ...user });
      });
  }
}
