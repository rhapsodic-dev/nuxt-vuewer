<template>
  <div>
    basic {{ isOpened ? 'opened' : 'closed' }}
  </div>
</template>

<script setup>
import { useVuewer } from '#imports'

const { isOpened } = useVuewer({
  images: [
    'https://placehold.net/5-600x800.png',
  ],
})
</script>
