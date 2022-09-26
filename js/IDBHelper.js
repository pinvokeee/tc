class IDBHelper
{
    constructor()
    {
        this._state = 
        {
            db: null,

            transaction: 
            {
                instance: null,
                storeName: null,
            }
        }
    }

    // db: null,
    
    // transact:
    // {
    //     current: null,
    //     storeName: null,
    // },

    async open(name, upgradeExecute)
    {
        return new Promise((resolve, reject) =>
        {
            const req = indexedDB.open(name, 4);

            req.onupgradeneeded = (e) =>
            {
                this._state.db = req.result;
                upgradeExecute();
                console.log("UPGRADE:", this._state);
            }

            req.onsuccess = (e) =>
            {
                this._state.db = req.result;
                resolve(this._state);
                console.log("OPEND:", this._state);
            }
        });
    }

    createStore(storeName)
    {
        if (!this._state.objectStoreNames.contains(storeName))
        {
            this._state.createObjectStore(storeName);
            console.log("CREATESTORE:", storeName);
        }
    }

    transaction(storeName, execute, accessMode="readwrite")
    {
        this._state.transaction = 
        {
            storeName: storeName,
            instance:  this._state.db.transaction(storeName, accessMode),
        }

        this._state.transaction.instance.oncomplete = () =>
        {
            this._state.transaction = null;
            console.log("COMPLETED");
        }

        execute(this);

        return this;
    }

    async putObject(key, obj)
    {
        return new Promise((resolve, reject) =>
        {
            const trans = this._state.transaction;
            const req = trans.instance.objectStore(trans.storeName).put(obj, key);

            req.onsuccess = (e) =>
            {
                // console.log(this._state.transaction.instance, e, req);
                resolve(e);
            }
        });
    }

    async get(key)
    {
        return new Promise((resolve, reject) =>
        {
            const trans = this._state.transaction;
            const req = trans.instance.objectStore(trans.storeName).get(key);

            req.onsuccess = (e) =>
            {
                resolve({ result: req.result, event: e });
            }
        });
    }
}