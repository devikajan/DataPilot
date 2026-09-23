"use client";

import { createContext, useContext, useState } from "react";

type Dataset = {
  filename: string;
  message: string;
  profile: any;
  preview: any[];
  analysis?: any;
};

type DatasetContextType = {
  dataset: Dataset | null;
  setDataset: (dataset: Dataset) => void;
};

const DatasetContext = createContext<DatasetContextType | undefined>(
  undefined
);

export function DatasetProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  const [dataset, setDataset] = useState<Dataset | null>(null);

  return (
    <DatasetContext.Provider
      value={{
        dataset,
        setDataset,
      }}
    >
      {children}
    </DatasetContext.Provider>
  );
}

export function useDataset() {
  const context = useContext(DatasetContext);

  if (!context) {
    throw new Error("useDataset must be used inside DatasetProvider");
  }

  return context;
}