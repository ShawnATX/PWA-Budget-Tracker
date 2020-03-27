let db;

const request = indexedDB.open("budget", 1);

request.onupgradeneeded = function (event) {
    // create object store called "pending" and set autoIncrement to true, this will allow us to store each transaction into local user storage when database is not accessable over the network
    db = event.target.result;
    const pendingStore = db.createObjectStore("pending", { autoIncrement: true });
};

request.onsuccess = function (event) {
    db = event.target.result;

    if (navigator.online) {
        checkDatabase();
    }

}

request.onerror = function (event) {
    console.log(request.error);
}

//checking current indexedDB records to sync to cloud DB
function checkDatabase() {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    const getAllPending = pendingStore.getAll();


    //if anything in indexedDB, send to cloud DB
    getAllPending.onsuccess = function () {
        if (getAllPending.result.length > 0) {
            fetch("/api/transaction/bulk", {
                method: "POST",
                body: JSON.stringify(getAllPending.result),
                headers: {
                    Accept: "application/json, text/plain, */*",
                    "Content-Type": "application/json"
                }
            })
                .then(response => response.json())
                //clear indexedDB now that data is in cloud
                .then(() => {
                    const transaction = db.transaction(["pending"], "readwrite");
                    const pendingStore = transaction.objectStore("pending");
                    pendingStore.clear();
                })
                .catch((err) => {
                    console.log(err);
                });
        }
    };
}

//add new transaction to local indexedDB storage, happens when cloud DB saving is unavailable
const saveRecord = (record) => {
    const transaction = db.transaction(["pending"], "readwrite");
    const pendingStore = transaction.objectStore("pending");
    pendingStore.add(record);
};

//listen for coming back online, then try to sync local to cloud
window.addEventListener("online", checkDatabase);