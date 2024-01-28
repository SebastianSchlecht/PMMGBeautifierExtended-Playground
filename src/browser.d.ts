declare namespace browser {
  namespace storage.local {
    function get(keys: string | string[]): Promise<ResultObject>;
    function set(keyValuePairs: { [key: string]: any }): Promise<void>;
    function remove(keys: string | string[]);
  }
}

type ResultObject = { [p: string]: any }