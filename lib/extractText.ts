import pdf from 'pdf-parse';

export async function extractTextFromFile(buffer: Buffer, mimeType: string): Promise<string> {
    if (mimeType === 'application/pdf') {
        const data = await pdf(buffer);
        return data.text;
    }

    if (mimeType.startsWith('text/') || mimeType === 'application/json') {
        return buffer.toString('utf-8');
    }

    // TODO: Add DOCX support if needed (e.g. using mammoth)

    throw new Error(`Unsupported file type: ${mimeType}`);
}
