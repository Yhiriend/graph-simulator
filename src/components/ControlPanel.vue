<template>
  <div class="control-panel">
    <label for="startNode">Grafos Eulerianos:</label>

    <select v-model="optselected">
      <option value="1">Ejemplo 1</option>
      <option value="2">Ejemplo 2</option>
      <option value="3">Ejemplo 3</option>
    </select>

    <label for="startNode">Nodo Inicio:</label>
    <select v-model="startNode">
      <option v-for="node in nodes" :key="node.id" :value="node.id">
        {{ node.nombre }}
      </option>
    </select>

    <label for="endNode">Nodo Final:</label>
    <select v-model="endNode">
      <option v-for="node in nodes" :key="node.id" :value="node.id">
        {{ node.nombre }}
      </option>
    </select>

    <button @click="findShortestPath">Hallar camino Euleriano</button>

    <textarea v-model="result"></textarea>
  </div>
</template>

<script setup lang="ts">
import { useGraphStore } from "../stores/graph.store";
import { ref, onMounted, watch } from "vue";

const graphStore = useGraphStore();
const nodes = ref();
const edges = ref();
const result = ref();
const startNode = ref<number | null>(null);
const endNode = ref<number | null>(null);
const optselected = ref("");

function findShortestPath() {
  if (startNode.value !== null && endNode.value !== null) {
    graphStore.runDijkstra(startNode.value, endNode.value);
    const markNodes = graphStore.shortestPath
      .map((id) => graphStore.nodes.find((n) => n.id === id))
      .filter((node) => node !== undefined)
      .map((n) => n.nombre);
    result.value = `Camino más corto: ${markNodes.join(", ")}`;
  }
  // if (nodes.value && edges.value) {
  //   findEulerianPathOrCircuit();
  // }
}

function findEulerianPathOrCircuit() {
  const degrees: { [key: number]: number } = {};
  const oddNodes: number[] = [];

  nodes.value.forEach((node: any) => {
    degrees[node.id] = 0;
  });

  edges.value.forEach((edge: any) => {
    degrees[edge.v1] = (degrees[edge.v1] || 0) + 1;
    degrees[edge.v2] = (degrees[edge.v2] || 0) + 1;
  });

  for (const nodeId in degrees) {
    if (degrees[nodeId] % 2 !== 0) {
      oddNodes.push(parseInt(nodeId));
    }
  }

  if (oddNodes.length === 0) {
    result.value = "El grafo tiene un circuito euleriano.";
    console.log("El grafo tiene un circuito euleriano.");
    return buildEulerianCircuit();
  } else if (oddNodes.length === 2) {
    result.value = "El grafo tiene un camino euleriano.";
    console.log("El grafo tiene un camino euleriano.");
    return buildEulerianPath(oddNodes[0], oddNodes[1]);
  } else {
    result.value = "El grafo no tiene un camino ni circuito euleriano.";
    console.log("El grafo no tiene un camino ni circuito euleriano.");
    return [];
  }
}
function buildEulerianCircuit() {
  const stack: number[] = [];
  const path: number[] = [];
  const edgesCopy = [...edges.value];

  stack.push(nodes.value[0].id);

  while (stack.length > 0) {
    const currentNode = stack[stack.length - 1];
    const edgeIndex = edgesCopy.findIndex(
      (edge) => edge.v1 === currentNode || edge.v2 === currentNode
    );

    if (edgeIndex !== -1) {
      const edge = edgesCopy.splice(edgeIndex, 1)[0];
      const nextNode = edge.v1 === currentNode ? edge.v2 : edge.v1;
      stack.push(nextNode);
    } else {
      path.push(stack.pop()!);
    }
  }
  result.value += `[ ${path.reverse().join(", ")}]`;
  return path.reverse();
}

function buildEulerianPath(startNode: number, endNode: number) {
  const stack: number[] = [];
  const path: number[] = [];
  const edgesCopy = [...edges.value];

  stack.push(startNode);

  while (stack.length > 0) {
    const currentNode = stack[stack.length - 1];
    const edgeIndex = edgesCopy.findIndex(
      (edge) => edge.v1 === currentNode || edge.v2 === currentNode
    );

    if (edgeIndex !== -1) {
      const edge = edgesCopy.splice(edgeIndex, 1)[0];
      const nextNode = edge.v1 === currentNode ? edge.v2 : edge.v1;
      stack.push(nextNode);
    } else {
      path.push(stack.pop()!);
    }
  }
  console.log(path.reverse());
  result.value += `[ ${path.reverse().join(", ")}]`;
  return path.reverse();
}

watch(optselected, () => {
  console.log("selec", optselected.value);
  if (optselected.value) {
    graphStore.fetchGraphData(Number(optselected.value));
    graphStore.setSelectedOption(Number(optselected.value));
    console.log(graphStore.nodes);
    nodes.value = graphStore.nodes;
    edges.value = graphStore.edges;
  }
});

onMounted(() => {
  // graphStore.fetchGraphData();
  // console.log(graphStore.nodes);
  // nodes.value = graphStore.nodes;
  // edges.value = graphStore.edges;
});
</script>

<style scoped>
.control-panel {
  display: flex;
  flex-direction: column;
  gap: 10px;
}
</style>
