import {Selector} from "../Selector.ts";


export class ApexObserver {

    private mutationObserver;

    constructor(onNewBuffers: (buffers: HTMLElement[]) => void) {
        const self = this;
        this.mutationObserver = new MutationObserver(mutations => {
            const newlyAddedBuffers: HTMLElement[] = [];

            for (const mutation of mutations) {
                const matches = self.findBuffers(mutation.addedNodes);
                newlyAddedBuffers.push(...matches);
            }

            if (newlyAddedBuffers.length > 0) {
                onNewBuffers(newlyAddedBuffers);
            }
        });
    }



    public initObserver(target:Node | undefined = undefined) {
        const targetOrBody = target || document.body;
        this.mutationObserver.observe(targetOrBody, { childList: true, subtree: true })
    }

    public shutdown() {
        this.mutationObserver.disconnect();
    }


    private findBuffers(nodes: NodeList): HTMLElement[] {
        if (nodes.length === 0) return [];


        const buffers: HTMLElement[] = []
        nodes.forEach(node => {
            const nodeXPath = document.evaluate(
                `.//div[@class='${Selector.BufferHeaderClass}'][starts-with(translate(., 'abcdefghijklmnopqrstuvwxyz', 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'), '')]/../..`,
                node,
                null,
                XPathResult.ANY_TYPE);

            let bufferNode: Node | null;
            while (bufferNode = nodeXPath.iterateNext()) {
                buffers.push(bufferNode as HTMLElement);
            }
        })

        return buffers
    }


}


// function test() {
//     const mutationOveserver = new MutationObserver(mutations => {
//         console.log(mutations);
//     })
//
//     mutationOveserver.observe(document.body, { childList: true, subtree: true });
//     setTimeout(() => mutationOveserver.disconnect(), 10000);
// }