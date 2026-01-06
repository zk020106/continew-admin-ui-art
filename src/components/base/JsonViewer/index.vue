<script setup lang="ts">
  import { computed, ref } from 'vue'

  import JsonNode from './JsonNode.vue'

  interface JsonViewerTheme {
    key?: string
    keyDark?: string
    string?: string
    stringDark?: string
    number?: string
    numberDark?: string
    boolean?: string
    booleanDark?: string
    null?: string
    nullDark?: string
    bracket?: string
    bracketDark?: string
    bg?: string
    bgDark?: string
    border?: string
    borderDark?: string
  }

  const props = withDefaults(
    defineProps<{
      json: string
      defaultExpanded?: boolean
      theme?: JsonViewerTheme
    }>(),
    {
      defaultExpanded: true
    }
  )

  const rootNode = ref<InstanceType<typeof JsonNode> | null>(null)

  const parsedJSON = computed(() => {
    try {
      return JSON.parse(props.json)
    } catch {
      return null
    }
  })

  const parseError = computed(() => {
    if (parsedJSON.value === null && props.json.trim()) {
      return 'Invalid JSON format'
    }
    return null
  })

  const themeStyles = computed(() => {
    if (!props.theme) {
      return {}
    }

    const styles: Record<string, string> = {}
    const themeMap = {
      key: '--json-key',
      keyDark: '--json-key-dark',
      string: '--json-string',
      stringDark: '--json-string-dark',
      number: '--json-number',
      numberDark: '--json-number-dark',
      boolean: '--json-boolean',
      booleanDark: '--json-boolean-dark',
      null: '--json-null',
      nullDark: '--json-null-dark',
      bracket: '--json-bracket',
      bracketDark: '--json-bracket-dark',
      bg: '--json-bg',
      bgDark: '--json-bg-dark',
      border: '--json-border',
      borderDark: '--json-border-dark'
    }

    for (const [key, cssVar] of Object.entries(themeMap)) {
      const value = props.theme[key as keyof JsonViewerTheme]
      if (value) {
        styles[cssVar] = value
      }
    }
    return styles
  })

  function expandAll() {
    rootNode.value?.expandAll()
  }

  function collapseAll() {
    rootNode.value?.collapseAll()
  }

  async function copyJson() {
    try {
      await navigator.clipboard.writeText(JSON.stringify(parsedJSON.value))
      return Promise.resolve(true)
    } catch (err) {
      return Promise.reject(err)
    }
  }

  defineExpose({
    expandAll,
    collapseAll,
    copyJson
  })
</script>

<template>
  <div class="json-viewer" :style="themeStyles">
    <div v-if="parseError" class="json-error flex items-center gap-2">
      <span>⚠️ {{ parseError }}</span>
    </div>
    <JsonNode
      v-else
      ref="rootNode"
      :value="parsedJSON"
      :key-name="null"
      :depth="0"
      :default-expanded="defaultExpanded"
    />
  </div>
</template>
