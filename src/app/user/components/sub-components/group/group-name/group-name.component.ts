import { Component, Input, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from 'src/app/shared/services/group.service';

@Component({
  selector: 'app-group-name',
  templateUrl: './group-name.component.html',
  styleUrls: ['./group-name.component.scss'],
})
export class GroupNameComponent implements OnInit {
  group: any;

  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute
  ) {}

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    if (groupId) {
      this.groupService.currentGroup$.subscribe((group) => {
        if (group && group.id === groupId) {
          this.group = group;
        }
      });
    }
  }
}
