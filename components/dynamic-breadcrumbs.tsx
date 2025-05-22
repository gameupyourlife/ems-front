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
import React from 'react';
import { isUUID } from '@/lib/utils';

export default function DynamicBreadcrumbs({ customEndBreadcrumb, idName }: { customEndBreadcrumb?: React.ReactNode, idName?: string }) {
    const pathname = usePathname();
    const pathSegments = pathname.split('/').filter(Boolean); // Filter out empty segments

    const breadcrumbs = pathSegments.map((segment, index) => {
        const href = '/' + pathSegments.slice(0, index + 1).join('/');
        return { href, label: segment.charAt(0).toUpperCase() + segment.slice(1) };
    });

    return (
        <Breadcrumb>
            <BreadcrumbList>

                {breadcrumbs.length === 0 && customEndBreadcrumb &&
                    <React.Fragment >
                        {customEndBreadcrumb}
                    </React.Fragment>
                }

                {breadcrumbs.map((breadcrumb, index) => (
                    index === breadcrumbs.length - 1 ? (
                        customEndBreadcrumb ? (
                            <React.Fragment key={index} >
                                {customEndBreadcrumb}
                            </React.Fragment>
                        ) : (
                            <BreadcrumbItem key={index} >
                                <BreadcrumbPage>{breadcrumb.label}</BreadcrumbPage>
                            </BreadcrumbItem>
                        )
                    ) : (
                        <React.Fragment key={index}>
                            <BreadcrumbItem>
                                <BreadcrumbLink href={breadcrumb.href} >

                                    {idName ? isUUID(breadcrumb.label) ? idName : breadcrumb.label : breadcrumb.label}
                                </BreadcrumbLink>
                            </BreadcrumbItem>
                            <BreadcrumbSeparator />
                        </React.Fragment>
                    )
                ))}
            </BreadcrumbList >
        </Breadcrumb >
    )
}