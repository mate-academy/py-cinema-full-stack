<template>
<div class="image-uploader">
  <div class="label">Choose image</div>
  <input class="custom-file-input" type="file" accept=".png, .jpg, .jpeg" ref="inputEl" @change="handleFile"/>
</div>
</template>

<script>
export default {
  methods: {
    handleFile () {
      this.$emit('upload', this.$refs.inputEl.files[0]);
    }
  }
};
</script>

<style scoped>
.image-uploader {
  display: flex;
  flex-direction: column;
}

.label {
  font-weight: 600;
  font-size: 18px;
  line-height: 22px;
  margin-bottom: 8px;
  user-select: none;
}

.custom-file-input {
  color: transparent;
}
.custom-file-input::-webkit-file-upload-button {
  visibility: hidden;
}
.custom-file-input::before {
  content: 'Upload';
  color: var(--main-font);
  background-color: var(--red);
  border-radius: 3px;
  outline: none;
  white-space: nowrap;
  user-select: none;
  cursor: pointer;
  height: 50px;
  display: flex;
  align-items: center;
  justify-content: center;
  font-weight: 600;
  border-radius: 10px;
}
.custom-file-input:hover::before {
  border-color: black;
}
.custom-file-input:active {
  outline: 0;
}
</style>
