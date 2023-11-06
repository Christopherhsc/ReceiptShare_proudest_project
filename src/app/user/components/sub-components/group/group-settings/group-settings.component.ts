import { Component, OnInit } from '@angular/core';
import { FormControl, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { GroupService } from 'src/app/shared/services/group.service';

@Component({
  selector: 'app-group-settings',
  templateUrl: './group-settings.component.html',
  styleUrls: ['./group-settings.component.scss'],
})
export class GroupSettingsComponent implements OnInit {
  group: any;
  constructor(
    private groupService: GroupService,
    private route: ActivatedRoute
  ) {}

  groupNameControl = new FormGroup({
    groupName: new FormControl('', [
      Validators.required,
      Validators.minLength(1),
      Validators.maxLength(20),
      Validators.pattern(/^\p{L}+$/u),
    ]),
  });

  onSubmit() {
    if (this.groupNameControl.valid) {
      const updatedGroupName = this.groupNameControl.get('groupName').value;
      this.groupService
        .updateGroupName(this.group.id, updatedGroupName)
        .subscribe(() => {
          // Handle success, e.g., show a success message
        });
    }
  }

  ngOnInit(): void {
    const groupId = this.route.snapshot.paramMap.get('groupId');
    if (groupId) {
      this.groupService.getGroupById(groupId).subscribe((group) => {
        this.group = { id: groupId, ...group };
        this.groupNameControl.get('groupName').setValue(this.group.groupName);
      });
    }
  }
}
