'use client';

import * as React from "react";
import { ToastActionElement, type ToastProps } from "@/components/ui/toast";

const TOAST_LIMIT = 1;
const TOAST_REMOVE_DELAY = 1000000;

type ToasterToast = ToastProps & {
  id: string;
  title?: React.ReactNode;
  description?: React.ReactNode;
  action?: ToastActionElement;
};

type ActionTypes = 'ADD_TOAST' | 'UPDATE_TOAST' | 'DISMISS_TOAST' | 'REMOVE_TOAST';

interface Action {
  type: ActionTypes;
  toast?: Partial<ToasterToast>;
  toastId?: string;
}

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
    dispatch({
      type: "REMOVE_TOAST",
      toastId: toastId,
    });
  }, TOAST_REMOVE_DELAY);

  toastTimeouts.set(toastId, timeout);
};

export const reducer = (state: State, action: Action): State => {
  switch (action.type) {
    case "ADD_TOAST":
      return {
        ...state,
        toasts: [action.toast as ToasterToast, ...state.toasts].slice(0, TOAST_LIMIT),
      };
    case "UPDATE_TOAST":
      return {
        ...state,
        toasts: state.toasts.map(t => t.id === action.toastId ? { ...t, ...action.toast } : t),
      };
    case "DISMISS_TOAST":
      addToRemoveQueue(action.toastId!); // Assume action.toastId is always defined here
      return {
        ...state,
        toasts: state.toasts.map(t => t.id === action.toastId ? { ...t, open: false } : t),
      };
    case "REMOVE_TOAST":
      return {
        ...state,
        toasts: state.toasts.filter(t => t.id !== action.toastId),
      };
  }
};

let memoryState: State = { toasts: [] };

function dispatch(action: Action) {
  memoryState = reducer(memoryState, action);
  listeners.forEach(listener => listener(memoryState));
}

const listeners: Array<(state: State) => void> = [];

function toast(props: ToasterToast) {
  const id = props.id || genId();

  dispatch({
    type: "ADD_TOAST",
    toast: { ...props, id, open: true },
  });

  return {
    id,
    update: (updateProps: Partial<ToasterToast>) => dispatch({ type: "UPDATE_TOAST", toast: updateProps, toastId: id }),
    dismiss: () => dispatch({ type: "DISMISS_TOAST", toastId: id })
  };
}

function useToast() {
  const [state, setState] = React.useState(memoryState);

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
    dismiss: (toastId?: string) => dispatch({ type: "DISMISS_TOAST", toastId }),
  };
}

function genId() {
  return Math.random().toString(36).substring(7);
}

export { useToast, toast };
