import { message, Table, type TablePaginationConfig, type TableProps } from 'ant-design-vue';
import { computed, reactive, ref, unref } from 'vue';
import { useRoute, useRouter } from 'vue-router';
export const useTablePagination = () => {
  const router = useRouter();
  const route = useRoute();
  const GET_PAGINATION = () => {
    return {
      pageSize: 10,
      pageSizeOptions: ['10', '20', '50', '100'],
      showTotal: (total: number) => `共${total}条`,
      showSizeChanger: true,
      total: 0,
      current: 1,
    };
  };
  const pagination = reactive(GET_PAGINATION());

  const changeTablePagination = (pag: TablePaginationConfig, clearSelection?: () => void) => {
    if (pag.current && pag.current !== pagination.current) {
      pagination.current = pag.current;
    }
    if (pag.pageSize && pag.pageSize !== pagination.pageSize) {
      pagination.current = 1;
      pagination.pageSize = pag.pageSize;
      clearSelection && clearSelection();
    }
  };
  const formatPagination = () => ({
    pageCurrent: pagination.current + '',
    pageSize: pagination.pageSize + '',
  });
  const formatPaginationOrder = () => ({
    pageNum: pagination.current + '',
    pageSize: pagination.pageSize + '',
  });
  // 列表查询参数更新到query
  const changeQuery = (params?: { [x: string]: any }) => {
    const query: {
      [x: string]: any;
    } = {
      ...(params || {}),
    };
    if (pagination.current > 1) {
      query.current = pagination.current;
    }
    if (pagination.pageSize !== 10) {
      query.pageSize = pagination.pageSize;
    }
    router.push({
      ...route,
      query,
    });
  };
  // 根据query设置翻页配置
  const setPaginationFromQuery = () => {
    const { current, pageSize } = route.query;
    if (current) {
      pagination.current = +current;
    }
    if (pageSize) {
      pagination.pageSize = +pageSize;
    }
  };

  const setTableTotal = (value: number) => {
    pagination.total = value;
  };

  const setPaginationAfterDelete = () => {
    if (pagination.current <= 1) return;
    if ((pagination.current - 1) * pagination.pageSize + 1 === pagination.total) {
      pagination.current -= 1;
    }
  };

  return {
    changeTablePagination,
    pagination,
    formatPagination,
    formatPaginationOrder,
    changeQuery,
    setPaginationFromQuery,
    setTableTotal,
    setPaginationAfterDelete,
  };
};

export const useRowSelection = (options?: { limit?: number }) => {
  const selectedRowKeys = ref<string[]>([]); // Check here to configure the default column
  const selectRows = ref<any[]>([]);

  const onSelectChange = (changableRowKeys: string[], changableRows: any[]) => {
    const limit = options?.limit;
    if (limit && changableRowKeys.length > limit) {
      changableRowKeys = changableRowKeys.slice(0, limit);
      changableRows = changableRows.slice(0, limit);
      message.error(`已选数量最多不能超过${limit}条`);
    }
    selectedRowKeys.value = changableRowKeys;
    selectRows.value = changableRows;
  };

  const clearSelection = () => {
    selectedRowKeys.value = [];
  };

  const rowSelection = computed(() => {
    return {
      preserveSelectedRowKeys: true,
      selectedRowKeys: unref(selectedRowKeys),
      onChange: onSelectChange,
      selections: [Table.SELECTION_NONE, Table.SELECTION_INVERT],
    };
  });

  return {
    selectedRowKeys,
    selectRows,
    onSelectChange,
    clearSelection,
    rowSelection,
  };
};
