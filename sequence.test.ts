import * as M from "./maybe.ts";
import * as E from "./either.ts";
import { sequenceTuple, sequenceTuple2 } from "./sequence.ts";

const sequenceMaybe = sequenceTuple(M.Apply);
const testMaybe = sequenceMaybe(M.some(1), M.some(2));
