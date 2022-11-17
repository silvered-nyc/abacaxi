import express, { Express, Request, Response } from "express";
import BodyParser from "body-parser";
import cookie from "cookie-parser";
import zod from "zod";

import { descascar } from "@abacaxi/core";
import { abacaxiExpress } from "..";

// descascar
const app: Express = express();
const port = 1001;
app.use(cookie());
app.use(BodyParser.json());

abacaxiExpress(
  app,
  {
    info: { title: "sample", version: "1.0.0" },
    openapi: "3.0.0",
    paths: {
      "/test": {
        post: descascar({

          name: "daniel",
          summary: "daniel",
          bodyT: zod.object({ hello: zod.string().min(1) }).strict(),
          headersT: [],
        
          defaultResponseT: {
            contentType: "application/json",
            response: zod.object({ hello: zod.string() }).strict(),
            status: 200,
          },
          otherResponsesT: [
            {
              contentType: "application/json",
              response: zod.object({ message: zod.string() }).strict(),
              status: 500,
            },
          ],
          paramsT: zod.object({}).strict(),
          queryT: zod.object({}).strict(),
          
          respond: async (body, params, query, headers) => {
            if (false) {
              return {
                contentType: "application/json",
                response: { message: "hello" },
                status: 500,
              };
            }
            return {
              contentType: "application/json",
              response: {
                hello: "hi",
              },
              status: 200,
            };
          },
          cookiesT: [],
          signedCookiesT: [],
        }),
      },
    },
  },
  true
);

app.listen(port, () => {
  console.log(`⚡️[server]: Server is running at https://localhost:${port}`);
});
