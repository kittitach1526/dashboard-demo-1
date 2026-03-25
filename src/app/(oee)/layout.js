import OEEFrame from "@/components/oee/layout/OEEFrame";

export const dynamic = "force-dynamic";

export default function OEELayout({ children }) {
  return (
    <OEEFrame>{children}</OEEFrame>
  );
}
