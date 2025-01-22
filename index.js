(function () {
  // Function to get cookie value by name
  function getCookie(name) {
    const value = `; ${document.cookie}`;
    const parts = value.split(`; ${name}=`);
    if (parts.length === 2) return parts.pop().split(";").shift();
    return null;
  }

  // Function to send event to Dub
  function sendToDub() {
    const pathname = window.location.pathname;
    const hostname = window.location.hostname;
    const eventName = `${pathname} | ${hostname}`;
    const clickId = getCookie("dub_id");

    if (!clickId) {
      console.warn("No dub_id found in cookies");
      return;
    }

    fetch("https://api.dub.co/track/lead", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: "Bearer <token>",
      },
      body: JSON.stringify({
        eventName,
        clickId,
        url: window.location.href,
        referrer: document.referrer,
      }),
    })
      .then((response) => {
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
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
