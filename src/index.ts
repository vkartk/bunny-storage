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

    async uploadFile(filePath: string, remotePath: string = ''): Promise<void> {
        const fileName = basename(filePath);
        const fullPath = remotePath ? `${remotePath}/${fileName}` : fileName;

        const fileData = await readFile(filePath);
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