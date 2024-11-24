<template>
  <div class="container">
    <canvas ref="canvas" class="canvas"></canvas>

    <div
      v-for="(item, index) in items"
      :key="index"
      class="draggable"
      :style="{
        top: (item.y + offsetPan.y + 0) * scale + 'px',
        left: (item.x + offsetPan.x + 30) * scale + 'px',
        transform: 'scale(' + scale + ')',
      }"
      @mousedown="startDrag(index, $event)"
      @mouseenter="onHover(item)"
      @mouseleave="onHoverEnd"
    >
      {{ item.id }}
    </div>

    <!-- <div class="controls">
      <button @click="zoomIn">Zoom In</button>
      <button @click="zoomOut">Zoom Out</button>

      <button @click="panUp">↑</button>
      <button @click="panLeft">←</button>
      <button @click="panDown">↓</button>
      <button @click="panRight">→</button>

      <button @click="drawShortestPath">Mostrar camino</button>
    </div> -->

    <div
      v-if="hoveredNode && showDetails"
      class="tooltip"
      :style="{ top: tooltipPosition.y + 'px', left: tooltipPosition.x + 'px' }"
    >
      {{ hoveredNode.nombre }}
    </div>

    <div class="toolbar">
      <button @click="saveGraph" title="Save">
        <i class="bi bi-floppy"></i>
      </button>
      <button
        @click="setTool('zoomIn')"
        :class="{ active: tool === 'zoomIn' }"
        title="Zoom In"
      >
        <i class="bi bi-zoom-in"></i>
      </button>
      <button
        @click="setTool('zoomOut')"
        :class="{ active: tool === 'zoomOut' }"
        title="Zoom Out"
      >
        <i class="bi bi-zoom-out"></i>
      </button>
      <button
        @click="setTool('pan')"
        :class="{ active: tool === 'pan' }"
        title="Pan"
      >
        <i class="bi bi-arrows-move"></i>
      </button>
      <button @click="drawShortestPath" title="Mostrar camino">
        <i class="bi bi-graph-up"></i>
      </button>
      <div class="checkbox-control">
        <input type="checkbox" id="show-details" v-model="showDetails" />
        <label for="show-details">Mostrar detalles</label>
      </div>
      <div class="checkbox-control">
        <input type="checkbox" id="block-drag-node" v-model="blockNodes" />
        <label for="block-drag-node">Bloquear nodos</label>
      </div>
    </div>
  </div>
</template>

<script lang="ts" setup>
import { useGraphStore } from "../stores/graph.store";
import { ref, onMounted, watch, onUnmounted } from "vue";

const needRedraw = ref(false);
const blockNodes = ref(false);
const showDetails = ref(false); // Estado del checkbox
const hoveredNode = ref<{ id: number; nombre: string } | null>(null); // Nodo actualmente bajo hover
const tooltipPosition = ref({ x: 0, y: 0 }); // Posición del tooltip
//useGraphStore().fetchGraphData();
const items = ref(useGraphStore().nodes);
const connections = ref(useGraphStore().edges);
const draggingIndex = ref<number | null>(null);
const offset = ref({ x: 0, y: 0 });

const scale = ref(1);
const offsetPan = ref({ x: 0, y: 0 });

const canvas = ref<HTMLCanvasElement | null>(null);

const saveGraph = async () => {
  // await useGraphStore().saveGraph();
};

const onHover = (node: { id: number; nombre: string }) => {
  if (!showDetails.value) return;
  hoveredNode.value = node;
  tooltipPosition.value = {
    x: (node.x + offsetPan.value.x) * scale.value + 70,
    y: (node.y + offsetPan.value.y) * scale.value + 50,
  };
};

const onHoverEnd = () => {
  hoveredNode.value = null;
};

