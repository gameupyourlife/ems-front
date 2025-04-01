import NavEvents from "@/components/user/usr-event-layout";

export default function Page() {

    return (
        <div>
            <div className="flex items-center justify-between px-6 pt-4">
                <h1 className="text-2xl font-bold">Anstehende Events</h1>
            </div>
            <div className="flex flex-1 flex-col">
                <div className="@container/main flex flex-1 flex-col gap-2">
                    <div className="flex flex-col gap-4 py-2 md:gap-6 md:py-4">
                        <NavEvents />
                    </div>
                </div>
            </div>
        </div>
    )
}