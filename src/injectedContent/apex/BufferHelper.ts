import {Selector} from "../Selector.ts";

export interface ApexBuffer {
    bufferCode: string;
    bufferRef: HTMLElement;
}


export function toApexBuffer(buffers: HTMLElement[]): ApexBuffer[] {
    const apexBuffers: ApexBuffer[] = [];
    buffers.forEach((buffer) => {
        const headerElement = buffer.querySelector(Selector.BufferHeader);
        if (!headerElement) return;

        const bufferCode = headerElement.textContent;
        if (bufferCode == null) return;

        apexBuffers.push({
            bufferCode,
            bufferRef: buffer,
        })
    })


    return apexBuffers;
}

