import {ApexBuffer} from "@/apex/BufferHelper.ts";

export type ApexEvent =
    { event: "BufferCreated", buffers: ApexBuffer[] };


interface BaseModule {
    enableStateChange: (enabled: boolean) => void;
}

export interface EventModule extends BaseModule{
    onEvent: (event: ApexEvent) => void;
}



export interface PollingModule extends BaseModule{
    runUpdate(): void;


}