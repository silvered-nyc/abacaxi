import { Path } from "../path/path";
import zod from "zod";
import { descascar } from "../operation/operation";
import { OpenAPIObject } from "openapi3-ts";


export interface Abacaxi extends Omit<OpenAPIObject, "paths" | "components"> {
  paths: { [key: string]: Path };
}