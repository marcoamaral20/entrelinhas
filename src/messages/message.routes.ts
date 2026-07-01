import type { FastifyInstance } from "fastify";

import type { MessageRepository } from "./message.types";
import { incomingMessageSchema } from "./message.validation";

type MessageRouteDependencies = {
  messageRepository: MessageRepository;
};

export async function registerMessageRoutes(
  app: FastifyInstance,
  dependencies: MessageRouteDependencies,
) {
  app.post("/webhooks/messages", async (request, reply) => {
    const payload = incomingMessageSchema.safeParse(request.body);

    if (!payload.success) {
      return reply.status(400).send({
        error: "invalid_payload",
        message: "Incoming message payload is invalid.",
      });
    }

    const result = await dependencies.messageRepository.createAccepted(payload.data);

    return reply.status(201).send(result);
  });

  app.get("/messages", async () => {
    const messages = await dependencies.messageRepository.list();

    return { messages };
  });

  app.get<{ Params: { id: string } }>("/messages/:id", async (request, reply) => {
    const message = await dependencies.messageRepository.findById(request.params.id);

    if (!message) {
      return reply.status(404).send({
        error: "not_found",
        message: "Raw message was not found.",
      });
    }

    return { message };
  });
}
