import React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

const WarningDialog = React.memo(({
  open,
  message,
  countdown,
  onContinue,
}) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/70 backdrop-blur-sm">
      <div className="w-[420px] rounded-2xl bg-white dark:bg-zinc-900 shadow-2xl p-6">

        <div className="flex justify-center">
          <AlertTriangle
            className="text-red-500"
            size={60}
          />
        </div>

        <h2 className="mt-4 text-2xl font-bold text-center">
          Warning
        </h2>

        <p className="mt-4 text-center text-gray-600 dark:text-gray-300">
          {message}
        </p>

        <div className="mt-6 flex justify-center">
          <div className="h-20 w-20 rounded-full bg-red-600 flex items-center justify-center text-3xl font-bold text-white">
            {countdown}
          </div>
        </div>

        <p className="text-center mt-4 text-sm text-red-500">
          Quiz will be automatically submitted.
        </p>

        <Button
          className="w-full mt-6"
          onClick={onContinue}
        >
          Return to Quiz
        </Button>

      </div>
    </div>
  );
});

WarningDialog.displayName = "WarningDialog";

export default WarningDialog;