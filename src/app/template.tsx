import type { ReactNode } from "react";
import { GsapRouteTransition } from "@/components/ui/gsap-route-transition";

export default function Template({ children }: { children: ReactNode }) {
  return <GsapRouteTransition>{children}</GsapRouteTransition>;
}
