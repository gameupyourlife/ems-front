import { JSX } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";

export default function StatsCard({ title, value, description, icon }: { title: string, value: string | number, description: string, icon?: JSX.Element }) {
 
    return (
        <Card>
            <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium"> {icon ?
                    <div className="flex items-center gap-2">
                        {icon} {title}
                    </div> : title
                }  
                </CardTitle>
            </CardHeader>
            <CardContent>
                <div className="text-2xl font-bold">{value}</div>
                <p className="text-xs text-muted-foreground">{description}</p>
            </CardContent>
        </Card>
    )
}