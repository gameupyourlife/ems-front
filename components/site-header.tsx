import { Separator } from "@/components/ui/separator"
import { SidebarTrigger } from "@/components/ui/sidebar"
import DynamicQuickActions, { QuickAction } from "./dynamic-quick-actions"
import DynamicBreadcrumbs from "./dynamic-breadcrumbs"

export function SiteHeader({actions, children, idName}: {actions: QuickAction[], children?: React.ReactNode, idName?: string}) {
    return (
        <header className="flex h-(--header-height) shrink-0 items-center gap-2 border-b transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-(--header-height)">
            <div className="flex w-full items-center gap-1 px-4 lg:gap-2 lg:px-6">
                <SidebarTrigger className="-ml-1" />
                <Separator
                    orientation="vertical"
                    className="mx-2 data-[orientation=vertical]:h-4"
                />
                <DynamicBreadcrumbs customEndBreadcrumb={children} idName={idName} />

                <div className="ml-auto flex items-center gap-2">
                    <DynamicQuickActions actions={actions} />
                </div>
            </div>
        </header>
    )
}
