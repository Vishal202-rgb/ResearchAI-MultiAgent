import neo4j from 'neo4j-driver';

let driver = null;

export const initNeo4j = () => {
  const uri = process.env.NEO4J_URI;
  const user = process.env.NEO4J_USERNAME;
  const password = process.env.NEO4J_PASSWORD;

  if (!uri || !user || !password) {
    console.warn('Neo4j credentials not configured. Graph features will be disabled/simulated.');
    return null;
  }

  try {
    driver = neo4j.driver(uri, neo4j.auth.basic(user, password));
    console.log('Neo4j connected');
    return driver;
  } catch (error) {
    console.error('Failed to initialize Neo4j:', error);
    return null;
  }
};

export const getNeo4jDriver = () => {
  if (!driver) return initNeo4j();
  return driver;
};
