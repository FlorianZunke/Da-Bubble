import { User } from "./user.class";

export class Channel {
    user?: User = new User;
    messageTime: any = '';
    channelName: string = '';
    messageReaktions?: any;
}