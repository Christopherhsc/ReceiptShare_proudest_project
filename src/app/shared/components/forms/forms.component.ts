import { animate, style, transition, trigger } from '@angular/animations';
import { Component, Input, OnInit } from '@angular/core';
import {
  AbstractControl,
  FormBuilder,
  FormControl,
  FormGroup,
  ValidationErrors,
  ValidatorFn,
  Validators,
} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';
import { switchMap } from 'rxjs';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { UsersService } from '../../services/users.service';

export function passwordsMatchValidator(): ValidatorFn {
  return (control: AbstractControl): ValidationErrors | null => {
    const password = control.get('password')?.value;
    const confirmPassword = control.get('confirmPassword')?.value;

    if (password && confirmPassword && password !== confirmPassword) {
      return {
        passwordsDontMatch: true,
      };
    }

    return null;
  };
}

@Component({
  selector: 'app-forms',
  templateUrl: './forms.component.html',
  styleUrls: ['./forms.component.scss'],
  animations: [
    trigger('slideInOut', [
      transition(':enter', [
        style({ transform: 'translateX(-200%)' }), // Slide in from right to left
        animate('1s ease-out', style({ transform: 'translateX(0)' })),
      ]),
    ]),
  ],
})
export class FormsComponent implements OnInit {
  @Input() login: boolean = false;
  @Input() register: boolean = false;
  showLogin: boolean = true;

  registrationForm = new FormGroup(
    {
      name: new FormControl('', [
        Validators.required,
        Validators.minLength(2),
        Validators.maxLength(15),
        Validators.pattern(/^\p{L}+$/u),
      ]),
      email: new FormControl('', [Validators.required, Validators.email]),
      password: new FormControl('', [
        Validators.required,
        Validators.minLength(6),
      ]),
      confirmPassword: new FormControl('', Validators.required),
    },
    { validators: passwordsMatchValidator() }
  );
  loginForm = this.fb.group({
    email: this.fb.control(
      '',
      Validators.compose([Validators.required, Validators.email])
    ),
    password: this.fb.control('', Validators.required),
  });

  get name() {
    return this.registrationForm.get('name');
  }
  get email() {
    return this.registrationForm.get('email');
  }
  get password() {
    return this.registrationForm.get('password');
  }
  get confirmPassword() {
    return this.registrationForm.get('confirmPassword');
  }

  constructor(
    private fb: FormBuilder,
    private authService: AuthenticationService,
    private userService: UsersService,
    private router: Router,
    private snackbar: MatSnackBar
  ) {}

  loginSubmit() {
    if (!this.loginForm.valid) {
      return;
    }
    const { email, password } = this.loginForm.value;
    this.authService
      .login(email, password)
      .pipe()
      .subscribe({
        next: () => {
          this.router.navigate(['user/home']);
        },
      });
  }

  registerSubmit() {
    if (!this.registrationForm.valid) return;

    const { email, password, name } = this.registrationForm.value;
    const capitalizedDisplayName = this.userService.capitalizeFirstLetter(name);

    this.authService
      .register(email, password)
      .pipe(
        switchMap(({ user: { uid } }) =>
          this.userService.addUser({
            uid,
            email,
            displayName: capitalizedDisplayName,
          })
        )
      )
      .subscribe(() => {
        this.snackbar.open(
          `Congrats ${capitalizedDisplayName}! You are all signed up`,
          'Close',
          {
            duration: 3000,
          }
        );
        this.router.navigate(['/user/welcome']);
      });
  }

  ngOnInit(): void {}
}
