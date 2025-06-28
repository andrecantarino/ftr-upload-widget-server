import { fastifyCors } from "@fastify/cors";
import { fastify } from "fastify";
import { hasZodFastifySchemaValidationErrors, serializerCompiler, validatorCompiler } from 'fastify-type-provider-zod';
import { env } from "@/env";
import { uploadImageRoute } from "./routes/upload-image";

const server = fastify();

server.setValidatorCompiler(validatorCompiler);
server.setSerializerCompiler(serializerCompiler);

server.setErrorHandler((error, request, reply) => {
  if (hasZodFastifySchemaValidationErrors(error)) {
    reply.status(400).send({
      message: 'Validation error',
      issues: error.validation,
    });
  }

  // Enviar error para observabilidade
  console.error(error);
  reply.status(500).send({
    message: 'Internal server error',
    error: error.message,
  });
});

server.register(fastifyCors, { origin: "*" });
server.register(uploadImageRoute);

console.log(env.DATABASE_URL);

server.listen({ port: 3333, host: "0.0.0.0" }).then(() => {
  console.log("Server is running on port 3333");
});