export default function PostMessageBridgeLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <script
        dangerouslySetInnerHTML={{
          __html: `
(function() {
  var bridge = window.__postMessageBridge = {
    port: null,
    queue: [],
    ready: false,
    observedOrigin: null
  };

  window.addEventListener("message", function handler(event) {
    var port = event.ports && event.ports[0];
    if (port) {
      bridge.port = port;
      bridge.ready = true;
      bridge.observedOrigin = event.origin;

      // Queue any initial message data
      if (event.data) {
        bridge.queue.push({ type: "initial", data: event.data, origin: event.origin, timestamp: Date.now() });
      }

      // Queue subsequent port messages until React takes over
      port.onmessage = function(e) {
        bridge.queue.push({ type: "port", data: e.data, origin: e.origin, timestamp: Date.now() });
      };

      // Remove this listener — React will handle window messages after hydration
      window.removeEventListener("message", handler);
    } else if (event.data) {
      // No port, queue as window message
      bridge.queue.push({ type: "window", data: event.data, origin: event.origin, timestamp: Date.now() });
    }
  });
})();
`,
        }}
      />
      {children}
    </>
  );
}