const startDrag = (index: number, event: MouseEvent) => {
  if (blockNodes.value) return;
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

  // Crear un mapa para identificar conexiones compartidas por los caminos más corto y segundo más corto
  const edgesShortestPath = new Set(
    useGraphStore().edges.filter((edge) => {
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
    })
  );

  const edgesSecondShortestPath = new Set(
    useGraphStore().edges.filter((edge) => {
      for (let i = 0; i < useGraphStore().secondShortestPath.length - 1; i++) {
        const node1 = useGraphStore().secondShortestPath[i];
        const node2 = useGraphStore().secondShortestPath[i + 1];
        if (
          (edge.v1 === node1 && edge.v2 === node2) ||
          (edge.v1 === node2 && edge.v2 === node1)
        ) {
          return true;
        }
      }
      return false;
    })
  );

  connections.value.forEach((connection) => {
    const item1 = items.value.find((item) => item.id === connection.v1);
    const item2 = items.value.find((item) => item.id === connection.v2);

    if (item1 && item2) {
      // Ajustamos las posiciones por el zoom y el panning
      const x1 = (item1.x + 50 + offsetPan.value.x) * scale.value;
      const y1 = (item1.y + 25 + offsetPan.value.y) * scale.value;
      const x2 = (item2.x + 50 + offsetPan.value.x) * scale.value;
      const y2 = (item2.y + 25 + offsetPan.value.y) * scale.value;

      const dx = x2 - x1;
      const dy = y2 - y1;
      const length = Math.sqrt(dx * dx + dy * dy);
      const offset = 1; // Distancia entre las líneas paralelas
      const offsetX = (dy / length) * offset;
      const offsetY = (-dx / length) * offset;

      ctx.beginPath();
      ctx.moveTo(x1 + offsetX, y1 + offsetY);
      ctx.lineTo(x2 + offsetX, y2 + offsetY);
      ctx.strokeStyle = "#1d1d1d80"; // Color del camino más corto
      ctx.lineWidth = 2;
      ctx.stroke();

      // Calculamos el punto medio de la línea
      const midX = (x1 + x2) / 2;
      const midY = (y1 + y2) / 2;

      // Dibuja el ID de la línea en el centro de la línea
      ctx.fillStyle = "#000000"; // Color del texto (ID)
      ctx.font = "14px Arial";
      ctx.fillText(connection.ponderacion.toString(), midX, midY);

      // Dibujar línea para el camino más corto
      if (edgesShortestPath.has(connection)) {
        ctx.beginPath();
        ctx.moveTo(x1 + offsetX, y1 + offsetY);
        ctx.lineTo(x2 + offsetX, y2 + offsetY);
        ctx.strokeStyle = "#a7000080"; // Color del camino más corto
        ctx.lineWidth = 2;
        ctx.stroke();
      }

      // Dibujar línea para el segundo camino más corto
      if (edgesSecondShortestPath.has(connection)) {
        ctx.beginPath();
        ctx.moveTo(x1 - offsetX, y1 - offsetY);
        ctx.lineTo(x2 - offsetX, y2 - offsetY);
        ctx.strokeStyle = "#004d0080"; // Color del segundo camino más corto
        ctx.lineWidth = 2;
        ctx.stroke();
      }
    }
  });
};

// const drawConnections = () => {
//   const ctx = canvas.value?.getContext("2d");
//   if (!ctx) return;

//   // Limpiar el canvas antes de dibujar
//   if (canvas.value)
//     ctx.clearRect(0, 0, canvas.value.width, canvas.value.height);

//   // Dibuja las conexiones ajustando las posiciones por el zoom y panning
//   connections.value.forEach((connection) => {
//     const item1 = items.value.find((item) => item.id === connection.v1);
//     const item2 = items.value.find((item) => item.id === connection.v2);

//     if (item1 && item2) {
//       // Ajustamos las posiciones por el zoom y el panning
//       const x1 = (item1.x + 50 + offsetPan.value.x) * scale.value;
//       const y1 = (item1.y + 25 + offsetPan.value.y) * scale.value;
//       const x2 = (item2.x + 50 + offsetPan.value.x) * scale.value;
//       const y2 = (item2.y + 25 + offsetPan.value.y) * scale.value;

//       // Determinamos el color de la arista
//       const color = connection.color || "#808080a8"; // Color por defecto si no tiene color

