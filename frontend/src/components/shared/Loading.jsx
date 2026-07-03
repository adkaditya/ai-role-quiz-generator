import { Loader2 } from "lucide-react";
import React from "react";

function Loading({ hide = false, loaderText = "Please wait..." }) {
  if (hide) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-3">
        <Loader2 className="h-10 w-10 text-indigo-600 animate-spin" />
        <p className="text-sm text-muted-foreground">{loaderText}</p>
      </div>
    );
  }
}

export default Loading;