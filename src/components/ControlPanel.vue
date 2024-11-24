<template>
  <div class="control-panel">
    <label for="startNode">DIJKSTRA</label>

    <select v-model="optselected">
      <option value="1">Ejemplo 1</option>
      <option value="2">Ejemplo 2</option>
      <option value="3">Ejemplo 3</option>
      <option value="4">Cargar grafo desde BD</option>
    </select>

    <label for="startNode">Nodo Inicio:</label>
    <select :disabled="optselected === ''" v-model="startNode">
      <option v-for="node in nodes" :key="node.id" :value="node.id">
        {{ node.nombre }}
      </option>
    </select>

    <label for="endNode">Nodo Final:</label>
    <select :disabled="optselected === ''" v-model="endNode">
      <option v-for="node in nodes" :key="node.id" :value="node.id">
        {{ node.nombre }}
      </option>
    </select>
    <button
      :disabled="startNode === null || endNode === null"
      @click="findShortestPath"
    >
      Hallar rutas
    </button>
    <div>
      <hr />
      <h5 style="text-align: start">
        <i class="bi bi-1-circle-fill" style="color: #a70000"></i> Camino mas
        corto ({{ firstDistance }}
        Km)
      </h5>
      <p v-text="firstPath"></p>
      <hr />
      <h5 style="text-align: start">
        <i class="bi bi-2-circle-fill" style="color: #004d00"></i>
        Camino mas corto ({{ secondDistance }}
        Km)
      </h5>
      <p v-text="secondPath"></p>
    </div>

    <textarea v-model="result"></textarea>
  </div>
</template>

<script setup lang="ts">
import { useGraphStore } from "../stores/graph.store";
import { ref, onMounted, watch, computed } from "vue";

const graphStore = useGraphStore();
const nodes = ref();
const edges = ref();
const result = ref("");
const firstPath = computed(() => graphStore.shortestPath);
const secondPath = computed(() => graphStore.secondShortestPath);
const firstDistance = computed(() => graphStore.shortestDistance);
const secondDistance = computed(() => graphStore.secondShortestDistance);
const startNode = ref<number | null>(null);
const endNode = ref<number | null>(null);
const optselected = ref("");

function findShortestPath() {
  if (startNode.value !== null && endNode.value !== null) {
    graphStore.runDijkstra(startNode.value, endNode.value);
    graphStore.findSecondShortestPath(startNode.value, endNode.value);
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
    (async () => {
      await graphStore.fetchGraphData(Number(optselected.value));
      graphStore.setSelectedOption(Number(optselected.value));
      console.log(graphStore.nodes);
      nodes.value = graphStore.nodes;
      edges.value = graphStore.edges;
    })();
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
button {
  background: green;
  border-radius: 5px;
  padding: 5px 10px;
  margin-top: 20px;
  color: white;
  cursor: pointer;
}

button:disabled {
  background: rgb(70, 107, 70);
  color: rgb(46, 46, 46);
  cursor: not-allowed;
}
</style>
