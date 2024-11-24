import axios from "axios";
import { defineStore } from "pinia";

// const exampleNodes = [
//   { id: 1, nombre: "A" },
//   { id: 2, nombre: "B" },
//   { id: 3, nombre: "C" },
//   { id: 4, nombre: "D" },
//   { id: 5, nombre: "E" },
//   { id: 6, nombre: "F" },
//   { id: 7, nombre: "G" },
//   { id: 8, nombre: "H" },
// ];

// const exampleEdges = [
//   { id: 1, v1: 1, v2: 2, ponderacion: 3 }, // A -> B
//   { id: 2, v1: 1, v2: 3, ponderacion: 1 }, // A -> C
//   { id: 3, v1: 4, v2: 5, ponderacion: 4 }, // D -> E
//   { id: 4, v1: 2, v2: 4, ponderacion: 1 }, // B -> D
//   { id: 5, v1: 2, v2: 7, ponderacion: 5 }, // B -> G
//   { id: 6, v1: 3, v2: 6, ponderacion: 5 }, // C -> F
//   { id: 7, v1: 3, v2: 4, ponderacion: 2 }, // C -> D
//   { id: 8, v1: 4, v2: 6, ponderacion: 2 }, // D -> F
//   { id: 9, v1: 5, v2: 8, ponderacion: 1 }, // E -> H
//   { id: 10, v1: 5, v2: 7, ponderacion: 2 }, // E -> G
//   { id: 11, v1: 6, v2: 8, ponderacion: 3 }, // F -> H
// ];

const exampleNodes = [
  { id: 1, nombre: "A" },
  { id: 2, nombre: "B" },
  { id: 3, nombre: "C" },
  { id: 4, nombre: "D" },
  { id: 5, nombre: "E" },
  { id: 6, nombre: "F" },
  { id: 7, nombre: "G" },
];

const exampleEdges = [
  { id: 1, v1: 1, v2: 2, ponderacion: 3, color: "#2c3e50" }, //A -> B
  { id: 2, v1: 1, v2: 7, ponderacion: 1, color: "#2c3e50" }, //A -> G
  { id: 3, v1: 4, v2: 6, ponderacion: 4, color: "#2c3e50" }, //D -> F
  { id: 4, v1: 2, v2: 3, ponderacion: 1, color: "#2c3e50" }, //B -> C
  { id: 5, v1: 2, v2: 7, ponderacion: 5, color: "#2c3e50" }, //B -> G
  { id: 6, v1: 3, v2: 6, ponderacion: 5, color: "#2c3e50" }, //C -> F
  { id: 7, v1: 3, v2: 4, ponderacion: 2, color: "#2c3e50" }, //C -> D
  { id: 8, v1: 6, v2: 7, ponderacion: 2, color: "#2c3e50" }, //F -> G
  { id: 9, v1: 5, v2: 4, ponderacion: 1, color: "#2c3e50" }, //E -> D
  { id: 10, v1: 3, v2: 7, ponderacion: 2, color: "#2c3e50" }, // C -> G
  { id: 11, v1: 6, v2: 5, ponderacion: 3, color: "#2c3e50" }, // F -> E
];

const exampleNodes2 = [
  { id: 1, nombre: "A" },
  { id: 2, nombre: "B" },
  { id: 3, nombre: "C" },
  { id: 4, nombre: "D" },
  { id: 5, nombre: "E" },
];

const exampleEdges2 = [
  { id: 1, v1: 1, v2: 2, ponderacion: 3 }, //A -> B
  { id: 2, v1: 1, v2: 5, ponderacion: 1 }, //A -> E
  { id: 3, v1: 2, v2: 5, ponderacion: 4 }, //B -> E
  { id: 4, v1: 5, v2: 4, ponderacion: 1 }, //E -> D
  { id: 5, v1: 5, v2: 3, ponderacion: 5 }, //E -> C
  { id: 6, v1: 3, v2: 4, ponderacion: 5 }, //C -> D
];

const exampleNodes3 = [
  { id: 1, nombre: "A" },
  { id: 2, nombre: "B" },
  { id: 3, nombre: "C" },
  { id: 4, nombre: "D" },
  { id: 5, nombre: "E" },
  { id: 6, nombre: "F" },
];

const exampleEdges3 = [
  { id: 1, v1: 1, v2: 2, ponderacion: 3 }, //A -> B
  { id: 2, v1: 1, v2: 3, ponderacion: 1 }, //A -> C
  { id: 3, v1: 2, v2: 6, ponderacion: 4 }, //B -> F
  { id: 4, v1: 2, v2: 4, ponderacion: 1 }, //B -> D
  { id: 5, v1: 3, v2: 5, ponderacion: 5 }, //C -> E
  { id: 6, v1: 3, v2: 4, ponderacion: 2 }, //C -> D
  { id: 7, v1: 2, v2: 5, ponderacion: 2 }, //B -> E
  { id: 8, v1: 5, v2: 4, ponderacion: 1 }, //E -> D
];

