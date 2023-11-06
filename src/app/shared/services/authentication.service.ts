import { Injectable } from '@angular/core';
import {
  Auth,
  UserInfo,
  updateEmail,
  authState,
  createUserWithEmailAndPassword,
  updateProfile,
  getAuth,
  signInWithEmailAndPassword,
} from '@angular/fire/auth';

import { Observable, concatMap, from, of, switchMap } from 'rxjs';

@Injectable({
  providedIn: 'root',
})
export class AuthenticationService {
  currentUser$ = authState(this.auth);
  constructor(private auth: Auth) {
    this.auth = getAuth();
  }

  register(email: string, password: string) {
    return from(createUserWithEmailAndPassword(this.auth, email, password));
  }

  login(username: string, password: string) {
    return from(signInWithEmailAndPassword(this.auth, username, password));
  }

  logout() {
    return from(this.auth.signOut());
  }

  updateProfileData(email: string): Observable<any> {
    const user = this.auth.currentUser;
    return of(user).pipe(
      concatMap((user) => {
        if (!user) {
        }

        return updateEmail(user, email).then(() => {});
      })
    );
  }
  updateProfilePicture(profileData: Partial<UserInfo>): Observable<any> {
    const user = this.auth.currentUser;
    return of(user).pipe(
      concatMap((user) => {
        if (!user) throw new Error('User not authenticated');

        return updateProfile(user, profileData);
      })
    );
  }
}