//       // Dibuja la línea
//       ctx.beginPath();
//       ctx.moveTo(x1, y1);
//       ctx.lineTo(x2, y2);
//       ctx.strokeStyle = color; // Usamos el color asignado
//       ctx.lineWidth = 2; // Grosor de la línea
//       ctx.stroke();

//       // Calculamos el punto medio de la línea
//       const midX = (x1 + x2) / 2;
//       const midY = (y1 + y2) / 2;

//       // Dibuja el ID de la línea en el centro de la línea
//       ctx.fillStyle = "#000000"; // Color del texto (ID)
//       ctx.font = "14px Arial";
//       ctx.fillText(connection.ponderacion.toString(), midX, midY);
//     }
//   });
// };

const drawShortestPath = () => {
  const graphStore = useGraphStore();

  // Encontrar las conexiones para el camino más corto
  const edgesShortestPath = graphStore.edges.filter((edge) => {
    for (let i = 0; i < graphStore.shortestPath.length - 1; i++) {
      const node1 = graphStore.shortestPath[i];
      const node2 = graphStore.shortestPath[i + 1];

      if (
        (edge.v1 === node1 && edge.v2 === node2) ||
        (edge.v1 === node2 && edge.v2 === node1)
      ) {
        return true;
      }
    }
    return false;
  });

  // Encontrar las conexiones para el segundo camino más corto
  const edgesSecondShortestPath = graphStore.edges.filter((edge) => {
    for (let i = 0; i < graphStore.secondShortestPath.length - 1; i++) {
      const node1 = graphStore.secondShortestPath[i];
      const node2 = graphStore.secondShortestPath[i + 1];

      if (
        (edge.v1 === node1 && edge.v2 === node2) ||
        (edge.v1 === node2 && edge.v2 === node1)
      ) {
        return true;
      }
    }
    return false;
  });

  // Asignar colores a las conexiones del camino más corto
  edgesShortestPath.forEach((connection) => {
    connection.color = "#a70000"; // Rojo oscuro
  });

  // Asignar colores a las conexiones del segundo camino más corto
  edgesSecondShortestPath.forEach((connection) => {
    connection.color = "#004d00"; // Verde oscuro
  });

  // Dibujar todas las conexiones con los nuevos colores
  drawConnections();
};

// const drawShortestPath = () => {
//   const edgesShortestPath = useGraphStore().edges.filter((edge) => {
//     for (let i = 0; i < useGraphStore().shortestPath.length - 1; i++) {
//       const node1 = useGraphStore().shortestPath[i];
//       const node2 = useGraphStore().shortestPath[i + 1];

//       if (
//         (edge.v1 === node1 && edge.v2 === node2) ||
//         (edge.v1 === node2 && edge.v2 === node1)
//       ) {
//         return true;
//       }
//     }
//     return false;
//   });
//   const edgesSecondShortestPath = useGraphStore().edges.filter((edge) => {
//     for (let i = 0; i < useGraphStore().secondShortestPath.length - 1; i++) {
//       const node1 = useGraphStore().secondShortestPath[i];
//       const node2 = useGraphStore().secondShortestPath[i + 1];

//       if (
//         (edge.v1 === node1 && edge.v2 === node2) ||
//         (edge.v1 === node2 && edge.v2 === node1)
//       ) {
//         return true;
//       }
//     }
//     return false;
//   });

//   console.log("edges path", edgesShortestPath);

//   edgesShortestPath.forEach((connection) => {
//     connection.color = "#a70000";
//   });
//   edgesSecondShortestPath.forEach((connection) => {
//     connection.color = "##004d00";
//   });

//   drawConnections();
// };

const changeRandomEdgeColor = () => {
  const randomEdges = connections.value
    .sort(() => 0.5 - Math.random())
    .slice(0, 3);

  randomEdges.forEach((connection) => {
    connection.color = "#" + Math.floor(Math.random() * 16777215).toString(16);
  });

  drawConnections();
};

const tool = ref<string | null>(null);

const setTool = (selectedTool: string) => {
  tool.value = selectedTool;
  canvas.value?.classList.toggle("zoom-in-cursor", selectedTool === "zoomIn");
  canvas.value?.classList.toggle("zoom-out-cursor", selectedTool === "zoomOut");
  canvas.value?.classList.toggle("pan-cursor", selectedTool === "pan");
};

