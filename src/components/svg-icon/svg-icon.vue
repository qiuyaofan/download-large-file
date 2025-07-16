<template>
  <svg v-bind="$attrs" aria-hidden="true" class="svg-icon" :style="getStyle">
    <use :href="symbolId" />
  </svg>
</template>

<script setup lang="ts">
import { computed, type CSSProperties } from 'vue';

const props = defineProps({
  prefix: {
    type: String,
    default: 'svg-icon',
  },
  name: {
    type: String,
    required: true,
  },
  color: {
    type: String,
  },
  size: {
    type: [Number, String],
    default: 16,
  },
});
const symbolId = computed(() => `#${props.prefix}-${props.name}`);
const getStyle = computed((): CSSProperties => {
  const { size, color } = props;
  const isNumber = /^[0-9\.]+$/.test(size + '');
  const s = isNumber ? `${size}px` : size;

  return {
    width: s,
    height: s,
    color,
  };
});

// export default defineComponent({
//   name: 'SvgIcon',
//   setup(props) {
//     const symbolId = computed(() => `#${props.prefix}-${props.name}`)
//     return { symbolId }
//   },
// })
</script>
