import { User } from "./user.class";


export class Channel {
    user: User;
    channelName: string;
    channelDescription: string;
    channelCreatedBy: string;

    constructor(obj?: any) {
        this.user = obj ? obj.user : new User;
        this.channelName = obj ? obj.channelName : '';
        this.channelDescription = obj ? obj.channelDescription : '';
        this.channelCreatedBy = obj ? obj.channelCreatedBy : '';
    }
}