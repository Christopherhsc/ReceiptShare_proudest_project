import { Injectable } from '@angular/core';
import {
  Firestore,
  addDoc,
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc,
  getDoc,
  updateDoc,
  arrayUnion,
  arrayRemove,
} from '@angular/fire/firestore';
import { ProfileUser } from '../models/user-profile';
import {
  Observable,
  concatMap,
  map,
  take,
  from,
  BehaviorSubject,
  tap,
  switchMap,
  of,
} from 'rxjs';
import { UsersService } from './users.service';

@Injectable({
  providedIn: 'root',
})
export class GroupService {
  private groupsSubject = new BehaviorSubject<any[]>([]);
  public groups$ = this.groupsSubject.asObservable();
  private currentGroupSubject = new BehaviorSubject<any>(null);
  public currentGroup$ = this.currentGroupSubject.asObservable();

  constructor(
    private firestore: Firestore,
    private userSerivce: UsersService
  ) {}

  createGroup(users: ProfileUser[], groupName: string): Observable<string> {
    const ref = collection(this.firestore, 'groups');

    return this.userSerivce.currentUserProfile$.pipe(
      take(1),
      concatMap((currentUser) => {
        const groupData = {
          groupName: groupName,
          userIds: [currentUser?.uid, ...users.map((u) => u.uid)],
          users: [
            {
              uid: currentUser?.uid ?? '',
              displayName: currentUser?.displayName ?? '',
              photoURL: currentUser?.photoURL ?? '',
            },
            ...users.map((u) => ({
              uid: u.uid ?? '',
              displayName: u.displayName ?? '',
              photoURL: u.photoURL ?? '',
            })),
          ],
        };

        return from(addDoc(ref, groupData)).pipe(
          switchMap((docRef) => {
            if (currentUser?.uid) {
              return this.updateGroupsList(currentUser.uid).pipe(
                map(() => docRef.id)
              );
            }
            return of(docRef.id);
          })
        );
      })
    );
  }

  private updateGroupsList(userId: string): Observable<any[]> {
    return this.getGroupsForUser(userId).pipe(
      tap((groups) => {
        this.groupsSubject.next(groups);
      })
    );
  }

  getGroupsForUser(userId: string): Observable<any[]> {
    const groupQuery = query(
      collection(this.firestore, 'groups'),
      where('userIds', 'array-contains', userId)
    );
    return from(getDocs(groupQuery)).pipe(
      map((querySnapshot) =>
        querySnapshot.docs.map((doc) => ({ id: doc.id, ...doc.data() }))
      )
    );
  }

  addUserToGroup(groupId: string, user: ProfileUser): Observable<void> {
    const ref = doc(this.firestore, 'groups', groupId);
    return from(
      updateDoc(ref, {
        users: arrayUnion({
          displayName: user.displayName ?? '',
          photoURL: user.photoURL ?? '',
        }),
      })
    );
  }

  removeSelectedUserFromGroup(
    groupId: string,
    user: ProfileUser
  ): Observable<void> {
    const ref = doc(this.firestore, 'groups', groupId);

    return from(
      updateDoc(ref, {
        users: arrayRemove({
          uid: user.uid,
          displayName: user.displayName ?? '',
          photoURL: user.photoURL ?? '',
        }),
      })
    );
  }

  removeCurrentUserFromGroup(
    groupId: string,
    user: ProfileUser
  ): Observable<void> {
    const ref = doc(this.firestore, 'groups', groupId);
    return from(
      updateDoc(ref, {
        users: arrayRemove({
          displayName: user.displayName ?? '',
          photoURL: user.photoURL ?? '',
        }),
        userIds: arrayRemove(user.uid),
      })
    ).pipe(
      switchMap(() => {
        if (user?.uid) {
          return this.updateGroupsList(user.uid).pipe(
            map(() => null) // output to null
          );
        }
        return of(null);
      })
    );
  }

  getGroupById(groupId: string): Observable<any> {
    const groupRef = doc(this.firestore, 'groups', groupId);

    return from(getDoc(groupRef)).pipe(
      map((docSnapshot) => {
        if (docSnapshot.exists()) {
          const group = { id: groupId, ...docSnapshot.data() };
          this.currentGroupSubject.next(group);
          return group;
        } else {
          return null;
        }
      })
    );
  }

  updateGroupName(groupId: string, newGroupName: string): Observable<void> {
    const ref = doc(this.firestore, 'groups', groupId);
    return from(
      updateDoc(ref, {
        groupName: newGroupName,
      })
    ).pipe(
      tap(() => {
        const currentGroup = this.currentGroupSubject.value;
        if (currentGroup) {
          this.currentGroupSubject.next({
            ...currentGroup,
            groupName: newGroupName,
          });
        }
      })
    );
  }

  deleteGroup(groupId: string): Observable<void> {
    const ref = doc(this.firestore, 'groups', groupId);
    return from(deleteDoc(ref)).pipe(
      switchMap(() => {
        return this.userSerivce.currentUserProfile$.pipe(
          take(1),
          switchMap((currentUser) => {
            if (currentUser?.uid) {
              return this.updateGroupsList(currentUser.uid).pipe(
                // output to null
                map(() => null)
              );
            }
            // return output
            return of(null);
          })
        );
      })
    );
  }
}
