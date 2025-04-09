import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root'
})
export class SearchService {

  constructor() { }

  performSearch(
    term: string,
    allUsers: any[],
    allChannels: any[],
    allMessages: any[]
  ): {
    users: any[],
    channels: any[],
    emails: any[],
    messages: any[]
  } {
    const searchTerm = term.toLowerCase();
    let searchResultsUser: any[] = [];
    let searchResultsChannels: any[] = [];
    let searchResultsEmail: any[] = [];
    let searchResults: any[] = [];

    if (searchTerm.startsWith('@')) {
      searchResultsUser = allUsers;
      if (searchTerm.length > 1) {
        const query = searchTerm.substring(1);
        searchResultsUser = allUsers.filter((user) =>
          user?.name?.toLowerCase().includes(query)
        );
      }
    } else if (!searchTerm) {
      // Alles leer lassen
    } else if (searchTerm.startsWith('#')) {
      searchResultsChannels = allChannels;
      if (searchTerm.length > 1) {
        const query = searchTerm.substring(1);
        searchResultsChannels = allChannels.filter((channel) =>
          channel?.channelName?.toLowerCase().includes(query)
        );
      }
    } else if (searchTerm.length > 2) {
      searchResultsEmail = allUsers.filter((user) =>
        user?.email?.toLowerCase().includes(searchTerm)
      );
      searchResults = allMessages.filter(
        (msg) =>
          msg?.content?.toLowerCase().includes(searchTerm) ||
          msg?.user?.toLowerCase().includes(searchTerm)
      );
    }

    return {
      users: searchResultsUser,
      channels: searchResultsChannels,
      emails: searchResultsEmail,
      messages: searchResults
    };
  }

}
