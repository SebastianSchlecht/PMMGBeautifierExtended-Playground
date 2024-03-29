import {
    Contract,
    FactionContract,
    FactionContractSchema,
    PlayerContract,
    PlayerContractSchema
} from "../sharedModels.ts";
import {parse} from "valibot";

const USED_MESSAGE_TYPES: { [p: string]: ((payload: unknown) => boolean) | undefined } = {
    "CONTRACTS_CONTRACT": processContractPayload,
    //Unpacking function
    "ACTION_COMPLETED": processActionCompleted,
    //Response Actions inside "ACTION_COMPLETED"
    "CONTRACTS_CONTRACTS": processContractsPayload,
}

const receivedMsgTypes: Set<String> = new Set();


export function processMessage (eventData: string) {
    const regEx = /^\d*\s*(?<jsonPayload>\[\s*"event".*]\s*)/m; //We need to strip leading numbers
    const matchedData = eventData.match(regEx);
    if (matchedData === null || !matchedData.groups || !matchedData.groups["jsonPayload"]) {
        console.log("Could not validate eventData", eventData);
        return;
    }

    const parsedData = JSON.parse(matchedData.groups["jsonPayload"])[1]; // ['event', { messageType: 'CONTRACTS_CONTRACT', payload: {}}]
    processJsonMessage(parsedData);
}

function processJsonMessage(parsedData: { [p: string]: any }): boolean {
    if ("messageType" in parsedData && "payload" in parsedData) {
        const messageType: string = parsedData["messageType"];
        const payload = parsedData["payload"];

        let success: boolean | null;
        try {
            success = USED_MESSAGE_TYPES[messageType]?.(payload) ?? null;
        } catch (e) {
            success = false;
        }

        if (!receivedMsgTypes.has(messageType)) {
            receivedMsgTypes.add(messageType);
            console.log("Received new msg type", messageType, "will only log once");
        }


        if (success === false) { //Can be null if no parser is defined
            console.warn("Could not parse message", parsedData)
        } else if (success === null) {
            //console.log("Received unknown message type", parsedData["messageType"])
        }

        return success ?? false;
    } else {
        console.log("Received json object is invalid");
        return false;
    }
}

