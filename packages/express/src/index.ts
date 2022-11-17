import express, { Express, Request, Response } from "express";
import { Abacaxi, CreateOpenApi, OperationInstruction } from "@abacaxi/core";
import { ZodError, z } from "zod";
type ErrorListItem = {
  type: "Query" | "Params" | "Body" | "Header" | "Cookies" | "SignedCookies";
  errors: ZodError<any>;
};
export const sendError: (error: ErrorListItem, res: Response) => void = (
  error,
  res
) => {
  return res.status(400).send({ type: error.type, errors: error.errors });
};

export const abacaxiExpress = (
  app: Express,
  APP: Abacaxi,
  serverDocs: boolean
) => {
  const allPaths = Object.entries(APP.paths);
  const handle = (req: Request, res: Response, op: OperationInstruction) => {
    op((i) => {
      const p = i.paramsT.safeParse(req.params);

      if (!p.success) {
        return sendError({ type: "Params", errors: p.error }, res);
      }

      const q = i.queryT.safeParse(req.query);
      if (!q.success) {
        return sendError({ type: "Query", errors: q.error }, res);
      }

      const b = i.bodyT.safeParse(req.body);
      if (!b.success) {
        return sendError({ type: "Body", errors: b.error }, res);
      }

      // const h = z.lazy(() => z.union(i.headersT as any)).safeParse(req.headers);
      // if (!h.success) {
      //   return sendError({ type: "Header", errors: h.error }, res);
      // }


      // const c = z.lazy(() => z.union(i.cookiesT as any)).safeParse(req.cookies);
      // if (!c.success) {
      //   return sendError({ type: "Cookies", errors: c.error }, res);
      // }

      //@ts-ignore
      i.respond(b.data, p.data, q.data,{}, {}).then((data) => {
        res
          .status(data.status)
          .contentType(data.contentType)
          .send(data.response);
      });
    });
  };

  allPaths.forEach(([path, methods]) => {
    Object.keys(methods).forEach((method) => {
      if (method === "get") {
        app.get(path, (req, res) => {
          handle(req, res, methods[method]);
        });
      } else if (method === "post") {
        app.post(path, (req, res) => {
          handle(req, res, methods[method]);
        });
      } else if (method === "put") {
        app.get(path, (req, res) => {
          handle(req, res, methods[method]);
        });
      } else if (method === "delete") {
        app.delete(path, (req, res) => {
          handle(req, res, methods[method]);
        });
      } else if (method === "patch") {
        app.patch(path, (req, res) => {
          handle(req, res, methods[method]);
        });
      }
    });

    if (serverDocs) {
      app.get("/doc", async (req, res) => {
        res.send(await CreateOpenApi(APP, z));
      });
    }
  });
};

//   app.use(async (req: Request, res: Response, next: Function) => {
//     const path = APP.paths[req.path];
//     // match vs api using path-to-regexp
//     if (path) {

//    try { path[req.method.toLowerCase()]((i) => {

//     })} catch(e){
//       next()
//     }
//   });
// };
