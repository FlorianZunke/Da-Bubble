export class User {
    id: number;
    name: string;
    email: string;
    password: string;
    picture: string;
    online: boolean; // online or offline
    status: boolean //active or inaktiv

    constructor (obj?: any) {
      this.id = obj.id;
      this.name = obj.name;
      this.email = obj.email;
      this.password = obj.password;
      this.picture = obj.picture;
      this.online = obj.online
      this.status= obj.status;
  }
}
