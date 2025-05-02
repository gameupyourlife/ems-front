# Frontend
Für das Frontend setzen wir mit Next.js auf React. Entsprechend den React best practises verwenden wir wiederverwendbare React-Komponenten, um die Redundanz im Code zu vermeiden. Um Zugriff auf den angemeldeten Nutzer und die ausgewählte Organisation in der gesamten Applikation zu erhalten, werden React-Kontexte eingesetzt.

## Root-Layout und globale Provider
Im Root-Layout werden zentrale Provider wie der QueryClientProvider für React Query, der ThemeProvider zur dynamischen Themenanpassung sowie der UserOrgProvider eingebunden. Die Provider ermöglichen den Zugriff auf die spezifischen Hooks, beispielsweise den useUser Hook um den aktuell angemeldeten User zu erhalten. Diese Schicht garantiert einen konsistenten globalen Zustand und ein einheitliches Erscheinungsbild. 

## Layouts und Container
Das Hauptlayout organisiert den Seiteninhalt in einer flexiblen Containerstruktur und sorgt so für eine responsive Darstellung. Die Anordnung der Sidebar, Kopfzeile, Content-Bereich und anderer UI-Elemente erfolgt über klar definierte Komponenten, die den statischen Aufbau der Seite widerspiegeln. Dies verhindert ebenfalls Redundanz und sorgt für ein einheitliches Page Design

## Wiederverwendbare UI-Komponenten
Danke ShadCn welches auf Radix Primitives basiert sind Elemente wie Cards, Buttons, Badges, Tabellen und Dialoge werden in eigenen wiederverwendbaren Komponenten umgesetzt. Diese Komponenten sind stark parametrisiert und erlauben so eine flexible Wiederverwendung in unterschiedlichen Kontexten (z.B. in Event-Übersichten, Flow-Dashboards oder Dateiverwaltungen).

## Utility-First CSS mit Tailwind
Die Gestaltung erfolgt überwiegend über Tailwind CSS, wodurch statische Layouts durch Utility-Klassen direkt in den JSX-Komponenten definiert werden. Dies ermöglicht eine schnelle Iteration und klare Trennung von Design und Logik.

## Modulares Routing
Das Frontend folgt der Next.js-"app"-Struktur, in der einzelne Seiten und Teilbereiche (z.B. Events, Flows, Dateien) in eigenen Routing Modulen realisiert werden. Diese statische Ordnerstruktur unterstützt eine klare Trennung der Verantwortlichkeiten und verbessert die Übersichtlichkeit.

## API
Um mit der API zu interagieren, verwenden wir TanStack Query für das Verwaltung von Lade- und Fehlerzuständen. Aus Gründen der Entwicklerfreundlichkeit wird jeder mögliche API-Request in einem Client gekapselt, der dann die TanStack-Query-Schnittstelle mittels eines Hooks bereitstellt.

