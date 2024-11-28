<template>
  <div v-if="isVisible" class="loading-overlay">
    <div class="spinner"></div>
    <h3>
      Buscando el camino más corto<span>{{ animatedDots }}</span>
    </h3>
  </div>
</template>

<script setup lang="ts">
import { computed, ref, onMounted, onUnmounted } from "vue";
import { useGraphStore } from "../stores/graph.store";

const graphStore = useGraphStore();
const isVisible = computed(() => graphStore.isLoading);

// Control de los puntos animados
const dots = ref("");
let intervalId: ReturnType<typeof setInterval> | null = null;

onMounted(() => {
  // Animar los puntos cada segundo
  intervalId = setInterval(() => {
    dots.value = dots.value.length < 3 ? dots.value + "." : "."; // Reiniciar al cuarto segundo
  }, 1000); // Cambia cada segundo
});

onUnmounted(() => {
  // Limpiar el intervalo cuando el componente se desmonte
  if (intervalId) {
    clearInterval(intervalId);
  }
});

const animatedDots = computed(() => dots.value);
</script>

<style scoped>
.loading-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.5);
  display: flex;
  flex-direction: column;
  justify-content: center;
  align-items: center;
  z-index: 9999;
}

.spinner {
  width: 50px;
  height: 50px;
  border: 5px solid transparent;
  border-top: 5px solid #4caf50;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

h3 {
  color: white;
  font-size: 1.5rem;
  margin-top: 1rem;
  text-align: center;
}

@keyframes spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}
</style>
