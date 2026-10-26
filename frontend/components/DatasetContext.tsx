
"use client";

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
  type ReactNode,
  type Dispatch,
  type SetStateAction,
} from "react";

export type DatasetProfile = {
  rows?: number;
  columns?: number;
  column_details?: Array<{
    name: string;
    data_type?: string;
    statistics?: Record<string, unknown> | null;
    unique_values?: number;
  }>;
  quality?: {
    status?: string;
    warnings?: Array<{
      message: string;
      count?: number;
    }>;
  };
  [key: string]: unknown;
};

export type Dataset = {
  filename: string;
  message?: string;
  profile: DatasetProfile;
  preview: Record<string, unknown>[];
  analysis?: Record<string, unknown>;
};

type DatasetContextType = {
  dataset: Dataset | null;
  setDataset: Dispatch<SetStateAction<Dataset | null>>;
  clearDataset: () => void;
};

const DatasetContext = createContext<DatasetContextType | undefined>(
  undefined
);

export function DatasetProvider({
  children,
}: {
  children: ReactNode;
}) {
  const [dataset, setDataset] = useState<Dataset | null>(null);

  const clearDataset = useCallback(() => {
    setDataset(null);
  }, []);

  const contextValue = useMemo(
    () => ({
      dataset,
      setDataset,
      clearDataset,
    }),
    [dataset, clearDataset]
  );

  return (
    <DatasetContext.Provider value={contextValue}>
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset(): DatasetContextType {
  const context = useContext(DatasetContext);

  if (!context) {
    throw new Error(
      "useDataset must be used inside a DatasetProvider."
    );
  }

  return context;
}
