import { Injectable } from '@angular/core';
import {
  DocumentReference,
  Firestore,
  addDoc,
  arrayRemove,
  arrayUnion,
  collection,
  doc,
  setDoc,
  updateDoc,
} from '@angular/fire/firestore';
import { Observable, from, tap } from 'rxjs';
import { ProfileUser } from '../models/user-profile';
import { Item } from '../models/item';

@Injectable({
  providedIn: 'root',
})
export class ReceiptService {
  constructor(private firestore: Firestore) {}

  // Add new receipt
  addReceipt(
    groupId: string,
    receiptName: string,
    users: ProfileUser[],
    items: Item[]
  ): Observable<DocumentReference> {
    const ref = collection(this.firestore, 'groups', groupId, 'receipts');
    const receiptData = {
      name: receiptName,
      users: users.map((user) => ({
        displayName: user.displayName ?? '',
      })),
      items,
    };
  
    return from(addDoc(ref, receiptData)).pipe(
      tap((docRef) => {
        console.log('Document created at:', docRef.path);
      })
    );
  }

  addItemsToReceipt(
    groupId: string,
    receiptId: string,
    items: Item[]
  ): Observable<void> {
    const ref = doc(this.firestore, 'groups', groupId, 'receipts', receiptId);
    return from(updateDoc(ref, { items }));
  }


  removeSelectedUserFromGroup(
    groupId: string,
    user: ProfileUser
  ): Observable<void> {
    const ref = doc(this.firestore, 'groups', groupId);
    return from(
      updateDoc(ref, {
        users: arrayRemove({
          displayName: user.displayName ?? '',
        }),
      })
    );
  }

  // Update receipts name
  updateReceiptName(receiptId: string, newName: string): Observable<void> {
    const ref = doc(this.firestore, 'receipts', receiptId);
    return from(updateDoc(ref, { name: newName }));
  }
}
