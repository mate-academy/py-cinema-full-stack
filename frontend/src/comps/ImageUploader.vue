<template>
  <div class="image-uploader">
    <div class="label">Choose image</div>
    <input
      class="custom-file-input"
      type="file"
      accept=".png, .jpg, .jpeg"
      ref="inputEl"
      @change="handleFile"
    />
    <div v-if="fileName" class="file-name">Selected: {{ fileName }}</div>
  </div>
</template>

<script>
export default {
  name: 'ImageUploader',
  // Декларуємо еміт для Vue 3
  emits: ['upload'],
  data: () => ({
    fileName: ''
  }),
  methods: {
    handleFile() {
      const file = this.$refs.inputEl.files[0];
      if (file) {
        this.fileName = file.name;
        this.$emit('upload', file);
      }
    }
  }
};
</script>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
  width: 100%;
}

.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 8px;
  user-select: none;
  color: var(--main-font);
}

.file-name {
  font-size: 14px;
  color: #888;
  margin-top: 8px;
  word-break: break-all;
}

.custom-file-input {
  color: transparent;
  width: 100%;
  cursor: pointer;
}

/* Приховуємо стандартну кнопку браузера */
.custom-file-input::-webkit-file-upload-button {
  display: none;
}

/* Стилізація власної кнопки через псевдоелемент */
.custom-file-input::before {
  content: 'Upload Poster';
  color: var(--main-font);
  background-color: var(--red);
  border-radius: 10px;
  outline: none;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  font-size: 16px;
  transition: opacity 0.2s, transform 0.1s;
}

.custom-file-input:hover::before {
  opacity: 0.9;
}

.custom-file-input:active::before {
  transform: scale(0.98);
}
