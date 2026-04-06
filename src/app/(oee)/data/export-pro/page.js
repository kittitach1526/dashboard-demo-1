"use client";

import dynamic from "next/dynamic";

const DataExportProPage = dynamic(() => import("@/components/oee/pages/DataExportProPage"), { ssr: false });

export default function Page() {
  return <DataExportProPage />;
}
