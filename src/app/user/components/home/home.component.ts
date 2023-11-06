import { Component, OnInit, OnDestroy } from '@angular/core';
import { Subject, of, switchMap, take, takeUntil } from 'rxjs';
import { GroupService } from 'src/app/shared/services/group.service';
import { UsersService } from 'src/app/shared/services/users.service';
import { BehaviorSubject } from 'rxjs';
import { Router, ActivatedRoute } from '@angular/router';

@Component({
  selector: 'app-home',
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.scss'],
})
export class HomeComponent implements OnInit, OnDestroy {
  user$ = this.userService.currentUserProfile$;
  groups$ = new BehaviorSubject<any[]>([]);
  public showModal = false;
  private destroy$ = new Subject<void>();

  constructor(
    private userService: UsersService,
    private groupService: GroupService,
  ) {}

  encodeGroupId(groupId: string): string {
    return encodeURIComponent(groupId);
  }

  refreshGroups() {
    this.user$
      .pipe(
        take(1),
        switchMap((user) => {
          if (user) {
            return this.groupService.getGroupsForUser(user.uid);
          } else {
            return of([]);
          }
        }),
        takeUntil(this.destroy$)
      )
      .subscribe((groups) => {
        this.groups$.next(groups);
      });
  }

  ngOnInit(): void {
    
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
  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
