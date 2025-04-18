import { Injectable } from "@angular/core";

@Injectable({
  providedIn: 'root',
})
export class SearchService {
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

  searchForUsers(term: string, users: any[]) {
    const query = term.substring(1);
    const filteredUsers =
      query.length > 0
        ? users.filter((user) =>
            user?.name?.toLowerCase().includes(query)
          )
        : users;

    return {
      users: filteredUsers,
      channels: [],
      emails: [],
      messages: [],
    };
  }

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

  // private searchForEmailsAndMessages(term: string, users: any[], messages: any[]) {
  //   const filteredEmails = users.filter((user) =>
  //     user?.email?.toLowerCase().includes(term)
  //   );

  //   const filteredMessages = messages.filter(
  //     (msg) =>
  //       msg?.content?.toLowerCase().includes(term) ||
  //       msg?.user?.toLowerCase().includes(term)
  //   );

  //   return {
  //     users: [],
  //     channels: [],
  //     emails: filteredEmails,
  //     messages: filteredMessages,
  //   };
  // }

  private searchForEmails(term: string, users: any[]): any[] {
    return users.filter((user) =>
      user?.email?.toLowerCase().includes(term)
    );
  }

  private searchForDirectMessages(term: string, messages: any[]): any[] {
    return messages.filter(
      (msg) =>
        msg?.text?.toLowerCase().includes(term) ||
        msg?.senderId.name?.toLowerCase().includes(term)
    );
  }

  private emptyResults() {
    return {
      users: [],
      channels: [],
      emails: [],
      messages: [],
    };
  }
}
