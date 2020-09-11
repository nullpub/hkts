import { sequenceTuple } from "../sequence.ts";
import * as O from "../option.ts";

const sequenceOption = sequenceTuple(O.Apply);
const testOption = sequenceOption(O.some(1), O.some(2));
