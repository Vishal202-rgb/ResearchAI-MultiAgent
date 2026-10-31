import { getNeo4jDriver } from './neo4jClient.js';
import callGemini from '../ai/geminiService.js';
import KnowledgeGraph from '../../models/KnowledgeGraph.js';
import ResearchFinding from '../../models/ResearchFinding.js';

/**
 * Heuristic fallback extraction when AI is unavailable or rate-limited.
 */
const fallbackGraphExtraction = (findingsText) => {
  const lines = (findingsText || '')
    .split('\n')
    .map((l) => l.replace(/^(Summary:|Key Findings:|\*|-|\d+\.)\s*/i, '').trim())
    .filter((l) => l.length > 5);

  const nodes = [];
  const links = [];
  const nodeMap = new Map();

  const addNode = (id, label = 'Concept') => {
    const cleanId = id.trim();
    if (!cleanId || nodeMap.has(cleanId)) return;
    const node = { id: cleanId, label, val: 1 };
    nodeMap.set(cleanId, node);
    nodes.push(node);
  };

  const candidateTopics = [];
  lines.forEach((line) => {
    const parts = line.split(/[:;—–-]/);
    if (parts.length > 1 && parts[0].trim().split(' ').length <= 5) {
      candidateTopics.push(parts[0].trim());
    } else {
      const words = line.split(' ').slice(0, 4).join(' ');
      if (words.length > 4) candidateTopics.push(words);
    }
  });

  const uniqueTopics = Array.from(new Set(candidateTopics)).slice(0, 10);
  uniqueTopics.forEach((topic, idx) => {
    const label = idx % 3 === 0 ? 'Technology' : idx % 3 === 1 ? 'Concept' : 'Company';
    addNode(topic, label);
  });

  for (let i = 0; i < nodes.length - 1; i++) {
    links.push({
      source: nodes[i].id,
      target: nodes[i + 1].id,
      label: i % 2 === 0 ? 'RELATES_TO' : 'INFLUENCES',
    });
  }

  if (nodes.length > 2) {
    for (let i = 2; i < nodes.length; i += 2) {
      links.push({
        source: nodes[0].id,
        target: nodes[i].id,
        label: 'CONNECTS_WITH',
      });
    }
  }

  return { nodes, links };
};

export const buildGraphFromFindings = async (workspaceId, userId, findings) => {
  try {
    const prompt = `Extract a knowledge graph from the following research findings.
Identify key entities (Concepts, Technologies, Companies, People) and the relationships between them.

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
Allowed node labels: Concept, Technology, Company, Person.
Return between 6 to 25 informative nodes and relevant relationships.
Ensure all source and target values match a node id in the nodes list.
`;

    let graphData = null;
    try {
      graphData = await callGemini(prompt, { temperature: 0.1 });
    } catch (aiErr) {
      console.warn('[Knowledge Graph] Gemini extraction error, using fallback extractor:', aiErr.message);
    }

    let nodes = [];
    const links = [];

    if (graphData && Array.isArray(graphData.nodes) && graphData.nodes.length > 0) {
      const nodeMap = new Map();
      const validLabels = ['Concept', 'Technology', 'Company', 'Person'];

      graphData.nodes.forEach((n) => {
        if (!n || !n.id) return;
        const id = String(n.id).trim();
        if (!id) return;
        let label = String(n.label || 'Concept').trim();
        if (!validLabels.includes(label)) label = 'Concept';

        if (!nodeMap.has(id)) {
          nodeMap.set(id, { id, label, val: 1 });
        }
      });

      const rawEdges = graphData.edges || graphData.links || [];
      rawEdges.forEach((e) => {
        if (!e || !e.source || !e.target) return;
        const source = String(e.source).trim();
        const target = String(e.target).trim();
        if (!source || !target || source === target) return;

        // Auto-create any missing node so force-graph doesn't crash
        if (!nodeMap.has(source)) {
          nodeMap.set(source, { id: source, label: 'Concept', val: 1 });
        }
        if (!nodeMap.has(target)) {
          nodeMap.set(target, { id: target, label: 'Concept', val: 1 });
        }

        const label = String(e.type || e.label || 'RELATED_TO').replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
        links.push({ source, target, label });
      });

      nodes = Array.from(nodeMap.values());
    }

    // If Gemini produced no valid nodes, run fallback extraction
    if (nodes.length === 0) {
      const fallback = fallbackGraphExtraction(findings);
      nodes = fallback.nodes;
      links.push(...fallback.links);
    }

    if (nodes.length === 0) {
      console.warn('[Knowledge Graph] No nodes extracted from findings.');
      return false;
    }

    // ─── Neo4j Persistence (if driver is configured and reachable) ───
    const driver = getNeo4jDriver();
    if (driver) {
      try {
        const session = driver.session();
        try {
          const tx = session.beginTransaction();
          try {
            await tx.run(
              `MATCH (n {workspaceId: $workspaceId}) DETACH DELETE n`,
              { workspaceId: workspaceId.toString() }
            );

            for (const node of nodes) {
              const safeLabel = (node.label || 'Concept').replace(/[^a-zA-Z0-9_]/g, '_');
              await tx.run(
                `MERGE (n:${safeLabel} {id: $id, workspaceId: $workspaceId, userId: $userId})
                 SET n.name = $id`,
                {
                  id: node.id,
                  workspaceId: workspaceId.toString(),
                  userId: userId ? userId.toString() : '',
                }
              );
            }

            for (const link of links) {
              const safeType = (link.label || 'RELATED_TO').replace(/[^a-zA-Z0-9_]/g, '_').toUpperCase();
              await tx.run(
                `MATCH (source {id: $sourceId, workspaceId: $workspaceId})
                 MATCH (target {id: $targetId, workspaceId: $workspaceId})
                 MERGE (source)-[r:${safeType}]->(target)`,
                {
                  sourceId: link.source,
                  targetId: link.target,
                  workspaceId: workspaceId.toString(),
                }
              );
            }

            await tx.commit();
            console.log(`[Knowledge Graph] Successfully persisted ${nodes.length} nodes to Neo4j`);
          } catch (txErr) {
            await tx.rollback().catch(() => {});
            console.warn('[Knowledge Graph] Neo4j transaction warning:', txErr.message);
          }
        } finally {
          await session.close().catch(() => {});
        }
      } catch (neoErr) {
        console.warn('[Knowledge Graph] Neo4j session error:', neoErr.message);
      }
    }

    // ─── MongoDB Persistence (Guaranteed Fallback & Primary Cache) ───
    try {
      await KnowledgeGraph.findOneAndUpdate(
        { workspaceId },
        {
          workspaceId,
          userId: userId || undefined,
          nodes,
          links,
        },
        { upsert: true, new: true }
      );

      await ResearchFinding.findOneAndUpdate(
        { workspaceId },
        { $set: { graph: { nodes, links } } },
        { sort: { createdAt: -1 } }
      );
      console.log(`[Knowledge Graph] Successfully saved graph with ${nodes.length} nodes to MongoDB`);
    } catch (dbErr) {
      console.error('[Knowledge Graph] Error saving graph to MongoDB:', dbErr.message);
    }

    return { nodes, links };
  } catch (error) {
    console.error('[Knowledge Graph] Failed to build graph:', error);
    return false;
  }
};

