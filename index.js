(function () {
  // Function to get cookie value by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // Function to get IP address
  async function getIPAddress() {
    try {
      const response = await fetch("https://api.ipify.org?format=json");
      const data = await response.json();
      return data.ip;
    } catch (error) {
      console.error("Failed to get IP address:", error);
      return null;
    }
  }

  // Function to send event to Dub
  async function sendToDub() {
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    const eventName = `${pathname} | ${hostname}`;

    // Check last request time from localStorage
    const lastRequestKey = `dub_last_request_${pathname}`;
    const lastRequest = localStorage.getItem(lastRequestKey);
    const now = Date.now();

    // If there was a request in the last 10 minutes, skip
    if (lastRequest && now - parseInt(lastRequest) < 10 * 60 * 1000) {
      console.log("Skipping Dub event - rate limited");
      return;
    }

    const clickId = getCookie("dub_id");
    const externalId = await getIPAddress();

    if (!clickId) {
      console.warn("No dub_id found in cookies");
      return;
    }

    fetch("https://staging-gateway.getwildfire.gg/v2/links/dub-link", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      mode: "no-cors",
      body: JSON.stringify({
        eventName,
        clickId,
        externalId,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
        // Store the timestamp of successful request
        console.log("Successfully sent event to Dub");
        localStorage.setItem(lastRequestKey, now.toString());
      })
      .catch((error) => {
        console.error("Failed to send event to Dub:", error);
      });
  }

  // Send event when page loads
  if (document.readyState === "complete") {
    sendToDub();
  } else {
    window.addEventListener("load", sendToDub);
  }
})();
