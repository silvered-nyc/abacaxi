import { OperationInstruction } from "../operation/operation";
import { ISpecificationExtension } from "openapi3-ts";

export interface Path {
  [key: string]: OperationInstruction ;
}
