<template>
  <div />
</template>

<script setup lang="ts">

const notes = ref([])
const add_note = ref('')
const url = '....../notes' // 调用的接口

const getNotes = async() => {
  const resp = await axios.get(url)
  notes.value = resp.data
}

const addNote = async() => {
  await axios.post(url, {
    create_time: new Date().toLocaleString(),
    content: add_note.value,
  })
  add_note.value = ''
  getNotes()
}

const deleteNote = async(id) => {
  await axios.delete(`${url}/${id}`)
  getNotes()
}

onMounted(getNotes)
</script>
