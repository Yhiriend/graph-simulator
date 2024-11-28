<template>
  <div style="width: 100%; display: flex; justify-content: start">
    <div style="width: 300px">
      <ControlPanel />
    </div>
    <hr style="margin-left: 10px" aria-orientation="vertical" />
    <CanvasComponent />
  </div>
  <LoadingComponent />
</template>

<script lang="ts">
import { defineComponent } from "vue";
import CanvasComponent from "./components/CanvasComponent.vue";
import ControlPanel from "./components/ControlPanel.vue";
import LoadingComponent from "./components/LoadingComponent.vue";

export default defineComponent({
  name: "App",
  components: {
    CanvasComponent,
    ControlPanel,
    LoadingComponent,
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
