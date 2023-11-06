import { Component, NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { ProfileComponent } from './components/profile/profile.component';
import { HomeComponent } from './components/home/home.component';
import { WelcomeComponent } from './components/sub-components/welcome/welcome.component';
import { AddGroupComponent } from './components/sub-components/group-add/add-group.component';
import { GroupComponent } from './components/sub-components/group/group.component';
const routes: Routes = [
  {
    path: 'home',
    component: HomeComponent,
  },
  {
    path: 'profile',
    component: ProfileComponent,
  },
  {
    path: 'welcome',
    component: WelcomeComponent,
  },
  {
    path: 'add-group',
    component: AddGroupComponent,
  },
  {
    path: 'group-settings/:groupId',
    component: GroupComponent,
  },
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule],
})
export class UserRoutingModule {}
