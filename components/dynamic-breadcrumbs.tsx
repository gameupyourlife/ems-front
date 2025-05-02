"use client";;
import { usePathname } from 'next/navigation';
import {
    Breadcrumb,
    BreadcrumbItem,
    BreadcrumbLink,
    BreadcrumbList,
    BreadcrumbPage,
    BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";

export default function DynamicBreadcrumbs() {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean); // Filter out empty segments

    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        return { href, label: segment.charAt(0).toUpperCase() + segment.slice(1) };
    });

    return (
        <Breadcrumb>
            <BreadcrumbList>

                {breadcrumbs.map((breadcrumb, index) => (
                    index === breadcrumbs.length - 1 ? (
                        <BreadcrumbItem key={index} >
                            <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                        </BreadcrumbItem>
                    ) : (
                        <>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={breadcrumb.href} >
                                    {breadcrumb.label}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                        </>
                    )
                ))}
            </BreadcrumbList >
        </Breadcrumb >
    )
}