function addNodePositions(
  nodes: any[],
  centerX = 250,
  centerY = 250,
  radius = 200
) {
  const totalNodes = nodes.length;

  return nodes.map((node, index) => {
    const angle = (index / totalNodes) * 2 * Math.PI;
    const x = 50; //centerX + radius * Math.cos(angle);
    const y = 200; //centerY + radius * Math.sin(angle);
    return {
      ...node,
      x: node.x - x,
      y: node.y + y,
    };
  });
}

interface Node {
  id: number;
  nombre: string;
  x: number;
  y: number;
}

interface Edge {
  id: number;
  v1: number;
  v2: number;
  ponderacion: number;
}

interface GraphState {
  nodes: Node[];
  edges: Edge[];
  shortestPath: number[];
  shortestDistance: number | null;
  secondShortestPath: number[];
  secondShortestDistance: number | null;
  selectedNodeId: number | null;
  selectedOption: number | null;
}

export const useGraphStore = defineStore("graph", {
  state: (): GraphState => ({
    nodes: [],
    edges: [],
    shortestPath: [],
    shortestDistance: null as number | null,
    secondShortestPath: [],
    secondShortestDistance: null as number | null,
    selectedNodeId: null as number | null,
    selectedOption: null as number | null,
  }),
  actions: {
    setSelectedOption(opt: number) {
      this.selectedOption = opt;
    },
    async fetchGraphData(n: number) {
      if (n === 1) {
        this.nodes = addNodePositions(exampleNodes);
        this.edges = exampleEdges;
      } else if (n === 2) {
        this.nodes = addNodePositions(exampleNodes2);
        this.edges = exampleEdges2;
      } else if (n === 3) {
        this.nodes = addNodePositions(exampleNodes3);
        this.edges = exampleEdges3;
      } else {
        const { edges, nodes } = await this.loadGraph();
        this.nodes = addNodePositions(nodes);
        this.edges = edges;
      }
    },
    runDijkstra(startNodeId: number, endNodeId: number) {
      const distances: { [key: number]: number } = {};
      const previousNodes: { [key: number]: number | null } = {};
      const unvisitedNodes: Set<number> = new Set(
        this.nodes.map((node) => node.id)
      );

      this.nodes.forEach((node) => {
        distances[node.id] = node.id === startNodeId ? 0 : Infinity;
        previousNodes[node.id] = null;
      });

      while (unvisitedNodes.size > 0) {
        let currentNodeId = -1;
        let currentMinDistance = Infinity;

        unvisitedNodes.forEach((nodeId) => {
          if (distances[nodeId] < currentMinDistance) {
            currentMinDistance = distances[nodeId];
            currentNodeId = nodeId;
          }
        });

        if (currentNodeId === endNodeId) break;

        unvisitedNodes.delete(currentNodeId);

        const edgesFromCurrent = this.edges.filter(
          (edge) => edge.v1 === currentNodeId || edge.v2 === currentNodeId
        );
        for (const edge of edgesFromCurrent) {
          const neighborId = edge.v1 === currentNodeId ? edge.v2 : edge.v1;
          const alternativeDistance =
            distances[currentNodeId] + edge.ponderacion;

          if (alternativeDistance < distances[neighborId]) {
            distances[neighborId] = alternativeDistance;
            previousNodes[neighborId] = currentNodeId;
          }
        }
      }

      const path: number[] = [];
      let currentNode: number | null = endNodeId;

      while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = previousNodes[currentNode];
      }

      if (path[0] !== startNodeId) {
        this.shortestPath = [];
      } else {
        this.shortestPath = path;
        this.shortestDistance = distances[endNodeId];
        console.log("shortestPath: ", this.shortestPath);
      }
    },
    findSecondShortestPath(startNodeId: number, endNodeId: number) {
      const firstPath = [...this.shortestPath]; // Copia del primer camino más corto
      const distances: { [key: number]: number } = {};
      const originalEdges = [...this.edges]; // Copia original de las aristas

      if (firstPath.length === 0) {
        console.log("No existe un camino entre los nodos.");
        return;
      }

      let secondShortestPath: number[] = [];
      let secondShortestDistance = Infinity;

      // Calcular las distancias de todas las aristas
      originalEdges.forEach((edge) => {
        const key: any = `${Math.min(edge.v1, edge.v2)}-${Math.max(
          edge.v1,
          edge.v2
        )}`;
        distances[key] = edge.ponderacion;
      });

      // Iterar sobre cada arista del camino más corto
      for (let i = 0; i < firstPath.length - 1; i++) {
        const edgeToRemove = {
          v1: firstPath[i],
          v2: firstPath[i + 1],
        };

        // Filtrar temporalmente las aristas del primer camino
        const filteredEdges = originalEdges.filter(
          (edge) =>
            !(
              (edge.v1 === edgeToRemove.v1 && edge.v2 === edgeToRemove.v2) ||
              (edge.v1 === edgeToRemove.v2 && edge.v2 === edgeToRemove.v1)
            )
        );

        // Reconstruir un nuevo camino más corto sin volver a correr Dijkstra
        const altPath = this.reconstructPathWithoutEdge(
          startNodeId,
          endNodeId,
          filteredEdges,
          distances
        );

        if (
          altPath.path.length > 0 &&
          altPath.distance < secondShortestDistance
        ) {
          secondShortestDistance = altPath.distance;
          secondShortestPath = altPath.path;
        }
      }

      if (secondShortestPath.length === 0) {
        console.log("No se encontró un segundo camino más corto.");
      } else {
        this.secondShortestPath = secondShortestPath;
        this.secondShortestDistance = secondShortestDistance;
        console.log("Second shortest path: ", secondShortestPath);
        console.log("Distance: ", secondShortestDistance);
      }
    },
    reconstructPathWithoutEdge(
      startNodeId: number,
      endNodeId: number,
      edges: any[],
      distances: { [key: string]: number }
    ): { path: number[]; distance: number } {
      const visitedNodes: Set<number> = new Set();
      const unvisitedNodes: Set<number> = new Set(
        this.nodes.map((node) => node.id)
      );
      const localDistances: { [key: number]: number } = {};
      const previousNodes: { [key: number]: number | null } = {};

      this.nodes.forEach((node) => {
        localDistances[node.id] = node.id === startNodeId ? 0 : Infinity;
        previousNodes[node.id] = null;
      });

      while (unvisitedNodes.size > 0) {
        let currentNodeId = -1;
        let currentMinDistance = Infinity;

        unvisitedNodes.forEach((nodeId) => {
          if (localDistances[nodeId] < currentMinDistance) {
            currentMinDistance = localDistances[nodeId];
            currentNodeId = nodeId;
          }
        });

        if (currentNodeId === endNodeId) break;

        unvisitedNodes.delete(currentNodeId);

        const edgesFromCurrent = edges.filter(
          (edge) => edge.v1 === currentNodeId || edge.v2 === currentNodeId
        );

        edgesFromCurrent.forEach((edge) => {
          const neighborId = edge.v1 === currentNodeId ? edge.v2 : edge.v1;
          const key = `${Math.min(edge.v1, edge.v2)}-${Math.max(
            edge.v1,
            edge.v2
          )}`;
          const alternativeDistance =
            localDistances[currentNodeId] + distances[key];

          if (alternativeDistance < localDistances[neighborId]) {
            localDistances[neighborId] = alternativeDistance;
            previousNodes[neighborId] = currentNodeId;
          }
        });
      }

      const path: number[] = [];
      let currentNode: number | null = endNodeId;

      while (currentNode !== null) {
        path.unshift(currentNode);
        currentNode = previousNodes[currentNode];
      }

      if (path[0] !== startNodeId) {
        return { path: [], distance: Infinity };
      }

      return { path, distance: localDistances[endNodeId] };
    },
    updateNodePosition(nodeId: number, dx: number, dy: number) {
      const node = this.nodes.find((n) => n.id === nodeId);
      if (node) {
        node.x += dx;
        node.y += dy;
      }
    },
    moveSelectedNode(dx: number, dy: number) {
      if (this.selectedNodeId !== null) {
        const node = this.nodes.find((n) => n.id === this.selectedNodeId);
        if (node) {
          node.x += dx;
          node.y += dy;
        }
      }
    },
    selectNode(nodeId: number | null) {
      this.selectedNodeId = nodeId;
    },
    async saveGraph() {
      console.log(this.nodes);
      const headers = {
        "Content-Type": "application/json",
      };
      const vertices = [...this.nodes];
      try {
        const response = await axios.post(
          "http://localhost:3000/api/nodes/update-vertices",
          { vertices },
          { headers }
        );
        console.log(response);
      } catch (e) {
        console.error(e);
      }
    },
    async loadGraph() {
      const headers = {
        "Content-Type": "application/json",
      };
      try {
        const response = await axios.get(
          "http://localhost:3000/api/nodes/graph",
          { headers }
        );
        console.log("getting graph: ", response.data);
        return response.data;
      } catch (e) {
        console.error(e);
      }
    },
  },
});
