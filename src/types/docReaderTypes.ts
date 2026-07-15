export interface PassportScanner {
    scan(image:ArrayBuffer):Promise<PassportData>
}

export interface PassportData {
    firstName: string,
    documentNumber: string,
    dateOfExpiry: string,
}