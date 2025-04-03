import {Component, inject, OnInit} from '@angular/core';
import {
  NgbAccordionBody,
  NgbAccordionButton,
  NgbAccordionCollapse,
  NgbAccordionDirective,
  NgbAccordionHeader,
  NgbAccordionItem
} from '@ng-bootstrap/ng-bootstrap';
import {RouterOutlet} from '@angular/router';
import {FaIconComponent, FaIconLibrary} from '@fortawesome/angular-fontawesome';
import {fontAwesomeIcons} from './shared/font-awesome-icons';
import {Oauth2AuthService} from './auth/oauth2-auth.service';
import {NavbarComponent} from './layout/navbar/navbar.component';

@Component({
  selector: 'wac-root',
  templateUrl: './app.component.html',
  standalone: true,
  imports: [
    RouterOutlet,
    NgbAccordionDirective,
    NgbAccordionItem,
    NgbAccordionHeader,
    NgbAccordionButton,
    NgbAccordionCollapse,
    NgbAccordionBody,
    FaIconComponent,
    NavbarComponent
  ],
  styleUrl: './app.component.scss'
})
export class AppComponent implements OnInit {
  title = 'whatsapp-clone-front';
  private faIconLibrary = inject(FaIconLibrary)
  private oath2Service = inject(Oauth2AuthService)

  ngOnInit(): void {
    this.initFontAwesome();
    this.initAuthentication();
  }

  private initAuthentication(): void {
    this.oath2Service.initAuthentication()
  }

  private initFontAwesome() {
    this.faIconLibrary.addIcons(...fontAwesomeIcons)
  }
}
