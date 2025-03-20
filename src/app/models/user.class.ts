export class User {
    id: number;
    name: string;
    email: string;
    password: string;
    picture: string;
    online: boolean; // online or offline
    status: boolean //active or inaktiv

    constructor (obj?: any) {
      this.id = obj? obj.id : 0;
      this.name = obj? obj.name : '';
      this.email = obj? obj.email : '';
      this.password = obj? obj.password : '';
      this.picture = obj? obj.picture : '';
      this.online = obj? obj.online : true;
      this.status= obj? obj.status : true
  }
}
