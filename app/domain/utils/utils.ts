export class Utils {
  static isNotNull = (data: any): boolean => (data !== undefined && data !== null ? true : false);

  static isNull = (data: any): boolean => (data === undefined || data === null ? true : false);

  static isEmpty = (value: string): boolean => value.trim().length === 0;

  static dateFromObjectId = (objectId: string): Date =>
    new Date(parseInt(objectId.substring(0, 8), 16) * 1000);

  static abs = (val: number): number => (val < 0 ? -val : val);

  static isValidDate = (date: any): boolean => isNaN(new Date(date).getTime());

  static formatDateToYmdHms = (date: Date): string => {
    const year = date.getFullYear().toString();
    const month = (date.getMonth() + 1).toString().padStart(2, '0');
    const day = date.getDate().toString().padStart(2, '0');
    const hours = date.getHours().toString().padStart(2, '0');
    const minutes = date.getMinutes().toString().padStart(2, '0');
    const seconds = date.getSeconds().toString().padStart(2, '0');
    return `${year}-${month}-${day} ${hours}:${minutes}:${seconds}`;
  };  
}
