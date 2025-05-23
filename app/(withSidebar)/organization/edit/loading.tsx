export default function Page() {
    return (
        <div className="flex flex-1 items-center justify-center p-4 md:p-6">
            <div className="flex flex-col items-center space-y-2 text-center">
                <h1 className="text-2xl font-bold">Lädt...</h1>
                <p className="text-sm text-muted-foreground">
                    Bitte warten Sie, während wir die Daten laden.
                </p>
            </div>
        </div>
    )
}