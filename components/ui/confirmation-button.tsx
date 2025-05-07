"use client";;
import * as React from "react";
import { Button } from "@/components/ui/button";
import {
    AlertDialog,
    AlertDialogAction,
    AlertDialogCancel,
    AlertDialogContent,
    AlertDialogDescription,
    AlertDialogFooter,
    AlertDialogHeader,
    AlertDialogTitle,
} from "@/components/ui/alert-dialog";

interface ConfirmationButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  confirmTitle?: string;
  confirmDescription?: string;
  confirmText?: string;
  cancelText?: string;
  onConfirm: () => void;
  buttonProps?: React.ComponentProps<"button">;
  variant?: "default" | "destructive" | "outline" | "secondary" | "ghost" | "link";
  size?: "default" | "sm" | "lg" | "icon";
}

const ConfirmationButton = React.forwardRef<HTMLButtonElement, ConfirmationButtonProps>(
  (
    {
      children,
      className,
      confirmTitle = "Bist du sicher?",
      confirmDescription = "Diese Aktion kann nicht rückgängig gemacht werden.",
      confirmText = "Bestätigen",
      cancelText = "Abbrechen",
      onConfirm,
      variant = "default",
      size,
      ...props
    },
    ref
  ) => {
    const [open, setOpen] = React.useState(false);

    const handleConfirm = () => {
      onConfirm();
      setOpen(false);
    };

    return (
      <>
        <Button
          ref={ref}
          className={className}
          variant={variant}
          size={size}
          onClick={() => setOpen(true)}
          {...props}
        >
          {children}
        </Button>
        <AlertDialog open={open} onOpenChange={setOpen}>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>{confirmTitle}</AlertDialogTitle>
              <AlertDialogDescription>{confirmDescription}</AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>{cancelText}</AlertDialogCancel>
              <AlertDialogAction onClick={handleConfirm}>{confirmText}</AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </>
    );
  }
);

ConfirmationButton.displayName = "ConfirmationButton";

export { ConfirmationButton };