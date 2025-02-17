export interface PasswordReset {
  emailAddress: string;
  currentPassword?: string;
  newPassword: string;
  userType?:string;
  resetToken:string|null;
}
