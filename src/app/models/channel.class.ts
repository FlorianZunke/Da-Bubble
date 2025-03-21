import { User } from "./user.class";

export class Channel {
    user?: User = new User;
    messageTime: number = 0;
    messageContent: string = '';
    messageReaktions?: any;
}