let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function(event) {
    // create object store called "pending" and set autoIncrement to true, this will allow us to store each transaction into local user storage when database is not accessable over the network
    db = event.target.result;
    const pendingStore = db.createObjectStore("pending", {autoIncrement: true});
};



const saveRecord = (record) => {

};
