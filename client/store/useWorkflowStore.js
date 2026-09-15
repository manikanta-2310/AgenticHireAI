import { create } from 'zustand';
import api from '../lib/api';

export const useWorkflowStore = create((set, get) => ({
  activeWorkflow: null,
  workflows: [],
  isLoading: false,
  error: null,

  fetchWorkflow: async (id) => {
    set({ isLoading: true });
    try {
      const res = await api.getWorkflow(id);
      if (res.success) {
        set({ activeWorkflow: res.data, isLoading: false, error: null });
        return res.data;
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  fetchAllWorkflows: async () => {
    set({ isLoading: true });
    try {
      const res = await api.getAllWorkflows();
      if (res.success) {
        set({ workflows: res.data, isLoading: false, error: null });
      }
    } catch (err) {
      set({ error: err.message, isLoading: false });
    }
  },

  approveCandidate: async (workflowId, action, notes) => {
    try {
      const res = await api.approveWorkflow(workflowId, action, notes);
      if (res.success) {
        await get().fetchWorkflow(workflowId);
        await get().fetchAllWorkflows();
        return res.data;
      }
    } catch (err) {
      set({ error: err.message });
      throw err;
    }
  },

  retry: async (workflowId) => {
    try {
      await api.retryWorkflow(workflowId);
      await get().fetchWorkflow(workflowId);
    } catch (err) {
      set({ error: err.message });
    }
  }
}));

export default useWorkflowStore;
