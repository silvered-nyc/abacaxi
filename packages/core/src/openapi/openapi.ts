import { Abacaxi } from "../interface/api/api";
import {
  OpenAPIRegistry,
  OpenAPIGenerator,
  extendZodWithOpenApi,
} from "@asteasolutions/zod-to-openapi";
import { PathItemObject } from "openapi3-ts";
import { z } from "zod";

export const CreateOpenApi = (api: Abacaxi, zod: typeof z) => {
  extendZodWithOpenApi(z);
  const registry = new OpenAPIRegistry();
  Object.keys(api.paths).forEach((path) => {
    const pathObj = api.paths[path];
    const ItemObject: PathItemObject = {};
    Object.entries(pathObj).forEach(([method, operation]) => {
      const method1 = method.replace(/^\//, "");
      const path1 = path.replace(/^\//, "");
      const bodySchema = registry.register(
        `method-${method1.replace("g/", "")}-path-${path1.replace(
          "g/",
          ""
        )}-body-${operation((e) => e.name)}`,
        operation((e) => e.bodyT)
      );
      const responses = operation((e) => {
        return [e.defaultResponseT, ...e.otherResponsesT].reduce((pv, e, i) => {
          const schema = registry.register(
            `response-${method1.replace("g/", "")}-path-${path1.replace(
              "g/",
              ""
            )}-body-${operation((e) => e.name)}-${e.status}`,
            e.response
          );
          //@ts-ignore
          pv[e.status] = {
            content: {
              [e.contentType]: {
                schema,
              },
            },
          };
          return pv;
        }, {});
      });

      registry.registerPath({
        method: method as any,
        path,
        operationId: operation((e) => e.name + method + path),
        summary: operation((e) => e.summary),
        description: operation((e) => e.description),
        security: operation((e) => e.security),
        tags: operation((e) => e.tags),

        request: {
          body: {
            content: { "application/json": { schema: bodySchema } },
            description: operation((e) => e.description),
          },
          params: operation((e) => e.paramsT) as any,
          query: operation((e) => e.queryT) as any,
          headers: operation((e) => e.headersT) as any,
        },

        responses: responses,
      });
    });
  });
  const gen = new OpenAPIGenerator(registry.definitions, "3.0.0");
  const res = gen.generateDocument({
    info: {
      version: api.info.version,
      title: api.info.title,
      contact: api.info.contact,
      description: api.info.description,
    },
    servers: [{ url: "v1" }],
  });
  return res;
};
