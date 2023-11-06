import {
  Component,
  OnInit,
  OnDestroy,
  Output,
  EventEmitter,
  ChangeDetectorRef,
} from '@angular/core';
import { FormControl, Validators } from '@angular/forms';
import {
  BehaviorSubject,
  combineLatest,
  map,
  startWith,
  Subject,
  takeUntil,
} from 'rxjs';
import { ProfileUser } from 'src/app/shared/models/user-profile';
import { GroupService } from 'src/app/shared/services/group.service';
import { UsersService } from 'src/app/shared/services/users.service';

@Component({
  selector: 'app-add-group',
  templateUrl: './add-group.component.html',
  styleUrls: ['./add-group.component.scss'],
})
export class AddGroupComponent implements OnInit, OnDestroy {
  @Output() close = new EventEmitter<void>();
  @Output() groupCreated = new EventEmitter<void>();

  user$ = this.userService.currentUserProfile$;
  selectedUsers: ProfileUser[] = [];
  searchControl = new FormControl();
  private destroy$ = new Subject<void>();
  private selectedUsersSubject = new BehaviorSubject<ProfileUser[]>([]);
  selectedUsers$ = this.selectedUsersSubject.asObservable();
  groupNameControl = new FormControl('', [
    Validators.required,
    Validators.minLength(1),
    Validators.maxLength(20),
    Validators.pattern(/^\p{L}+$/u),
  ]);

  users$ = combineLatest([
    this.userService.allUsers$,
    this.user$,
    this.searchControl.valueChanges.pipe(startWith('')),
    this.selectedUsers$, // Add this line
  ]).pipe(
    map(([users, user, searchString, selectedUsers]) => {
      // Ensure searchString is a string
      searchString = typeof searchString === 'string' ? searchString : '';

      return users.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(searchString.toLowerCase()) &&
          u.uid !== user?.uid &&
          !selectedUsers.some((selectedUser) => selectedUser.uid === u.uid)
      );
    })
  );

  constructor(
    private userService: UsersService,
    private groupService: GroupService,
    private cdr: ChangeDetectorRef
  ) {}

  addUserToSelection(user: ProfileUser) {
    if (!this.selectedUsers.some((u) => u.uid === user.uid)) {
      this.selectedUsers.push(user);
      this.cdr.detectChanges();
    }
    this.selectedUsersSubject.next(this.selectedUsers);
    this.searchControl.setValue('');
  }

  removeUser(user: ProfileUser) {
    this.selectedUsers = this.selectedUsers.filter((u) => u.uid !== user.uid);
    this.selectedUsersSubject.next(this.selectedUsers);
  }

  finalizeGroupCreation() {
    const groupName = this.groupNameControl.value;
    if (groupName && groupName.trim() !== '') {
      this.groupService
        .createGroup(this.selectedUsers, groupName)
        .pipe(takeUntil(this.destroy$))
        .subscribe(() => {
          this.groupCreated.emit();
          this.closeModal();
        });
    } else {
      return;
    }
  }

  closeModal() {
    this.close.emit();
  }
  ngOnInit(): void {}
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
