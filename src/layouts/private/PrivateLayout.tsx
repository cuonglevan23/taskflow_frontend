"use client";

import { PrivateLayoutProps } from "../types";
import { PrivateLayoutProvider } from "./context/PrivateLayoutContext";
import PrivateLayoutContent from "./components/PrivateLayoutContent";

export default function PrivateLayout(props: PrivateLayoutProps) {
  return (
    <PrivateLayoutProvider>
      <PrivateLayoutContent {...props} />
    </PrivateLayoutProvider>
  );
}
