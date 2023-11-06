import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import { FormControl } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { GroupService } from 'src/app/shared/services/group.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { BehaviorSubject, Subscription, combineLatest } from 'rxjs';
import { map, startWith, take } from 'rxjs/operators';
import { ProfileUser } from 'src/app/shared/models/user-profile';
import { ActivatedRoute } from '@angular/router';
import { SharedDataService } from 'src/app/shared/services/shared-data.service';

@Component({
  selector: 'app-group-user-management',
  templateUrl: './group-user-management.component.html',
  styleUrls: ['./group-user-management.component.scss'],
})
export class GroupUserManagementComponent implements OnInit, OnDestroy {
  user$ = this.userService.currentUserProfile$;
  selectedUsers: ProfileUser[] = [];
  searchControl = new FormControl();
  removeUserControl = new FormControl();
  private selectedUsersSubject = new BehaviorSubject<ProfileUser[]>([]);
  selectedUsers$ = this.selectedUsersSubject.asObservable();
  group: any;
  private paramMapSubscription: Subscription;

  constructor(
    private groupService: GroupService,
    private userService: UsersService,
    private snackbar: MatSnackBar,
    private route: ActivatedRoute,
    private cdr: ChangeDetectorRef,
    private sharedDataService: SharedDataService
  ) {}

  users$ = combineLatest([
    this.userService.allUsers$,
    this.user$,
    this.searchControl.valueChanges.pipe(
      map((value) => (typeof value === 'string' ? value : '')),
      startWith('')
    ),
    this.selectedUsers$,
  ]).pipe(
    map(([users, user, searchString, selectedUsers]) => {
      return users.filter(
        (u) =>
          u.displayName?.toLowerCase().includes(
            typeof searchString === 'string' ? searchString.toLowerCase() : '' // Check if searchString is a string before calling toLowerCase
          ) &&
          u.uid !== user?.uid &&
          !selectedUsers.some((selectedUser) => selectedUser.uid === u.uid)
      );
    })
  );

  getFontSize(displayName: string): string {
    if (displayName.length > 14) {
      return '12px';
    } else {
      return '18px';
    }
  }

  truncateDisplayName(name: string): string {
    if (name.length > 8) {
      return name.substring(0, 8) + '...';
    }
    return name;
  }

  fetchGroupData(groupId: string) {
    this.groupService.getGroupById(groupId).subscribe((group) => {
      this.group = { id: groupId, ...group };
      this.selectedUsers = group.users || [];
      this.sharedDataService.setSelectedUsers(this.selectedUsers);
    });
  }

  addUserToSelection(user: ProfileUser) {
    if (this.selectedUsers.some((u) => u.uid === user.uid)) {
      // Display snackbar if user already exists in the group
      this.snackbar.open(
        "Couldn't add user to the group since user is already a member",
        'Close',
        {
          duration: 3000,
        }
      );
    }

    this.selectedUsers.push(user);
    this.cdr.detectChanges();
    this.selectedUsersSubject.next(this.selectedUsers);
    this.searchControl.setValue('');

    // Update the group in Firestore
    this.groupService.addUserToGroup(this.group.id, user).subscribe(() => {
      this.snackbar.open('User added successfully', 'Close', {
        duration: 3000,
      });
      this.fetchGroupData(this.group.id);
    });
  }

  removeUserFromSelection(user: ProfileUser) {
    // Check if the user trying to be removed is the current user
    this.user$.pipe(take(1)).subscribe((currentUser) => {
      if (user.uid === currentUser.uid) {
        this.snackbar.open("You can't remove yourself!", 'Close', {
          duration: 3000,
        });
        return; // Early return to stop execution if it's the current user
      }
  
      // Remove the user from the local state
      this.selectedUsers = this.selectedUsers.filter((u) => u.uid !== user.uid);
      this.selectedUsersSubject.next(this.selectedUsers);
      this.removeUserControl.setValue('');
  
      // Update the group in Firestore
      if (this.group && this.group.id) {
        this.groupService.removeSelectedUserFromGroup(this.group.id, user).subscribe(
          () => {
            this.snackbar.open('User removed successfully', 'Close', {
              duration: 3000,
            });
  
            // Fetch the entire group after successful removal
            this.fetchGroupData(this.group.id);
          },
          (error) => {
            console.error('Error removing user:', error);
          }
        );
      } else {
        console.error('Group ID not found. Cannot remove user from group.');
      }
    });
  }
  

  ngOnInit(): void {
    this.paramMapSubscription = this.route.paramMap.subscribe((params) => {
      const groupId = params.get('groupId');
      if (groupId) {
        this.fetchGroupData(groupId);
      }
    });
  }

  ngOnDestroy(): void {
    if (this.paramMapSubscription) {
      this.paramMapSubscription.unsubscribe();
    }
  }
}
