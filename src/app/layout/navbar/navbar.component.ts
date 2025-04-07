import {Component, effect, inject} from '@angular/core';
import {Oauth2AuthService} from '../../auth/oauth2-auth.service';
import {ConnectedUser} from '../../shared/model/user.model';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';
import {
  NgbActiveOffcanvas,
  NgbDropdown,
  NgbDropdownItem,
  NgbDropdownMenu,
  NgbDropdownToggle, NgbOffcanvas
} from '@ng-bootstrap/ng-bootstrap';
import {NewConversationComponent} from './new-conversation/new-conversation.component';

@Component({
  selector: 'wac-navbar',
  imports: [
    FaIconComponent,
    NgbDropdown,
    NgbDropdownMenu,
    NgbDropdownToggle,
    NgbDropdownItem
  ],
  templateUrl: './navbar.component.html',
  standalone: true,
  styleUrl: './navbar.component.scss'
})
export class NavbarComponent {

  oauth2Service = inject(Oauth2AuthService);
  connectedUser: ConnectedUser | undefined;
  offCanvasService = inject(NgbOffcanvas);

  constructor() {
    this.listenToFetchUser();
  }

  private listenToFetchUser(): void {
    effect(() => {
      const userState = this.oauth2Service.fetchUser();
      if (userState.status === "OK"
        && userState.value?.email
        && userState.value.email !== this.oauth2Service.notConnected) {
        this.connectedUser = userState.value
      }
    });
  }

  logout(): void {
    this.oauth2Service.logout()
  }

  editProfile(): void {
    this.oauth2Service.goToProfilePage();
  }

  openNewConversation() {
    this.offCanvasService.open(NewConversationComponent,{
      position: "start",
      container: "#main",
      panelClass: "offcanvas"
    });
  }
}
