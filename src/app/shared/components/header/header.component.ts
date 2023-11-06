import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { AuthenticationService } from 'src/app/shared/services/authentication.service';
import { UsersService } from '../../services/users.service';
import { BehaviorSubject, of, switchMap } from 'rxjs';
import { GroupService } from '../../services/group.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.scss'],
})
export class HeaderComponent implements OnInit {
  user$ = this.userService.currentUserProfile$;
  groups$ = new BehaviorSubject<any[]>([]);

  constructor(
    private userService: UsersService,
    private groupService: GroupService,
    private auth: AuthenticationService,
    private router: Router
  ) {}

  navigateToLogout() {
    this.auth.logout().subscribe(() => {
      this.router.navigate(['']);
    });
  }

  onNavigateTo(group: any) {
    this.router.navigate(['/user/group-settings', group.id]);
  }

  ngOnInit(): void {
    this.groupService.groups$.subscribe((groups) => {
      this.groups$.next(groups);
    });
    this.user$
      .pipe(
        switchMap((user) => {
          if (user) {
            return this.groupService.getGroupsForUser(user.uid);
          } else {
            return of([]);
          }
        })
      )
      .subscribe((groups) => {
        this.groups$.next(groups);
      });
  }
}
