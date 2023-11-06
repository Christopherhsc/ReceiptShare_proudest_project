import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { ProfileUser } from '../models/user-profile';

@Injectable({
  providedIn: 'root'
})
export class SharedDataService {
  private selectedUsersSubject = new BehaviorSubject<ProfileUser[]>([]);
  selectedUsers$ = this.selectedUsersSubject.asObservable();

  constructor() { }

  setSelectedUsers(users: ProfileUser[]): void {
    this.selectedUsersSubject.next(users);
  }
}
