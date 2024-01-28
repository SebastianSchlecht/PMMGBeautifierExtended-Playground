import {ApexEvent, EventModule} from "./Modules.ts";

export class DummyModule implements EventModule {
    enableStateChange(_enabled: boolean): void {
        //Not in use
    }

    onEvent(event: ApexEvent): void {

        console.log("New Buffers", event.buffers.map((b)=>b.bufferCode));
    }

}