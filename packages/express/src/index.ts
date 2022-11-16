import express, { Express, Request, Response } from "express";
import { Abacaxi,CreateOpenApi } from "@abacaxi/core";
import { ZodError,z } from "zod";
type ErrorListItem = {
  type: "Query" | "Params" | "Body";
  errors: ZodError<any>;
};
export const sendError: (error: ErrorListItem, res: Response) => void = (
  error,
  res
) => {
  return res.status(400).send({ type: error.type, errors: error.errors });
};

export const abacaxi = (app: Express, APP: Abacaxi, serverDocs:boolean) => {
    if(serverDocs){
        app.get('/doc',async (req,res)=>{
            res.send(await CreateOpenApi(APP,z))
        })
    }
  app.use(async (req: Request, res: Response, next: Function) => {
    const path = APP.paths[req.path];
    if(req.path === "/doc" || req.path === "/docs"){
      console.log("skipping")
        return next()
    }
   try { path[req.method.toLowerCase()]((i) => {
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

      i.respond(b.data, p.data, q.data).then((data) => {
        res
          .status(data.status)
          .contentType(data.contentType)
          .send(data.response);
      });
    })} catch(e){
      next()
    }
  });
};
