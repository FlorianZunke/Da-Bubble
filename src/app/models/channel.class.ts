import { User } from "./user.class";


export class Channel {
    id: number;
    user: User;
    messageTime: any;
    channelName: string;
    messageReaktions: any;

    constructor(obj?: any) {
        this.id = obj ? obj.id : '';
        this.user = obj ? obj.user : new User;
        this.messageTime = obj ? obj.messageTime : '';
        this.channelName = obj ? obj.channelName : '';
        this.messageReaktions = obj ? obj.messageReaktions : '';
    }
}