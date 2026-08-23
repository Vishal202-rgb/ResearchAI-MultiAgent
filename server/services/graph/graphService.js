import { getNeo4jDriver } from './neo4jClient.js';
import callGemini from '../ai/geminiService.js';

export const buildGraphFromFindings = async (workspaceId, userId, findings) => {
  const driver = getNeo4jDriver();
  if (!driver) return false;

  const session = driver.session();

  try {
    const prompt = `Extract a knowledge graph from the following research findings.
Identify key nodes (Concepts, Technologies, Companies, People) and relationships between them.

FINDINGS:
${findings}

Return ONLY valid JSON in this format:
{
  "nodes": [
    { "id": "Generative AI", "label": "Technology" },
    { "id": "Developer Productivity", "label": "Concept" }
  ],
  "edges": [
    { "source": "Generative AI", "target": "Developer Productivity", "type": "IMPROVES" }
  ]
}
`;

    const graphData = await callGemini(prompt, { temperature: 0.1 });
    
    // Insert into Neo4j
    const tx = session.beginTransaction();
    
    try {
      // Clear old graph for this workspace
      await tx.run(
        `MATCH (n {workspaceId: $workspaceId}) DETACH DELETE n`,
        { workspaceId: workspaceId.toString() }
      );

      // Create Nodes
      for (const node of graphData.nodes || []) {
        const label = (node.label || 'Concept').replace(/[^a-zA-Z0-9_]/g, '_');
        await tx.run(
          `MERGE (n:${label} {id: $id, workspaceId: $workspaceId, userId: $userId})
           SET n.name = $id`,
          { 
            id: node.id, 
            workspaceId: workspaceId.toString(),
            userId: userId.toString()
          }
        );
      }

      // Create Edges
      for (const edge of graphData.edges || []) {
        const type = (edge.type || 'RELATED_TO').replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
        await tx.run(
          `MATCH (source {id: $sourceId, workspaceId: $workspaceId})
           MATCH (target {id: $targetId, workspaceId: $workspaceId})
           MERGE (source)-[r:${type}]->(target)`,
          {
            sourceId: edge.source,
            targetId: edge.target,
            workspaceId: workspaceId.toString()
          }
        );
      }
      
      await tx.commit();
      return true;
    } catch (err) {
      await tx.rollback();
      throw err;
    }
  } catch (error) {
    console.error('Failed to build graph:', error);
    return false;
  } finally {
    await session.close();
  }
};

export const getWorkspaceGraph = async (workspaceId) => {
  const driver = getNeo4jDriver();
  if (!driver) {
    // Return empty simulation structure
    return { nodes: [], links: [] };
  }

  const session = driver.session();
  try {
    const result = await session.run(
      `MATCH (n {workspaceId: $workspaceId})
       OPTIONAL MATCH (n)-[r]->(m {workspaceId: $workspaceId})
       RETURN n, r, m`,
      { workspaceId: workspaceId.toString() }
    );

    const nodesMap = new Map();
    const links = [];

    result.records.forEach(record => {
      const n = record.get('n');
      if (n) {
        if (!nodesMap.has(n.properties.id)) {
          nodesMap.set(n.properties.id, {
            id: n.properties.id,
            val: 1, // visual size
            label: n.labels[0] || 'Node'
          });
        }
      }

      const m = record.get('m');
      if (m) {
        if (!nodesMap.has(m.properties.id)) {
          nodesMap.set(m.properties.id, {
            id: m.properties.id,
            val: 1,
            label: m.labels[0] || 'Node'
          });
        }
      }

      const r = record.get('r');
      if (r && n && m) {
        links.push({
          source: n.properties.id,
          target: m.properties.id,
          label: r.type
        });
      }
    });

    return {
      nodes: Array.from(nodesMap.values()),
      links
    };
  } catch (error) {
    console.error('Failed to get graph:', error);
    return { nodes: [], links: [] };
  } finally {
    await session.close();
  }
};
