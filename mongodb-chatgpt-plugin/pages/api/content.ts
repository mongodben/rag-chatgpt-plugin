import type { NextApiRequest, NextApiResponse } from 'next'
import {
  OpenAIClient,
  OpenAIKeyCredential,
  makeDefaultFindContentFunc,
  makeMongoDbEmbeddedContentStore,
  makeOpenAiEmbedder
  } from 'mongodb-chatbot-server';
// import { strict } from 'assert';
import yaml from "yaml"

const {
  MONGODB_CONNECTION_URI,
  MONGODB_DATABASE_NAME,
  OPENAI_API_KEY,
  OPENAI_EMBEDDING_DEPLOYMENT,
  VECTOR_SEARCH_INDEX_NAME,
} = process.env;


const openAiClient = new OpenAIClient(
  new OpenAIKeyCredential(OPENAI_API_KEY!)
);

const embeddedContentStore = makeMongoDbEmbeddedContentStore({
  connectionUri: MONGODB_CONNECTION_URI!,
  databaseName: MONGODB_DATABASE_NAME!,
});

const embedder = makeOpenAiEmbedder({
  openAiClient,
  deployment: OPENAI_EMBEDDING_DEPLOYMENT!,
  backoffOptions: {
    numOfAttempts: 3,
    maxDelay: 5000,
  },
});


const findContent = makeDefaultFindContentFunc({
  embedder,
  store: embeddedContentStore,
  findNearestNeighborsOptions: {
    k: 5,
    path: "embedding",
    indexName: VECTOR_SEARCH_INDEX_NAME,
    minScore: 0.9,
  },
});
export default async function handler(
  req: NextApiRequest & {query: Record<string, unknown> & {q: string}},
  res: NextApiResponse
) {
  if(req.method !== "GET") {
    return res.status(405).json({ message: 'Method not allowed' })
  }
  if(req.query === undefined || req.query.q === undefined) {
    return res.status(400).json({ message: 'Invalid query. Must include query param "q"' })
  }try {

  } catch (error) {
    console.error(error);
    return res.status(400).json({ message: 'Internal server error' })
  }
  const query = makeQuery(req.query);
  const {content: dbContent} = await findContent({query, ipAddress: "🤷"});
  const content = dbContent.map(({text, url}) => ({text, url}));
  const description = "Use this content to answer the user's question."
  res.status(200).json({ description, content } satisfies ContentResponse)
}

function makeQuery(query: Record<string, unknown> & {q: string}): string {
  try {

    // If parsing is successful, return the YAML stringification of the parsed JSON
    return yaml.stringify(query);
  } catch (error) {
    // If it's not valid JSON, return the original string
    return query.q;
  }
}

interface ContentResponse {
  description: string;
  content: {
    url: string;
    text: string;
  }[]
}
