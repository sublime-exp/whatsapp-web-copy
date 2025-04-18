import {Component, EventEmitter, input, Output} from '@angular/core';
import {FaIconComponent} from '@fortawesome/angular-fontawesome';

@Component({
  selector: 'wac-conversation-selector',
  imports: [
    FaIconComponent
  ],
  templateUrl: './conversation-selector.component.html',
  standalone: true,
  styleUrl: './conversation-selector.component.scss'
})
export class ConversationSelectorComponent {

  title = input.required<string>();
  subtitle = input.required<string>();
  pictureUrl = input.required<string>();

  @Output()
  select = new EventEmitter<void>();

  onClick(): void {
    this.select.next();
  }

}