// ############# One function for every event type
function processContractPayload(payload: any): boolean {
    //const payload = {"id":"8da01fc52d8a46adf623d464992e782d","localId":"6RM7QM1","date":{"timestamp":1706841326196},"party":"CUSTOMER","partner":{"agentId":"f171f88f903cd64dc94124783b219359","countryId":"4a2fe1ae3e1ca07dcfebbdf25c4b8d6a","countryCode":"IC","type":"INFRASTRUCTURE","name":"Insitor Infrastructure Officer","_type":"country-agent","_proxy_key":"f171f88f903cd64dc94124783b219359"},"status":"REJECTED","conditions":[{"type":"REPAIR_SHIP","id":"3aef36ca6942732630de1225984f12ba","party":"CUSTOMER","index":0,"status":"PENDING","dependencies":[],"deadlineDuration":{"millis":172800000},"deadline":null},{"amount":{"amount":860.5,"currency":"ICA"},"type":"PAYMENT","id":"878a1f1d90886c5483b641c993debe31","party":"PROVIDER","index":1,"status":"PENDING","dependencies":["3aef36ca6942732630de1225984f12ba"],"deadlineDuration":{"millis":86400000},"deadline":null},{"quantity":{"material":{"name":"stlFuel","id":"7756a0779efe67f0f293f41eda4944d4","ticker":"SF","category":"ba98fa0cf77040a96cd8a608ad0d08e9","weight":0.06,"volume":0.06,"resource":false},"amount":129},"pickedUp":{"material":{"name":"stlFuel","id":"7756a0779efe67f0f293f41eda4944d4","ticker":"SF","category":"ba98fa0cf77040a96cd8a608ad0d08e9","weight":0.06,"volume":0.06,"resource":false},"amount":0},"address":{"lines":[{"entity":{"id":"f2f57766ebaca9d69efae41ccf4d8853","naturalId":"VH-331","name":"Hortus","_type":"system","_proxy_key":"f2f57766ebaca9d69efae41ccf4d8853"},"type":"SYSTEM"},{"entity":{"id":"99eb57fefd18101662bf834cbeea34ed","naturalId":"VH-331a","name":"Promitor","_type":"planet","_proxy_key":"99eb57fefd18101662bf834cbeea34ed"},"type":"PLANET"}]},"type":"COMEX_PURCHASE_PICKUP","id":"e03037c570fc4505db2e9fdb3481a48d","party":"CUSTOMER","index":2,"status":"PENDING","dependencies":["3aef36ca6942732630de1225984f12ba"],"deadlineDuration":{"millis":604800000},"deadline":null},{"countryId":"4a2fe1ae3e1ca07dcfebbdf25c4b8d6a","reputationChange":3,"type":"REPUTATION","id":"bceff96dad8aeaddcade877c51cb4ae5","party":"PROVIDER","index":3,"status":"PENDING","dependencies":["3aef36ca6942732630de1225984f12ba"],"deadlineDuration":{"millis":86400000},"deadline":null}],"extensionDeadline":null,"canExtend":false,"canRequestTermination":false,"dueDate":null,"name":null,"preamble":"preamble","terminationSent":false,"terminationReceived":false,"agentContract":true,"relatedContracts":["2901b01eecc277862b6e0f925322e534","0bc9dae213e14b6a402e46baac50216f","8da01fc52d8a46adf623d464992e782d"],"contractType":"MAINTENANCE"};
    //const payload3 = {"id":"d58c196230e74a31925c325e521a08d6","localId":"8L1QHN4","date":{"timestamp":1706898798539},"party":"PROVIDER","partner":{"id":"84274e2296ac14d7e4a4ade9a796643e","name":"Rankin Operations Group","code":"ROG","_type":"company","_proxy_key":"84274e2296ac14d7e4a4ade9a796643e"},"status":"PARTIALLY_FULFILLED","conditions":[{"address":{"lines":[{"entity":{"id":"f2f57766ebaca9d69efae41ccf4d8853","naturalId":"VH-331","name":"Hortus","_type":"system","_proxy_key":"f2f57766ebaca9d69efae41ccf4d8853"},"type":"SYSTEM"},{"entity":{"id":"0deca369a92788b8079e7ac245be66f7","naturalId":"HRT","name":"Hortus Station","_type":"station","_proxy_key":"0deca369a92788b8079e7ac245be66f7"},"type":"STATION"}]},"quantity":null,"weight":58.3,"volume":53,"blockId":null,"type":"PROVISION_SHIPMENT","id":"b4cf49925c628308e2e8b2ec357421d5","party":"CUSTOMER","index":0,"status":"FULFILLED","dependencies":[],"deadlineDuration":{"millis":172800000},"deadline":null},{"amount":{"amount":1200,"currency":"ICA"},"type":"PAYMENT","id":"7207fd26a515251ecd29c3fc43e04fa7","party":"CUSTOMER","index":1,"status":"PENDING","dependencies":["b4cf49925c628308e2e8b2ec357421d5"],"deadlineDuration":{"millis":172800000},"deadline":{"timestamp":1707071598615}},{"address":{"lines":[{"entity":{"id":"f2f57766ebaca9d69efae41ccf4d8853","naturalId":"VH-331","name":"Hortus","_type":"system","_proxy_key":"f2f57766ebaca9d69efae41ccf4d8853"},"type":"SYSTEM"},{"entity":{"id":"0deca369a92788b8079e7ac245be66f7","naturalId":"HRT","name":"Hortus Station","_type":"station","_proxy_key":"0deca369a92788b8079e7ac245be66f7"},"type":"STATION"}]},"quantity":null,"weight":58.3,"volume":53,"type":"PICKUP_SHIPMENT","id":"f9b253cc497d97f38cf392f224a6df1c","party":"PROVIDER","index":2,"status":"FULFILLED","dependencies":["b4cf49925c628308e2e8b2ec357421d5"],"deadlineDuration":{"millis":172800000},"deadline":null},{"destination":{"lines":[{"entity":{"id":"8ecf9670ba070d78cfb5537e8d9f1b6c","naturalId":"ZV-307","name":"Antares I","_type":"system","_proxy_key":"8ecf9670ba070d78cfb5537e8d9f1b6c"},"type":"SYSTEM"},{"entity":{"id":"1deca369a92788b8079e7ac245be66f7","naturalId":"ANT","name":"Antares Station","_type":"station","_proxy_key":"1deca369a92788b8079e7ac245be66f7"},"type":"STATION"}]},"shipmentItemId":"f9b253cc497d97f38cf392f224a6df1c","type":"DELIVERY_SHIPMENT","id":"da508501e99dc35be3062420a7781ec8","party":"PROVIDER","index":3,"status":"PENDING","dependencies":["f9b253cc497d97f38cf392f224a6df1c"],"deadlineDuration":{"millis":172800000},"deadline":{"timestamp":1707071635206}}],"extensionDeadline":null,"canExtend":false,"canRequestTermination":true,"dueDate":{"timestamp":1707071598615},"name":null,"preamble":null,"terminationSent":false,"terminationReceived":false,"agentContract":false,"relatedContracts":[],"contractType":null};

    const contract = parseSingleContract(payload);
    console.log("Parsed contract data", contract);
    return true;
}

