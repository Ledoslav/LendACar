export function MapQuestionTextToKey(id:number):string {
  switch (id) {
    case 1:
      return 'PROFILE.ACCOUNT_SECURITY.QUESTION1';
    case 2:
      return 'PROFILE.ACCOUNT_SECURITY.QUESTION2';
    case 3:
      return 'PROFILE.ACCOUNT_SECURITY.QUESTION3';
    case 4:
      return 'PROFILE.ACCOUNT_SECURITY.QUESTION4';
    case 5:
      return 'PROFILE.ACCOUNT_SECURITY.QUESTION5';
    case 6:
      return 'PROFILE.ACCOUNT_SECURITY.QUESTION6';
    case 7:
      return 'PROFILE.ACCOUNT_SECURITY.QUESTION7';
    case 8:
      return 'PROFILE.ACCOUNT_SECURITY.QUESTION8';
    default:
      return "error";
  }
}
