import { LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

type LogoutConfirmDialogProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  isLoggingOut?: boolean;
};

export function LogoutConfirmDialog({
  open,
  onClose,
  onConfirm,
  isLoggingOut = false,
}: LogoutConfirmDialogProps) {
  if (!open) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 p-4 backdrop-blur-sm"
      onClick={onClose}
    >
      <Card
        className="w-full max-w-sm border-white/10 bg-neutral-950 ring-white/10"
        onClick={(event) => event.stopPropagation()}
      >
        <CardHeader>
          <CardTitle className="text-white">Log out?</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <p className="text-sm text-white/70">
            Are you sure you want to log out of your account?
          </p>
          <div className="flex gap-2">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              disabled={isLoggingOut}
              className="flex-1 border-white/10 bg-white/5 text-white hover:bg-white/10"
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={onConfirm}
              disabled={isLoggingOut}
              className="flex-1 bg-rose-500 text-white hover:bg-rose-400"
            >
              <LogOut className="size-3.5" />
              {isLoggingOut ? "Logging out..." : "Log out"}
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
