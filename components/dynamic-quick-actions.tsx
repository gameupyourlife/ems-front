import React from "react";
import { Button } from "./ui/button";

interface QuickActionAsChild {
    children: React.ReactNode;
}

interface QuickActionAsChildProps {
    label: string;
    onClick: () => void;
    icon?: React.ReactNode;
    variant? : "default" | "outline" | "secondary";
}

export type QuickAction =
    | QuickActionAsChild
    | QuickActionAsChildProps;

interface DynamicQuickActionsProps {
    actions: QuickAction[];
}

export default function DynamicQuickActions({ actions }: DynamicQuickActionsProps) {
    return (
        <div className="flex space-x-2">
            {actions.map((action, index) => (
                // Check if action is a child component or an object with properties
                "children" in action ? (
                    <div key={index}>
                        {action.children}
                    </div>
                ) : (
                    // Render button for object with properties
                    <Button key={index} onClick={action.onClick} variant={action.variant || "default"}  className="flex items-center space-x-2">
                        {action.icon && <span>{action.icon}</span>}
                        <span>{action.label}</span>
                    </Button>
                )
            ))}
        </div>
    );
};
