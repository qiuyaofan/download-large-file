import { ref } from 'vue';

export const useModalVisible = () => {
  const modalVisble = ref(false);
  const showModal = () => {
    modalVisble.value = true;
  };
  const hideModal = () => {
    modalVisble.value = false;
  };
  return {
    modalVisble,
    showModal,
    hideModal,
  };
};

export const useEditModalVisible = () => {
  const editId = ref('');
  const editData = ref();
  const { modalVisble, showModal, hideModal } = useModalVisible();
  const hideEditModal = () => {
    hideModal();
    editId.value = '';
  };
  const showEditModal = (id: string, record?: any) => {
    editId.value = id;
    editData.value = record;
    showModal();
  };
  return {
    modalVisble,
    editId,
    editData,
    showEditModal,
    showModal,
    hideModal: hideEditModal,
  };
};
