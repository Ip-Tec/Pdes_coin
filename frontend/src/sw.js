self.addEventListener("install", (event) => {
    console.log("Service Worker installing...");
    self.skipWaiting();
  });
  
  self.addEventListener("activate", (event) => {
    console.log("Service Worker activated SRC!");
  });
  
  // self.addEventListener("fetch", (event) => {
  //   console.log("Fetching:", event.request.url);
  // });
  