// Manejar click para zoom in/zoom out
const handleCanvasClick = (event: MouseEvent) => {
  if (!canvas.value) return;

  const rect = canvas.value.getBoundingClientRect();
  const clickX = (event.clientX - rect.left) / scale.value - offsetPan.value.x;
  const clickY = (event.clientY - rect.top) / scale.value - offsetPan.value.y;

  if (tool.value === "zoomIn") {
    if (scale.value < 2) scale.value += 0.1;
  } else if (tool.value === "zoomOut") {
    if (scale.value > 0.5) scale.value -= 0.1;
  }

  drawConnections();
};

// Manejar pan con arrastre
const startPanning = (event: MouseEvent) => {
  if (tool.value !== "pan") return;

  offset.value = { x: event.clientX, y: event.clientY };

  const panMove = (e: MouseEvent) => {
    offsetPan.value.x += (e.clientX - offset.value.x) / scale.value;
    offsetPan.value.y += (e.clientY - offset.value.y) / scale.value;
    offset.value = { x: e.clientX, y: e.clientY };
    drawConnections();
  };

  const stopPanning = () => {
    document.removeEventListener("mousemove", panMove);
    document.removeEventListener("mouseup", stopPanning);
  };

  document.addEventListener("mousemove", panMove);
  document.addEventListener("mouseup", stopPanning);
};

onMounted(() => {
  if (canvas.value) {
    canvas.value.width = canvas.value.clientWidth * 3.5;
    canvas.value.height = canvas.value.clientHeight * 10;

    canvas.value.addEventListener("click", handleCanvasClick);
    canvas.value.addEventListener("mousedown", startPanning);

    drawConnections();
  }
});

onUnmounted(() => {
  if (canvas.value) {
    canvas.value.removeEventListener("click", handleCanvasClick);
    canvas.value.removeEventListener("mousedown", startPanning);
  }
});

watch(useGraphStore(), () => {
  items.value = useGraphStore().nodes;
  connections.value = useGraphStore().edges;
  drawConnections();
});

watch([scale, offsetPan, connections], () => {
  needRedraw.value = true;
});

// watch(
//   [items, connections],
//   () => {
//     drawConnections();
//   },
//   { deep: true }
// );
// watch(items, () => {
//   drawConnections();
// });
</script>

<style scoped>
.tooltip {
  position: absolute;
  background: #333;
  color: #fff;
  padding: 5px;
  border-radius: 5px;
  font-size: 12px;
  z-index: 10;
  pointer-events: none;
}

.checkbox-control {
  display: flex;
  align-items: center;
  gap: 5px;
}

.container {
  position: relative;
  width: 100%;
  height: 100vh;
  overflow: auto;
}

.canvas {
  position: absolute;
  top: 20px;
  left: 0;
  z-index: 0;
}

.draggable {
  width: 50;
  height: 50;
  min-width: 50;
  min-height: 50;
  display: flex;
  justify-content: center;
  align-items: center;
  position: absolute;
  background-color: #e0e0e0;
  padding: 10px;
  border-radius: 100%;
  cursor: pointer;
  z-index: 1;
  transition: transform 0.2s ease;
  user-select: none;
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

.canvas.zoom-in-cursor {
  cursor: zoom-in;
}

.canvas.zoom-out-cursor {
  cursor: zoom-out;
}

.canvas.pan-cursor {
  cursor: move;
}

/* Estilos de la barra de herramientas */
.toolbar {
  position: fixed;
  top: 10px;
  left: 50%;
  transform: translateX(-50%);
  display: flex;
  gap: 10px;
  background: rgba(255, 255, 255, 0.9);
  padding: 10px;
  border-radius: 5px;
  box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  z-index: 10;
}

.toolbar button {
  background: none;
  border: none;
  padding: 8px;
  font-size: 18px;
  cursor: pointer;
  transition: color 0.2s;
  color: gray;
}

.toolbar button.active {
  color: #4caf50;
}

.toolbar button:hover {
  color: #4caf50;
}
</style>
