self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("Service Worker activated PUB!");
  });
  
  self.addEventListener("fetch", (event) => {
    // console.log("Fetching:", event.request.url);
  });
  