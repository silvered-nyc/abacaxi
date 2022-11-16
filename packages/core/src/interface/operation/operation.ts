import { OperationObject } from "openapi3-ts";
import zod from "zod";

type Response = {
  status: number;
  response: zod.ZodType;
  contentType: string;
};

interface Route<
  BodyType,
  ParamsType,
  QueryType,
  HeaderType,
  DefaultResponseType extends Response,
  OtherResponseType extends Array<Response>,

> extends Pick<
    Omit<OperationObject, "responses">,
    "tags" | "summary" | "description" | "externalDocs" | "security"
  > {
  name:string,
  bodyT: zod.ZodType<BodyType>;
  paramsT: zod.ZodType<ParamsType>;
  queryT: zod.ZodType<QueryType>;
  headersT:zod.ZodType<HeaderType>[] 
  defaultResponseT: DefaultResponseType;
  otherResponsesT: OtherResponseType;
  respond: (
    body: BodyType,
    params: ParamsType,
    query: QueryType,
    headers?: HeaderType,

  ) => Promise<{
    response: DefaultResponseType["response"]["_type"];
    contentType: string;
    status: number;
  } | {
    response: OtherResponseType[number]["response"]["_type"];
    contentType: string;
    status: number;
  }>;
}
// const res = zod.object({}).strict()._type;

export type OperationInstruction = <R>(
  cb: <
    BodyType,
    ParamsType,
    QueryType,
    HeaderType,
    DefaultResponseType extends Response,
    OtherResponseType extends Array<Response>
  >(
    instruction: Route<
      BodyType,
      ParamsType,
      QueryType,
      HeaderType,
      DefaultResponseType,
      OtherResponseType
    >
  ) => R
) => R;
export const descascar =
  <
    BodyType,
    ParamsType,
    QueryType,
    HeaderType,
    DefaultResponseType extends Response,
    OtherResponseType extends Array<Response>
  >(
    i: Route<
      BodyType,
      ParamsType,
      QueryType,
      HeaderType,
      DefaultResponseType,
      OtherResponseType
    >
  ): OperationInstruction =>
  (cb) =>
    cb(i);