function processContractsPayload(payload: any): boolean {
    const contracts: any[] = payload["contracts"]

    const parsedContracts = contracts.map((p) => parseSingleContract(p));
    console.log("Parsed contract data", parsedContracts);
    return true;
}

function parseSingleContract(payload: any): Contract {
    const contractID: string = payload["id"];
    const localContractId: string = payload["localId"];
    const partner: string = payload["partner"]["name"];
    const partnerCode: string | undefined = payload["partner"]["code"]
    const nextDeadline = Math.min(...payload.conditions.filter((c: any) => c.status === "PENDING" && !!c.deadline && !!c.deadline.timestamp).map((c: any) => c?.deadline?.timestamp ?? 0))
    const isFactionContract = partnerCode === undefined;

    let contract: Contract;
    if (isFactionContract) {
        const obj: FactionContract = {
            type: "FC",
            id: contractID,
            localId: localContractId,
            partner: partner,
            deadline: nextDeadline,
        };
        contract = parse(FactionContractSchema, obj);
    } else {
        const obj: PlayerContract = {
            type: "PC",
            id: contractID,
            localId: localContractId,
            partner: partner,
            partnerCode: partnerCode,
            deadline: nextDeadline,
        }
        contract = parse(PlayerContractSchema, obj);
    }

    return contract;
}

function processActionCompleted(payload: any): boolean {
    return processJsonMessage(payload.message);
}



