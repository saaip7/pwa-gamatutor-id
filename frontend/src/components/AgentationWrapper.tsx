"use client";

import { Agentation } from "agentation";
import { useEffect, useState } from "react";

export function AgentationWrapper() {
  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  if (!isMounted || process.env.NODE_ENV !== "development") {
    return null;
  }

  // MCP endpoint is optional if you have MCP server on default port 4747
  return <Agentation />;
}
