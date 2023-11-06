import { ChangeDetectorRef, Component, OnDestroy, OnInit } from '@angular/core';
import {
  FormControl,
  FormsModule,
  FormBuilder,
  FormGroup,
  Validators,
} from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import { Item } from 'src/app/shared/models/item';
import { ProfileUser } from 'src/app/shared/models/user-profile';
import { GroupService } from 'src/app/shared/services/group.service';
import { ReceiptService } from 'src/app/shared/services/receipt.service';

interface ProfileUserWithSelection extends ProfileUser {
  isSelected: boolean;
}

@Component({
  selector: 'app-receipt-add',
  templateUrl: './receipt-add.component.html',
  styleUrls: ['./receipt-add.component.scss'],
})
export class ReceiptAddComponent implements OnInit, OnDestroy {
  selectedReceiptUsers: ProfileUserWithSelection[] = [];
  usersWithSelection: ProfileUserWithSelection[] = [];
  userControl = new FormControl();
  receiptNameControl = new FormControl();
  group: any;
  items: Item[] = [];
  itemForm: FormGroup;
  addItemMode = false;
  splitAmount: number;

  constructor(
    private groupService: GroupService,
    private receiptService: ReceiptService,
    private route: ActivatedRoute,
    private fb: FormBuilder
  ) {
    this.receiptNameControl = new FormControl('', [
      Validators.required,
      Validators.min(0),
    ]);
    this.itemForm = this.fb.group({
      name: ['', Validators.required],
      price: ['', [Validators.required, Validators.min(0)]],
    });
  }

  currentStep: number = 1;
  showStepper: boolean = false;
  isSelect: boolean;

  setStep(step: number): void {
    this.currentStep = step;
  }

  toggleStepper(): void {
    this.showStepper = !this.showStepper;
  }

  fetchGroupData(groupId: string) {
    this.groupService.getGroupById(groupId).subscribe((group) => {
      this.group = { id: groupId, ...group };
      this.usersWithSelection = this.group.users.map((user) => {
        return {
          ...user,
          isSelected: !!this.selectedReceiptUsers.find(
            (u) => u.uid === user.uid
          ),
        };
      });
    });
  }

  toggleUserSelection(
    user: ProfileUserWithSelection,
    isChecked: boolean
  ): void {
    const userIndex = this.selectedReceiptUsers.findIndex(
      (u) => u.uid === user.uid
    );
    console.log('isChecked:', isChecked);
    console.log('user.uid:', user.uid);
    console.log('userIndex:', userIndex);
    if (isChecked && userIndex === -1) {
      this.selectedReceiptUsers.push(user);
    } else if (!isChecked && userIndex !== -1) {
      this.selectedReceiptUsers.splice(userIndex, 1);
    }

    console.log('Final selected users:', this.selectedReceiptUsers);
  }

  trackUserByUid(index: number, user: ProfileUser): string {
    return user.uid;
  }

  confirmAndSaveReceipt(): void {
    const receiptName = this.receiptNameControl.value;
    const groupId = this.group?.id;

    if (
      receiptName &&
      groupId &&
      this.selectedReceiptUsers.every((user) => Boolean(user.displayName))
    ) {
      this.receiptService
        .addReceipt(groupId, receiptName, this.selectedReceiptUsers, this.items)
        .subscribe(() => {
          console.log('Receipt saved successfully');
          this.showStepper = false; // Reset the stepper
        });
    } else {
      console.error('Invalid data:', {
        receiptName,
        groupId,
        users: this.selectedReceiptUsers,
        items: this.items,
      });
    }
  }

  addItem() {
    if (this.itemForm.valid) {
      this.items.push(this.itemForm.value);
      this.itemForm.reset();
      this.addItemMode = false; // Hide the form after addition
    }
  }

  toggleAddItemMode() {
    this.addItemMode = !this.addItemMode;
  }
  toggleSplitMode(item: Item): void {
    item.splitMode = !item.splitMode;
    if (item.splitMode) {
      this.selectedReceiptUsers.forEach(
        (user) =>
          (user.currency = item.price / this.selectedReceiptUsers.length)
      );
    }
  }
  anyItemInSplitMode(): boolean {
    return this.items.some((item) => item.splitMode);
  }
  saveSplit(item: Item): void {
    // Calculate the total split amount
    const totalSplitAmount = this.selectedReceiptUsers.reduce(
      (total, user) => total + user.currency,
      0
    );

    // Update the item price based on the split amounts
    if (item.price > totalSplitAmount) {
      item.price = totalSplitAmount;
    } else{
      alert("you cant do that");
    }

    item.splitMode = false;
  }

  ngOnInit(): void {
    console.log(this.selectedReceiptUsers);
    const groupId = this.route.snapshot.paramMap.get('groupId');
    if (groupId) {
      this.fetchGroupData(groupId);
    }
  }
  ngOnDestroy(): void {}
}
