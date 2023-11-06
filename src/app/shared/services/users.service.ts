import { Injectable } from '@angular/core';
import {
  Firestore,
  collection,
  collectionData,
  doc,
  docData,
  query,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { ProfileUser } from '../models/user-profile';
import { Observable, from, of, switchMap } from 'rxjs';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';

@Injectable({
  providedIn: 'root',
})
export class UsersService {
  constructor(
    private firestore: Firestore,
    private auth: AuthenticationService
  ) {}

  get currentUserProfile$(): Observable<ProfileUser | null> {
    return this.auth.currentUser$.pipe(
      switchMap((user) => {
        if (!user?.uid) {
          return of(null);
        }

        const ref = doc(this.firestore, 'users', user?.uid);
        return docData(ref) as Observable<ProfileUser>;
      })
    );
  }

  get allUsers$(): Observable<ProfileUser[]> {
    const ref = collection(this.firestore, 'users');
    const queryAll = query(ref);
    return collectionData(queryAll) as Observable<ProfileUser[]>;
  }

  addUser(user: ProfileUser): Observable<any> {
    const ref = doc(this.firestore, 'users', user?.uid);
    return from(setDoc(ref, user));
  }

  updateUser(user: ProfileUser): Observable<void> {
    if (user.displayName || user.firstName || user.lastName) {
      user.displayName = this.capitalizeFirstLetter(user.displayName);
      user.firstName = this.capitalizeFirstLetter(user.firstName);
      user.lastName = this.capitalizeFirstLetter(user.lastName);
    }

    const ref = doc(this.firestore, 'users', user.uid);
    return from(updateDoc(ref, { ...user }));
  }

  capitalizeFirstLetter(string: string): string {
    if (typeof string !== 'string' || !string) return '';
    return string.charAt(0).toUpperCase() + string.slice(1).toLowerCase();
  }
}
