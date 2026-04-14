import { useState, useSyncExternalStore } from 'react';
import { sampleItems, myGivenItems } from './sample-data';
import type { DonationItem } from './sample-data';

// Simple in-memory store for item statuses
const claimedIds = new Set<string>(
  sampleItems.filter(i => i.status === 'claimed').map(i => i.id)
);

let listeners: Array<() => void> = [];

function emitChange() {
  for (const listener of listeners) {
    listener();
  }
}

function subscribe(listener: () => void) {
  listeners = [...listeners, listener];
  return () => {
    listeners = listeners.filter(l => l !== listener);
  };
}

let snapshot = { ...Object.fromEntries([...claimedIds].map(id => [id, true])) };

function getSnapshot() {
  return snapshot;
}

export function markAsClaimed(itemId: string) {
  claimedIds.add(itemId);
  snapshot = { ...Object.fromEntries([...claimedIds].map(id => [id, true])) };
  emitChange();
}

export function isItemClaimed(itemId: string): boolean {
  return claimedIds.has(itemId);
}

export function useItemsClaimed() {
  return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
}

// Simulated "current user" donor IDs (items the user donated)
const myDonorItemIds = new Set(myGivenItems.map(i => i.id));

export function isMyItem(itemId: string): boolean {
  return myDonorItemIds.has(itemId);
}
