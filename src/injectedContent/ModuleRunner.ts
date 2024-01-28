import {ApexEvent, EventModule, PollingModule} from "./modules/Modules.ts";
import Preferences from "./models/Preferences.ts";
import {ApexObserver} from "./ApexObserver.ts";
import {toApexBuffer} from "./apexHelper/BufferHelper.ts";


interface ModuleEntry<T extends EventModule | PollingModule> {
    module: T,
    enabled: boolean,
}



export class ModuleRunner {
    private eventModules: ModuleEntry<EventModule>[];
    private pollingModules: ModuleEntry<PollingModule>[];
    private apexObserver: ApexObserver;

    constructor(preferences: Preferences, modules: (EventModule | PollingModule)[]) {
        this.pollingModules = modules.filter(isPollingModule)
            .map(module => toModuleEntry(preferences, module));
        this.eventModules = modules.filter(isEventModule)
            .map((module) => toModuleEntry(preferences, <EventModule>module));

        this.apexObserver = new ApexObserver(this.onNewBuffer.bind(this));
    }


    run() {
        this.apexObserver.initObserver();

        this.baseLoop().then();
    }

    private onNewBuffer(buffers: HTMLElement[]) {
        const apexBuffers = toApexBuffer(buffers);
        if (apexBuffers.length !== buffers.length) {
            console.warn("Couldn't map from buffer dom item");
        }
        if (apexBuffers.length > 0) {

            const apexEvent: ApexEvent = {
                event: "BufferCreated",
                buffers: apexBuffers,
            };


            this.eventModules.forEach((entry) => {
                if (!entry.enabled) return;
                entry.module.onEvent(apexEvent)
            })
        }
    }

    private async baseLoop() {


        setTimeout(() => this.baseLoop().then(), 1000);
    }

}



function isPollingModule(module: EventModule | PollingModule): module is PollingModule {
    return (<PollingModule>module).runUpdate !== undefined;
}

function isEventModule(module: EventModule | PollingModule): module is EventModule {
    return (<EventModule>module).onEvent !== undefined;
}

function toModuleEntry<T extends EventModule | PollingModule>(preference: Preferences, module: T): ModuleEntry<T> {
    const moduleName = module.constructor.name;
    const enabled = preference.PMMGExtended?.disabled?.indexOf(moduleName) === -1;

    return {
        module,
        enabled,
    }
}