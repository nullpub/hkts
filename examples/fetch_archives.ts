import * as A from "../array.ts";
import * as D from "../schemable/decoder.ts";
import * as E from "../either.ts";
import * as TE from "../task_either.ts";
import * as L from "../optics/lens.ts";
import * as T from "../optics/traversal.ts";
import { flow, pipe } from "../fns.ts";

// Let's start by defining some error types and making some constructors
type FetchError = { type: "FetchError"; message: string };
const fetchError = (message: string): FetchError => ({
  type: "FetchError",
  message,
});

type DecodeError = { type: "DecodeError"; message: string };
const decodeError = (message: string): DecodeError => ({
  type: "DecodeError",
  message,
});

/**
 * Let's make a helper function for fetch. This one takes the same
 * inputs as fetch, but does the following:
 * 
 * * Wraps fetch in a TaskEither instance
 * * Parses the response to json
 * * Takes any errors and types them as FetchError
 */
const fetchTaskEither = (
  url: string | Request | URL,
): TE.TaskEither<FetchError, unknown> =>
  // Pipe is a helper function. It takes the first value and passes it to the function in the
  // second position, then takes the result of that and passes it on to a third argument (if
  // it exists). Once it reaches the end, it returns the result.
  pipe(
    () => fetch(url).then((res) => res.json()), // Here is normal fetch and then parsing json
    TE.fromFailableTask(flow(String, fetchError)), // Here we wrap it in a TaskEither and parse errors
  );

/**
 * Next, let's combine the fetch helper function with a "Decoder"
 * 
 * A Decoder is simply a function that takes some input and makes
 * sure it has the "shape" or "properties" that we want. It's output
 * is either a tree of errors or the data you want wrapped in an Either.
 * 
 * Here, we take a decoder, then we return an extension of the
 * fetchTaskEither function where we make sure the response from
 * fetchTaskEither has the structure that we want.
 */
const fromDecode = <A>(decoder: D.Decoder<unknown, A>) =>
  // Flow is a helper function like pipe, but instead of the
  // first argument being a value, it is a function.
  flow(
    fetchTaskEither, // Start with fetchTaskEither
    TE.chain(flow( // Then take any "good" results and pass them to..
      decoder, // The decoder
      E.mapLeft((e) => decodeError(D.draw(e))), // Take any decoder errors and wrap them up
      TE.fromEither, // Since a decoder returns a plain "Either" we wrap it in a Task to make a TaskEither
      TE.widen<FetchError>(), // This hack is necessary so we can have different error types in the flow
    )),
  );

/**
 * Here is an example of a Decoder. The intersect combinator is generally useful
 * for "merging" two decoders together. In this case type contains the required
 * properties on a Document and partial contains the optional ones.
 */
const Document = D.intersect(
  D.type({
    title: D.string,
    description: D.string,
    collection: D.array(D.string), // It's decoders all the way down.
    downloads: D.number,
    format: D.array(D.string),
    identifier: D.string,
    item_size: D.number,
    mediatype: D.string,
  }),
  D.partial({
    backup_location: D.string,
    language: D.string,
    date: D.string,
    creator: D.string,
    month: D.number,
    week: D.number,
    year: D.string,
  }),
);
// TypeOf extracts the type from the decoder so
// we don't have to do double the work keeping decoders
// in sync with type declarations
type Document = D.TypeOf<typeof Document>;

// A response from archive contains many documents and
// some metadata
const Response = D.type({
  numFound: D.number,
  start: D.number,
  docs: D.array(Document),
});
type Response = D.TypeOf<typeof Response>;

// The happy path response from archive gives this response
const QueryResponse = D.type({
  response: Response, // Notice that Decoders are composable even when you make your own
});
type QueryResponse = D.TypeOf<typeof QueryResponse>;

// Wireup the fromDecode with QueryResponse
const fetchDecodeArchive = fromDecode(QueryResponse);

// This is a simple helper function that lets us only worry
// about supplying a term to lookup in the internet archive
const queryArchive = (term: string) =>
  fetchDecodeArchive(
    `https://archive.org/advancedsearch.php?q=${
      encodeURIComponent(term)
    }&output=json`,
  );

// If we just wanted to print the response we could do so like this
// queryArchive("Chimamanda")().then(E.fold(console.error, console.log));

// Instead, let's say we are only interested in the titles, dates, and
// descriptions. We can build an "optic" that digs into the Query response
// for the data we want

const getData = pipe(
  L.id<QueryResponse>(), // Start with a lens on the QueryResponse
  L.prop("response"), // Focus on the response field
  L.prop("docs"), // Then on the docs field
  L.traverse(A.Traversable), // Docs is an array, so we "traverse" it, focusing on each document
  T.props("title", "date", "description"), // We only want to focus on title, date, and description
  T.getAll, // We've focused on the data we want, let's get it!
);

// The last part is to run the query and map the response to the getData function
pipe(
  queryArchive("Chimamanda"), // Fetch and Parse a request for items with Chimamanda in them
  TE.map(getData), // Take any "good" response and extract an array of titles, dates, and descriptions
  // This line actually runs our program and outputs the results
  // to either stderr or stdout depending on the result
)().then(E.fold(console.error, console.log));

/**
 * Summary
 * * We validated the response from a fetch call
 * * We differentiated between FetchErrors and DecodeErrors
 * * We derived the QueryResponse type from the validator
 * * We used functional lenses to focus deep into the
 *   QueryResponse to get only the titles, dates, and
 *   descriptions we care about
 * * We output a clear validation error when decoded
 *   data is incorrect.
 */