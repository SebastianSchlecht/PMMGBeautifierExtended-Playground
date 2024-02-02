declare namespace browser {
  namespace storage.local {
    function get(keys: string | string[]): Promise<ResultObject>;
    function set(keyValuePairs: { [key: string]: any }): Promise<void>;
    function remove(keys: string | string[]);
  }
  namespace runtime {
    function getURL(url: string): string
  }
  namespace runtime.onMessage {
    function addListener();
  }
  namespace tabs.onUpdated {
    function addListener();
  }
  namespace scripting {
    function executeScript();
  }
}

type ResultObject = { [p: string]: any }