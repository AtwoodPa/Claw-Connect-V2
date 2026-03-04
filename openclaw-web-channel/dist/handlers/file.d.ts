export declare function isUploadTypeAllowed(mimeType: string): boolean;
export declare function storeBase64File(params: {
    uploadsDir: string;
    fileName: string;
    mimeType: string;
    base64: string;
}): Promise<{
    filename: string;
    size: number;
}>;
