"use client";

import * as React from "react";
import type { ToastActionElement, ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

let count = 0;

function genId() {
  count = (count + 1) % Number.MAX_SAFE_INTEGER;
  return count.toString();
}

type Action =
  | { type: 'ADD_TOAST'; toast: ToasterToast }
  | { type: 'UPDATE_TOAST'; toast: Partial<ToasterToast>; toastId: string }
  | { type: 'DISMISS_TOAST'; toastId: string }
  | { type: 'REMOVE_TOAST'; toastId: string };

interface State {
  toasts: ToasterToast[];
}

const toastTimeouts = new Map<string, ReturnType<typeof setTimeout>>();

const addToRemoveQueue = (toastId: string) => {
  if (toastTimeouts.has(toastId)) {
    return;
  }

  const timeout = setTimeout(() => {
    toastTimeouts.delete(toastId);
    dispatch({ type: "REMOVE_TOAST", toastId });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return { ...state, toasts: [action.toast, ...state.toasts].slice(0, TOAST_LIMIT) };
    case "UPDATE_TOAST":
      return { ...state, toasts: state.toasts.map(t => t.id === action.toastId ? { ...t, ...action.toast } : t) };
    case "DISMISS_TOAST":
      addToRemoveQueue(action.toastId);
      return { ...state, toasts: state.toasts.map(t => t.id === action.toastId ? { ...t, open: false } : t) };
    case "REMOVE_TOAST":
      return { ...state, toasts: state.toasts.filter(t => t.id !== action.toastId) };
  }
};

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => listener(memoryState));
}

const listeners: Array<(state: State) => void> = [];

function toast(props: Omit<ToasterToast, "id">) {
  const id = genId();
  dispatch({ type: "ADD_TOAST", toast: { ...props, id, open: true } });

  return {
    id,
    update: (updateProps: Partial<ToasterToast>) => dispatch({ type: "UPDATE_TOAST", toast: updateProps, toastId: id }),
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  };
}

function useToast() {
  const [state, setState] = React.useState<State>(memoryState);

  React.useEffect(() => {
    const listener = (newState: State) => setState(newState);
    listeners.push(listener);
    return () => {
      const index = listeners.indexOf(listener);
      if (index > -1) {
        listeners.splice(index, 1);
      }
    };
  }, []);

  return {
    ...state,
    toast,
    // Ensure that dismiss is only called with a defined toastId
    dismiss: (toastId?: string) => {
      if (toastId) { // Only dispatch if toastId is not undefined
        dispatch({ type: "DISMISS_TOAST", toastId });
      } else {
        console.error("Dismiss called without a toastId."); // Optional: Handle or log the error appropriately
      }
    }
  };
}


export { useToast, toast };
