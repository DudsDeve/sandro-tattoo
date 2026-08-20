export function mockUiStream(text: string) {
  const encoder = new TextEncoder();
  const id = `msg_${crypto.randomUUID()}`;
  const stream = new ReadableStream({
    start(controller) {
      const send = (payload: unknown) =>
        controller.enqueue(encoder.encode(`data: ${JSON.stringify(payload)}\n\n`));
      send({ type: "start" });
      send({ type: "text-start", id });
      const chunk = 24;
      for (let i = 0; i < text.length; i += chunk) {
        send({ type: "text-delta", id, delta: text.slice(i, i + chunk) });
      }
      send({ type: "text-end", id });
      send({ type: "finish" });
      controller.enqueue(encoder.encode("data: [DONE]\n\n"));
      controller.close();
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream; charset=utf-8",
      "Cache-Control": "no-cache, no-transform",
    },
  });
}