/* Captured message
42["event",{"messageType":"CONTRACTS_CONTRACT","payload":{"id":"8da01fc52d8a46adf623d464992e782d","localId":"6RM7QM1","date":{"timestamp":1706841326196},"party":"CUSTOMER","partner":{"agentId":"f171f88f903cd64dc94124783b219359","countryId":"4a2fe1ae3e1ca07dcfebbdf25c4b8d6a","countryCode":"IC","type":"INFRASTRUCTURE","name":"Insitor Infrastructure Officer","_type":"country-agent","_proxy_key":"f171f88f903cd64dc94124783b219359"},"status":"REJECTED","conditions":[{"type":"REPAIR_SHIP","id":"3aef36ca6942732630de1225984f12ba","party":"CUSTOMER","index":0,"status":"PENDING","dependencies":[],"deadlineDuration":{"millis":172800000},"deadline":null},{"amount":{"amount":860.5,"currency":"ICA"},"type":"PAYMENT","id":"878a1f1d90886c5483b641c993debe31","party":"PROVIDER","index":1,"status":"PENDING","dependencies":["3aef36ca6942732630de1225984f12ba"],"deadlineDuration":{"millis":86400000},"deadline":null},{"quantity":{"material":{"name":"stlFuel","id":"7756a0779efe67f0f293f41eda4944d4","ticker":"SF","category":"ba98fa0cf77040a96cd8a608ad0d08e9","weight":0.06,"volume":0.06,"resource":false},"amount":129},"pickedUp":{"material":{"name":"stlFuel","id":"7756a0779efe67f0f293f41eda4944d4","ticker":"SF","category":"ba98fa0cf77040a96cd8a608ad0d08e9","weight":0.06,"volume":0.06,"resource":false},"amount":0},"address":{"lines":[{"entity":{"id":"f2f57766ebaca9d69efae41ccf4d8853","naturalId":"VH-331","name":"Hortus","_type":"system","_proxy_key":"f2f57766ebaca9d69efae41ccf4d8853"},"type":"SYSTEM"},{"entity":{"id":"99eb57fefd18101662bf834cbeea34ed","naturalId":"VH-331a","name":"Promitor","_type":"planet","_proxy_key":"99eb57fefd18101662bf834cbeea34ed"},"type":"PLANET"}]},"type":"COMEX_PURCHASE_PICKUP","id":"e03037c570fc4505db2e9fdb3481a48d","party":"CUSTOMER","index":2,"status":"PENDING","dependencies":["3aef36ca6942732630de1225984f12ba"],"deadlineDuration":{"millis":604800000},"deadline":null},{"countryId":"4a2fe1ae3e1ca07dcfebbdf25c4b8d6a","reputationChange":3,"type":"REPUTATION","id":"bceff96dad8aeaddcade877c51cb4ae5","party":"PROVIDER","index":3,"status":"PENDING","dependencies":["3aef36ca6942732630de1225984f12ba"],"deadlineDuration":{"millis":86400000},"deadline":null}],"extensionDeadline":null,"canExtend":false,"canRequestTermination":false,"dueDate":null,"name":null,"preamble":"preamble","terminationSent":false,"terminationReceived":false,"agentContract":true,"relatedContracts":["2901b01eecc277862b6e0f925322e534","0bc9dae213e14b6a402e46baac50216f","8da01fc52d8a46adf623d464992e782d"],"contractType":"MAINTENANCE"}}]
42["event",{"messageType":"CONTRACTS_CONTRACT","payload":{"id":"d58c196230e74a31925c325e521a08d6","localId":"8L1QHN4","date":{"timestamp":1706898798539},"party":"PROVIDER","partner":{"id":"84274e2296ac14d7e4a4ade9a796643e","name":"Rankin Operations Group","code":"ROG","_type":"company","_proxy_key":"84274e2296ac14d7e4a4ade9a796643e"},"status":"PARTIALLY_FULFILLED","conditions":[{"address":{"lines":[{"entity":{"id":"f2f57766ebaca9d69efae41ccf4d8853","naturalId":"VH-331","name":"Hortus","_type":"system","_proxy_key":"f2f57766ebaca9d69efae41ccf4d8853"},"type":"SYSTEM"},{"entity":{"id":"0deca369a92788b8079e7ac245be66f7","naturalId":"HRT","name":"Hortus Station","_type":"station","_proxy_key":"0deca369a92788b8079e7ac245be66f7"},"type":"STATION"}]},"quantity":null,"weight":58.3,"volume":53,"blockId":null,"type":"PROVISION_SHIPMENT","id":"b4cf49925c628308e2e8b2ec357421d5","party":"CUSTOMER","index":0,"status":"FULFILLED","dependencies":[],"deadlineDuration":{"millis":172800000},"deadline":null},{"amount":{"amount":1200,"currency":"ICA"},"type":"PAYMENT","id":"7207fd26a515251ecd29c3fc43e04fa7","party":"CUSTOMER","index":1,"status":"PENDING","dependencies":["b4cf49925c628308e2e8b2ec357421d5"],"deadlineDuration":{"millis":172800000},"deadline":{"timestamp":1707071598615}},{"address":{"lines":[{"entity":{"id":"f2f57766ebaca9d69efae41ccf4d8853","naturalId":"VH-331","name":"Hortus","_type":"system","_proxy_key":"f2f57766ebaca9d69efae41ccf4d8853"},"type":"SYSTEM"},{"entity":{"id":"0deca369a92788b8079e7ac245be66f7","naturalId":"HRT","name":"Hortus Station","_type":"station","_proxy_key":"0deca369a92788b8079e7ac245be66f7"},"type":"STATION"}]},"quantity":null,"weight":58.3,"volume":53,"type":"PICKUP_SHIPMENT","id":"f9b253cc497d97f38cf392f224a6df1c","party":"PROVIDER","index":2,"status":"FULFILLED","dependencies":["b4cf49925c628308e2e8b2ec357421d5"],"deadlineDuration":{"millis":172800000},"deadline":null},{"destination":{"lines":[{"entity":{"id":"8ecf9670ba070d78cfb5537e8d9f1b6c","naturalId":"ZV-307","name":"Antares I","_type":"system","_proxy_key":"8ecf9670ba070d78cfb5537e8d9f1b6c"},"type":"SYSTEM"},{"entity":{"id":"1deca369a92788b8079e7ac245be66f7","naturalId":"ANT","name":"Antares Station","_type":"station","_proxy_key":"1deca369a92788b8079e7ac245be66f7"},"type":"STATION"}]},"shipmentItemId":"f9b253cc497d97f38cf392f224a6df1c","type":"DELIVERY_SHIPMENT","id":"da508501e99dc35be3062420a7781ec8","party":"PROVIDER","index":3,"status":"PENDING","dependencies":["f9b253cc497d97f38cf392f224a6df1c"],"deadlineDuration":{"millis":172800000},"deadline":{"timestamp":1707071635206}}],"extensionDeadline":null,"canExtend":false,"canRequestTermination":true,"dueDate":{"timestamp":1707071598615},"name":null,"preamble":null,"terminationSent":false,"terminationReceived":false,"agentContract":false,"relatedContracts":[],"contractType":null}}]




*/