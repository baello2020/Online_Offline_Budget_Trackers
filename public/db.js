let db;
// Create a new db request for a "budget" database.
const request = indexedDB.open("budget", 1);

// Create object store called "pending" and autoIncrement to true.
request.onupgradeneeded = (e) => {
  const db = e.target.result;
  const pendingStore = db.createObjectStore("pending", {
    autoIncrement: true,
  });
};

request.onsuccess = (e) => {
  db = e.target.result;
  if (navigator.onLine) checkDatabase();
};

request.onerror = (e) => {
  console.log(e.target.errorCode);
};

const saveRecord = (record) => {
  // Create a transaction on the pending db with readwrite access.
  const transaction = db.transaction(["pending"], "readwrite");

  // Access your pending object store.
  const pendingStore = transaction.objectStore("pending");

  // Add record to your store with add method.
  pendingStore.add(record);
};

const checkDatabase = () => {
  // open a transaction on your pending db
  const transaction = db.transaction(["pending"], "readwrite");
  // access your pending object store
  const pendingStore = transaction.objectStore("pending");
  // get all records from store and set to a variable
  const getAll = pendingStore.getAll();

  getAll.onsuccess = async () => {
      if (getAll.result.length > 0) {
        const res = await fetch("/api/transaction/bulk", {
            method: "POST",
            body: JSON.stringify(getAll.result),
            headers: {
                Accept: "application/json, text/plain, */*",
                "Content-Type": "application/json"
            }
        });

        await res.json();

        // If successful, open a transaction on your pending db.
        const transaction = db.transaction(["pending"], "readwrite");

        // access your pending object store.
        const pendingStore = transaction.objectStore("pending");

        // Clear all items in your store.
        pendingStore.clear()
      };
  };
};

window.addEventListener("online", checkDatabase);