export const getWorkspaceGraph = async (workspaceId) => {
  // 1. Try fetching from Neo4j if available
  const driver = getNeo4jDriver();
  if (driver) {
    try {
      const session = driver.session();
      try {
        const result = await session.run(
          `MATCH (n {workspaceId: $workspaceId})
           OPTIONAL MATCH (n)-[r]->(m {workspaceId: $workspaceId})
           RETURN n, r, m`,
          { workspaceId: workspaceId.toString() }
        );

        if (result.records && result.records.length > 0) {
          const nodesMap = new Map();
          const links = [];

          result.records.forEach((record) => {
            const n = record.get('n');
            if (n && n.properties && n.properties.id) {
              if (!nodesMap.has(n.properties.id)) {
                nodesMap.set(n.properties.id, {
                  id: n.properties.id,
                  val: 1,
                  label: (n.labels && n.labels[0]) || 'Concept',
                });
              }
            }

            const m = record.get('m');
            if (m && m.properties && m.properties.id) {
              if (!nodesMap.has(m.properties.id)) {
                nodesMap.set(m.properties.id, {
                  id: m.properties.id,
                  val: 1,
                  label: (m.labels && m.labels[0]) || 'Concept',
                });
              }
            }

            const r = record.get('r');
            if (r && n && m) {
              links.push({
                source: n.properties.id,
                target: m.properties.id,
                label: r.type || 'RELATED_TO',
              });
            }
          });

          const nodes = Array.from(nodesMap.values());
          if (nodes.length > 0) {
            return { nodes, links };
          }
        }
      } finally {
        await session.close().catch(() => {});
      }
    } catch (error) {
      console.warn('[Knowledge Graph] Neo4j query error, falling back to MongoDB:', error.message);
    }
  }

  // 2. Fetch from MongoDB KnowledgeGraph
  try {
    const kg = await KnowledgeGraph.findOne({ workspaceId });
    if (kg && kg.nodes && kg.nodes.length > 0) {
      return {
        nodes: kg.nodes.map((n) => ({ id: n.id, label: n.label || 'Concept', val: n.val || 1 })),
        links: kg.links.map((l) => ({ source: l.source, target: l.target, label: l.label || 'RELATED_TO' })),
      };
    }

    // 3. Check ResearchFinding.graph
    const finding = await ResearchFinding.findOne({ workspaceId }).sort({ createdAt: -1 });
    if (finding && finding.graph && finding.graph.nodes && finding.graph.nodes.length > 0) {
      return {
        nodes: finding.graph.nodes.map((n) => ({ id: n.id, label: n.label || 'Concept', val: n.val || 1 })),
        links: (finding.graph.links || []).map((l) => ({ source: l.source, target: l.target, label: l.label || 'RELATED_TO' })),
      };
    }
  } catch (error) {
    console.error('[Knowledge Graph] Failed to get graph from MongoDB:', error.message);
  }

  return { nodes: [], links: [] };
};
