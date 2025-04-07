import {inject, Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {catchError, debounce, distinctUntilChanged, Observable, of, Subject, switchMap, timer} from 'rxjs';
import {State} from '../../shared/model/state.model';
import {BaseUser} from '../../shared/model/user.model';
import {SearchQuery} from './new-conversation/model/user-search.model';
import {createPaginationOption} from '../../shared/model/request.model';
import {environment} from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class UserSearchService {

  http = inject(HttpClient)

  private searchQuery$ = new Subject<SearchQuery>();
  private searchResults$ = new Subject<State<Array<BaseUser>>>();
  searchResult = this.searchResults$.asObservable();

  constructor() {
    this.listenToSearch();
  }

  private listenToSearch(): void {
    this.searchQuery$.pipe(
      distinctUntilChanged(),
      debounce(() => timer(300)),
      switchMap(query => this.fetchResult(query).pipe(
        catchError(err => {
          this.searchResults$.next(State.Builder<Array<BaseUser>>().forError(err));
          return of([]);
        })
      ))
    ).subscribe({
      next: users => this.searchResults$.next(State.Builder<Array<BaseUser>>().forSuccess(users)),
      error: err => this.searchResults$.next(State.Builder<Array<BaseUser>>().forError(err))
    });
  }

  private fetchResult(searchQuery: SearchQuery): Observable<Array<BaseUser>> {
    let params = createPaginationOption(searchQuery.page)
    params = params.set("query", searchQuery.query);
    return this.http.get<Array<BaseUser>>(`${environment.API_URL}/users/search`, {params});
  }

  search(searchQuery: SearchQuery): void {
    this.searchQuery$.next(searchQuery);
  }
}

