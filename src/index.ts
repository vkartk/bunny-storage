import { readFile } from 'node:fs/promises';
import { basename } from 'node:path';
import { BunnyFile } from './types.js';

export class BunnyStorage {
    private baseUrl: string;
    private headers: HeadersInit;

    constructor(
        accessKey: string,
        storageZone: string,
        region: string = 'storage.bunnycdn.com'
    ) {
        this.baseUrl = `https://${region}/${storageZone}`;
        this.headers = { 'AccessKey': accessKey };
    }

    async listFiles(path: string = ''): Promise<BunnyFile[]> {
        // Ensure path starts without a slash and remove trailing slash
        const cleanPath = path.replace(/^\/+|\/+$/g, '');
        const url = cleanPath ? `${this.baseUrl}/${cleanPath}/` : `${this.baseUrl}/`;

        const response = await fetch(url, {
            headers: this.headers
        });

        if (!response.ok) {
            const errorText = await response.text();
            throw new Error(`Failed to list files: ${response.status} ${response.statusText}\nResponse: ${errorText}`);
        }

        return response.json();
    }

    async uploadFile(
        input: string | ArrayBuffer,
        remotePath: string = '',
        fileName?: string
    ): Promise<void> {
        let fileData: ArrayBuffer;
        let finalFileName: string;

        if (typeof input === 'string') {
            // If input is a file path
            fileData = await readFile(input);
            finalFileName = basename(input);
        } else {
            // If input is an ArrayBuffer
            fileData = input;
            if (!fileName) {
                throw new Error('fileName is required when uploading an ArrayBuffer');
            }
            finalFileName = fileName;
        }

        const fullPath = remotePath ? `${remotePath}/${finalFileName}` : finalFileName;

        const response = await fetch(`${this.baseUrl}/${fullPath}`, {
            method: 'PUT',
            headers: this.headers,
            body: fileData
        });

        if (!response.ok) {
            throw new Error(`Failed to upload file: ${response.statusText}`);
        }
    }

    async downloadFile(path: string): Promise<ArrayBuffer> {
        const response = await fetch(`${this.baseUrl}/${path}`, {
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Failed to download file: ${response.statusText}`);
        }

        return response.arrayBuffer();
    }

    async deleteFile(path: string): Promise<void> {
        const response = await fetch(`${this.baseUrl}/${path}`, {
            method: 'DELETE',
            headers: this.headers
        });

        if (!response.ok) {
            throw new Error(`Failed to delete file: ${response.statusText}`);
        }
    }
}

export type { BunnyFile } from './types.js';