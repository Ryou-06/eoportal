export class Users {
    public id: number;
    public fullname: string;
    public pwd: string;
    public email: string;
    public birthday: string;
    public department: string;


    constructor(id: number, fullname: string, pwd: string, email: string, birthday: string, department: string) {
        this.id = id;
        this.fullname = fullname;
        this.pwd = pwd;
        this.email = email;
        this.birthday = birthday;
        this.department = department;
    }

    // You can add additional methods if necessary, for example:
    public displayUser(): string {
        return `User ID: ${this.id}, Fullname: ${this.fullname}, Email: ${this.email}`;
    }
}
