import {Component, effect, inject, OnDestroy, OnInit} from '@angular/core';
import {ConversationService} from './conversation.service';
import {ToastService} from '../shared/toast/toast.service';
import {Oauth2AuthService} from '../auth/oauth2-auth.service';
import {Conversation, ConversationToCreate} from './model/conversation.model';
import {Subscription} from 'rxjs';
import {ConnectedUser} from '../shared/model/user.model';
import {ConversationComponent} from './conversation/conversation.component';
import {SseService} from '../messages/sse.service';

@Component({
  selector: 'wac-conversations',
  imports: [
    ConversationComponent
  ],
  templateUrl: './conversations.component.html',
  standalone: true,
  styleUrl: './conversations.component.scss'
})
export class ConversationsComponent implements OnInit, OnDestroy {

  conversationService = inject(ConversationService);
  toastService = inject(ToastService);
  oauth2Service = inject(Oauth2AuthService);
  sseService = inject(SseService);
  conversations = new Array<Conversation>();
  selectedConversation: Conversation | undefined;

  private createOrLoadConversation: Subscription | undefined;
  private createSub: Subscription | undefined;
  private getAllSub: Subscription | undefined;
  private getOneBuPublicIdSub: Subscription | undefined;
  private deleteSSESub: Subscription | undefined;

  connectedUser: ConnectedUser | undefined;

  constructor() {
    this.fetchConnectedUser();
  }

  private fetchConnectedUser() {
    effect(() => {
      let connectedUserState = this.oauth2Service.fetchUser();
      if (connectedUserState.status === "OK"
        && connectedUserState.value?.email !== this.oauth2Service.notConnected) {
        this.connectedUser = connectedUserState.value;
        this.conversationService.handleGetAll({
          page: 0,
          size: 20,
          sort: []
        });

      }
    });
  }

  ngOnInit(): void {
    this.listenToGetAllConversations();
    this.listenToGetOneByPublicId();
    this.listenToConversationCreated();
    this.listenToNavigateToConversation();
    this.listenToSSEDeleteConversation();
  }

  ngOnDestroy(): void {
    if (this.createOrLoadConversation) {
      this.createOrLoadConversation.unsubscribe();
    }

    if (this.createSub) {
      this.createSub.unsubscribe();
    }

    if (this.getAllSub) {
      this.getAllSub.unsubscribe();
    }

    if (this.getOneBuPublicIdSub) {
      this.getOneBuPublicIdSub.unsubscribe();
    }

    if (this.deleteSSESub) {
      this.deleteSSESub.unsubscribe();
    }

  }

  private listenToGetAllConversations() {
    this.getAllSub = this.conversationService.getAll
      .subscribe(conversationsState => {
        if (conversationsState.status === "OK" && conversationsState.value) {
          this.conversations = conversationsState.value;
        } else {
          this.toastService.show("Error occurred when when fetching conversations", "DANGER")
        }
      })
  }

  private listenToGetOneByPublicId() {
    this.getOneBuPublicIdSub = this.conversationService.getOneByPublicId
      .subscribe(conversationState => {
        if (conversationState.status === "OK" && conversationState.value) {
          this.conversations.push(conversationState.value);
        } else {
          this.toastService.show("Error occurred when when fetching conversation", "DANGER")
        }
      })
  }

  private listenToConversationCreated() {
    this.createSub = this.conversationService.create
      .subscribe(newConversationState => {
        if (newConversationState.status === "OK" && newConversationState.value) {
          this.conversations.push(newConversationState.value);
          this.conversationService.navigateToNewConversation(newConversationState.value);
        } else {
          this.toastService.show("Error occurred when when conversation creating", "DANGER")
        }
      })
  }

  private listenToNavigateToConversation() {
    this.createOrLoadConversation = this.conversationService.createOrLoadConversation
      .subscribe(userPublicId => {
        const existingConversation = this.conversations
          .find(conversation => conversation.members
            .findIndex(member => member.publicId === userPublicId) !== -1);

        if (existingConversation) {
          this.conversationService.navigateToNewConversation(existingConversation);
        } else {
          const newConversation: ConversationToCreate = {
            members: [userPublicId],
            name: "Default"
          }

          this.conversationService.handleCreate(newConversation);
        }
      })
  }

  private listenToSSEDeleteConversation(): void {
    this.deleteSSESub = this.sseService.deleteConversation.subscribe(uuidDeleted => {
      const indexToDelete = this.conversations.findIndex(conversation => conversation.publicId === uuidDeleted);
      this.conversations.splice(indexToDelete, 1);
      this.toastService.show("Conversation deleted by the user", "SUCCESS")
    })
  }

  onDeleteConversation(conversation: Conversation): void {
    this.conversationService.handleDelete(conversation.publicId);
  }

  onSelectConversation(conversation: Conversation): void {
    if (this.selectedConversation) {
      this.selectedConversation.active = false;
    }

    this.selectedConversation = conversation;
    this.selectedConversation.active = true;
    this.conversationService.navigateToNewConversation(conversation);
  }

}
