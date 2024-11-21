<template>
  <div class="container">
    <canvas ref="canvas" class="canvas"></canvas>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="draggable"
      :style="{
        top: (item.y + offsetPan.y + 0) * scale + 'px',
        left: (item.x + offsetPan.x + 20) * scale + 'px',
        transform: 'scale(' + scale + ')',
      }"
      @mousedown="startDrag(index, $event)"
    >
      {{ item.nombre }}
    </div>

    <div class="controls">
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>

      <button @click="panUp">↑</button>
      <button @click="panLeft">←</button>
      <button @click="panDown">↓</button>
      <button @click="panRight">→</button>

      <button @click="drawShortestPath">Mostrar camino</button>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useGraphStore } from "../stores/graph.store";
import { ref, onMounted, watch } from "vue";

//useGraphStore().fetchGraphData();
const items = ref(useGraphStore().nodes);
const connections = ref(useGraphStore().edges);
const draggingIndex = ref<number | null>(null);
const offset = ref({ x: 0, y: 0 });

const scale = ref(1);
const offsetPan = ref({ x: 0, y: 0 });

const canvas = ref<HTMLCanvasElement | null>(null);

const startDrag = (index: number, event: MouseEvent) => {
  draggingIndex.value = index;

  const item = items.value[index];
  offset.value = {
    x: event.clientX - item.x,
    y: event.clientY - item.y,
  };

  document.addEventListener("mousemove", onDrag);
  document.addEventListener("mouseup", stopDrag);
};

const onDrag = (event: MouseEvent) => {
  if (draggingIndex.value === null) return;

  const item = items.value[draggingIndex.value];
  item.x = event.clientX - offset.value.x;
  item.y = event.clientY - offset.value.y;

  drawConnections();
};

const stopDrag = () => {
  draggingIndex.value = null;

  document.removeEventListener("mousemove", onDrag);
  document.removeEventListener("mouseup", stopDrag);
};

const drawConnections = () => {
  const ctx = canvas.value?.getContext("2d");
  if (!ctx) return;

  // Limpiar el canvas antes de dibujar
  if (canvas.value)
    ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

  // Dibuja las conexiones ajustando las posiciones por el zoom y panning
  connections.value.forEach((connection) => {
    const item1 = items.value.find((item) => item.id === connection.v1);
    const item2 = items.value.find((item) => item.id === connection.v2);

    if (item1 && item2) {
      // Ajustamos las posiciones por el zoom y el panning
      const x1 = (item1.x + 50 + offsetPan.value.x) * scale.value;
      const y1 = (item1.y + 25 + offsetPan.value.y) * scale.value;
      const x2 = (item2.x + 50 + offsetPan.value.x) * scale.value;
      const y2 = (item2.y + 25 + offsetPan.value.y) * scale.value;

      // Determinamos el color de la arista
      const color = connection.color || "#808080a8"; // Color por defecto si no tiene color

      // Dibuja la línea
      ctx.beginPath();
      ctx.moveTo(x1, y1);
      ctx.lineTo(x2, y2);
      ctx.strokeStyle = color; // Usamos el color asignado
      ctx.lineWidth = 2; // Grosor de la línea
      ctx.stroke();

      // Calculamos el punto medio de la línea
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      // Dibuja el ID de la línea en el centro de la línea
      ctx.fillStyle = "#000000"; // Color del texto (ID)
      ctx.font = "14px Arial";
      ctx.fillText(connection.ponderacion.toString(), midX, midY);
    }
  });
};

const zoomIn = () => {
  scale.value += 0.1;
  drawConnections();
};

const zoomOut = () => {
  scale.value -= 0.1;
  drawConnections();
};

const panUp = () => {
  offsetPan.value.y -= 20;
  drawConnections();
};

const panLeft = () => {
  offsetPan.value.x -= 20;
  drawConnections();
};

const panDown = () => {
  offsetPan.value.y += 20;
  drawConnections();
};

const panRight = () => {
  offsetPan.value.x += 20;
  drawConnections();
};

const drawShortestPath = () => {
  const edgesPath = useGraphStore().edges.filter((edge) => {
    for (let i = 0; i < useGraphStore().shortestPath.length - 1; i++) {
      const node1 = useGraphStore().shortestPath[i];
      const node2 = useGraphStore().shortestPath[i + 1];

      if (
        (edge.v1 === node1 && edge.v2 === node2) ||
        (edge.v1 === node2 && edge.v2 === node1)
      ) {
        return true;
      }
    }
    return false;
  });

  console.log("edges path", edgesPath);

  edgesPath.forEach((connection) => {
    connection.color = "#a70000";
  });

  drawConnections();
};

const changeRandomEdgeColor = () => {
  const randomEdges = connections.value
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  randomEdges.forEach((connection) => {
    connection.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  });

  drawConnections();
};

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = window.innerWidth;
    canvas.value.height = window.innerHeight;
    drawConnections();
  }
});

watch(useGraphStore(), () => {
  items.value = useGraphStore().nodes;
  connections.value = useGraphStore().edges;
});

watch(
  [items, connections],
  () => {
    drawConnections();
  },
  { deep: true }
);
// watch(items, () => {
//   drawConnections();
// });
</script>

<style scoped>
.container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: hidden;
}

.canvas {
  position: absolute;
  top: 0;
  left: 0;
  z-index: 0;
}

.draggable {
  position: absolute;
  background-color: #e0e0e0;
  padding: 10px;
  border-radius: 5px;
  cursor: pointer;
  z-index: 1;
  transition: transform 0.2s ease;
}

.controls {
  position: absolute;
  top: 10px;
  left: 10px;
  z-index: 2;
  display: flex;
  flex-direction: column;
  gap: 10px;
  background: rgba(255, 255, 255, 0.7);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 0 10px rgba(0, 0, 0, 0.2);
}

button {
  background-color: #4caf50;
  color: white;
  border: none;
  padding: 10px;
  margin: 5px;
  border-radius: 5px;
  cursor: pointer;
  font-size: 14px;
  transition: background-color 0.2s;
}

button:hover {
  background-color: #45a049;
}
</style>
