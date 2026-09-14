export class User {
  static readonly ANONYMOUS = new User('', '', false, '');

  constructor(
    readonly name: string,
    readonly email: string,
    readonly can_change_logging_level: boolean,
    readonly current_logging_level: string,
  ) {
  }

  get isAuthenticated(): boolean {
    return !!this.name;
  }

}
