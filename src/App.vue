<template>
  <ControlPanel />
  <CanvasComponent />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CanvasComponent from "./components/CanvasComponent.vue";
import ControlPanel from "./components/ControlPanel.vue";

export default defineComponent({
  name: "App",
  components: {
    CanvasComponent,
    ControlPanel,
  },
});
</script>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
