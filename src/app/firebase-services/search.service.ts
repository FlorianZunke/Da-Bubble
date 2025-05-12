import { Injectable } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class SearchService {
  /**
   * Performs a full search on users, channels, and messages based on the input term.
   * @param term The search term provided by the user.
   * @param allUsers An array of all available user objects.
   * @param allChannels An array of all available channel objects.
   * @param allMessages An array of all available message objects.
   * @returns An object containing filtered users, channels, emails, and messages.
   */
  performFullSearch(
    term: string,
    allUsers: any[],
    allChannels: any[],
    allMessages: any[]
  ): {
    users: any[];
    channels: any[];
    emails: any[];
    messages: any[];
  } {
    const searchTerm = term.toLowerCase();

    if (!searchTerm) {
      return this.emptyResults();
    }

    if (searchTerm.startsWith('@')) {
      return this.searchForUsers(searchTerm, allUsers);
    }

    if (searchTerm.startsWith('#')) {
      return this.searchForChannels(searchTerm, allChannels);
    }

    if (searchTerm.length > 2) {
      const emails = this.searchForEmails(searchTerm, allUsers);
      const messages = this.searchForDirectMessages(searchTerm, allMessages);
      return {
        users: [],
        channels: [],
        emails,
        messages,
      };
    }

    return this.emptyResults();
  }

  /**
   * Searches for users whose names include the query (after "@").
   * @param term The search term (starting with "@").
   * @param users An array of user objects.
   * @returns An object containing the filtered users.
   */
  searchForUsers(term: string, users: any[]) {
    const query = term.substring(1);
    const filteredUsers =
      query.length > 0
        ? users.filter((user) => user?.name?.toLowerCase().includes(query))
        : users;

    return {
      users: filteredUsers,
      channels: [],
      emails: [],
      messages: [],
    };
  }

  /**
   * Searches for channels whose names include the query (after "#").
   * @param term The search term (starting with "#").
   * @param channels An array of channel objects.
   * @returns An object containing the filtered channels.
   */
  private searchForChannels(term: string, channels: any[]) {
    const query = term.substring(1);
    const filteredChannels =
      query.length > 0
        ? channels.filter((channel) =>
            channel?.channelName?.toLowerCase().includes(query)
          )
        : channels;

    return {
      users: [],
      channels: filteredChannels,
      emails: [],
      messages: [],
    };
  }

  /**
   * Searches for users whose email addresses include the given term.
   * @param term The search term.
   * @param users An array of user objects.
   * @returns An array of users whose emails match the term.
   */
  private searchForEmails(term: string, users: any[]): any[] {
    return users.filter((user) => user?.email?.toLowerCase().includes(term));
  }

   /**
   * Searches for direct messages that include the search term in text or sender name.
   * @param term The search term.
   * @param messages An array of message objects.
   * @returns An array of messages matching the term.
   */
  private searchForDirectMessages(term: string, messages: any[]): any[] {
    return messages.filter(
      (msg) =>
        msg?.text?.toLowerCase().includes(term) ||
        msg?.senderId?.name?.toLowerCase().includes(term)
    );
  }

  /**
   * Returns an empty result structure.
   * @returns An object with empty arrays for all result categories.
   */
  private emptyResults() {
    return {
      users: [],
      channels: [],
      emails: [],
      messages: [],
    };
  }
}
