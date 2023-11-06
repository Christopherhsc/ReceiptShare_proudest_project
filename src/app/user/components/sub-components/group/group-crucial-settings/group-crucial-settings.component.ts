import { Component, OnInit } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ActivatedRoute, Router } from '@angular/router';
import { BehaviorSubject, take } from 'rxjs';
import { ConfirmDialogComponent } from 'src/app/shared/components/confirm-dialog/confirm-dialog.component';
import { ProfileUser } from 'src/app/shared/models/user-profile';
import { GroupService } from 'src/app/shared/services/group.service';
import { UsersService } from 'src/app/shared/services/users.service';

@Component({
  selector: 'app-group-crucial-settings',
  templateUrl: './group-crucial-settings.component.html',
  styleUrls: ['./group-crucial-settings.component.scss'],
})
export class GroupCrucialSettingsComponent implements OnInit {
  user$ = this.userService.currentUserProfile$;
  selectedUsers: ProfileUser[] = [];
  private selectedUsersSubject = new BehaviorSubject<ProfileUser[]>([]);
  group: any;
  constructor(
    private dialog: MatDialog,
    private userService: UsersService,
    private route: ActivatedRoute,
    private router: Router,
    private groupService: GroupService,
    private snackbar: MatSnackBar
  ) {}

  onLeaveGroup(): void {
    const dialogRef = this.dialog.open(ConfirmDialogComponent);

    dialogRef.afterClosed().subscribe((result) => {
      if (result) {
        this.user$.pipe(take(1)).subscribe((currentUser) => {
          if (currentUser) {
            // Remove the user from the local state
            this.selectedUsers = this.selectedUsers.filter(
              (u) => u.uid !== currentUser.uid
            );
            this.selectedUsersSubject.next(this.selectedUsers);

            // Update the group in Firestore
            if (this.group && this.group.id) {
              this.router.navigateByUrl('user/home');
              this.groupService
                .removeCurrentUserFromGroup(this.group.id, currentUser)
                .subscribe(
                  () => {
                    this.snackbar.open(
                      'You left the group successfully',
                      'Close',
                      {
                        duration: 3000,
                      }
                    );
                    // Fetch the entire group after successful removal
                    this.fetchGroupData(this.group.id);
                  },
                  (error) => {
                    console.error('Error removing user:', error);
                  }
                );
            } else {
              console.error(
                'Group ID not found. Cannot remove user from group.'
              );
            }
          } else {
            console.error('No current user found.');
          }
        });
      }
    });
  }

  onDeleteGroup(groupId: string): void {
    this.groupService.deleteGroup(groupId).subscribe(
      () => {
        this.snackbar.open('Group deleted successfully', 'Close', {
          duration: 3000,
        });
        this.router.navigateByUrl('/user/home');
      },
      (error) => {
        this.snackbar.open('Error deleting group', 'Close', {
          duration: 3000,
        });
      }
    );
  }

  fetchGroupData(groupId: string) {
    this.groupService.getGroupById(groupId).subscribe((group) => {
      this.group = { id: groupId, ...group };
      this.selectedUsers = group.users || [];
      this.selectedUsersSubject.next(this.selectedUsers);
    });
  }

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    if (groupId) {
      this.fetchGroupData(groupId);
    } else {
      console.error('No group ID found in route parameters.');
    }
  }
}
