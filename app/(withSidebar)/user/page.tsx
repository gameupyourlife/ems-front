"use client"

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Check, ChevronsUpDown, Save, Upload } from "lucide-react"
import { Command, CommandGroup, CommandItem } from "@/components/ui/command"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { ScrollArea } from "@/components/ui/scroll-area"
import { useState } from "react"

export default function EinstellungenPage() {
  const [selectedCategories, setSelectedCategories] = useState<string[]>([])
  const [pushNotificationsEnabled, setPushNotificationsEnabled] = useState(false)
  const [emailNotifications, setEmailNotifications] = useState({
    security: true,
    productUpdates: false,
    newsletter: false,
  })

  const toggleCategory = (category: string) => {
    setSelectedCategories((prev) =>
      prev.includes(category) ? prev.filter((c) => c !== category) : [...prev, category],
    )
  }

  const categories = [
    { value: "category1", label: "Category 1" },
    { value: "category2", label: "Category 2" },
    { value: "category3", label: "Category 3" },
  ]

  return (
    <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6 overflow-hidden">
      {/* Header */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h1 className="text-2xl font-bold">Profil Einstellungen</h1>
          <p className="text-muted-foreground">Verwalte deine persönlichen Informationen und Einstellungen</p>
        </div>
        <Button size="sm">
          <Save className="mr-2 h-4 w-4" />
          Änderungen speichern
        </Button>
      </div>

      {/* Profile Übersicht Karten */}
      <div className="grid gap-4 md:grid-cols-3">
        {/* Profil */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Profil</CardTitle>
            <CardDescription>Persönliche Informationen</CardDescription>
          </CardHeader>
          <CardContent className="flex items-center gap-4">
            <Avatar className="h-16 w-16">
              <AvatarImage src="/placeholder.svg?height=64&width=64" alt="Profilbild" />
              <AvatarFallback>MM</AvatarFallback>
            </Avatar>
            <div className="min-w-0">
              <div className="font-medium">Max Mustermann</div>
              <div className="text-sm text-muted-foreground break-words overflow-wrap-anywhere">
                max.mustermann@example.com
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Sicherheit */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Sicherheit</CardTitle>
            <CardDescription>Passwort & Authentifizierung</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Passwort zuletzt geändert: <span className="font-medium">Vor 3 Monaten</span>
            </div>
            <div className="text-sm mt-1">
              2FA: <span className="font-medium text-red-500">Nicht aktiviert</span>
            </div>
          </CardContent>
        </Card>

        {/* Verbindungen */}
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Verbindungen</CardTitle>
            <CardDescription>Verknüpfte Konten</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="text-sm">
              Google: <span className="font-medium text-green-500">Verbunden</span>
            </div>
            <div className="text-sm mt-1">
              GitHub: <span className="font-medium text-red-500">Nicht verbunden</span>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Tabs für Einstellungen */}
      <Tabs defaultValue="allgemein" className="flex-1 overflow-hidden">
        <TabsList className="mb-4 grid w-full grid-cols-4">
          <TabsTrigger value="allgemein">Allgemein</TabsTrigger>
          <TabsTrigger value="profilbild">Profilbild</TabsTrigger>
          <TabsTrigger value="passwort">Passwort</TabsTrigger>
          <TabsTrigger value="benachrichtigungen">Benachrichtigungen</TabsTrigger>
        </TabsList>

        {/* Allgemein */}
        <TabsContent value="allgemein" className="flex-1 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>Allgemeine Informationen</CardTitle>
              <CardDescription>Aktualisiere deine persönlichen Informationen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="grid gap-6 md:grid-cols-2">
                <div className="space-y-2">
                  <Label htmlFor="name">Name</Label>
                  <Input id="name" placeholder="Max Mustermann" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="email">E-Mail</Label>
                  <Input id="email" placeholder="max.mustermann@example.com" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="department">Abteilung</Label>
                  <Input id="department" placeholder="IT-Support" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="interests">Interessen</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button variant="outline" role="combobox" className="w-full justify-between">
                        {selectedCategories.length > 0
                          ? `${selectedCategories.length} Kategorien ausgewählt`
                          : "Kategorien auswählen..."}
                        <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-[300px] p-0">
                      <Command>
                        <CommandGroup>
                          <ScrollArea className="h-60">
                            {categories.map((category) => (
                              <CommandItem
                                key={category.value}
                                value={category.value}
                                onSelect={() => toggleCategory(category.value)}
                              >
                                <Check
                                  className={`mr-2 h-4 w-4 ${
                                    selectedCategories.includes(category.value) ? "opacity-100" : "opacity-0"
                                  }`}
                                />
                                {category.label}
                              </CommandItem>
                            ))}
                          </ScrollArea>
                        </CommandGroup>
                      </Command>
                    </PopoverContent>
                  </Popover>
                  {selectedCategories.length > 0 && (
                    <div className="mt-2 flex flex-wrap gap-1">
                      {selectedCategories.map((value) => (
                        <Badge
                          key={value}
                          variant="secondary"
                          className="cursor-pointer"
                          onClick={() => toggleCategory(value)}
                        >
                          {categories.find((c) => c.value === value)?.label}
                          <span className="ml-1 text-xs">×</span>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Profilbild */}
        <TabsContent value="profilbild" className="flex-1 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>Profilbild</CardTitle>
              <CardDescription>Ändere dein Profilbild. Empfohlene Größe: 400x400 Pixel.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="flex flex-col items-center space-y-6">
                <Avatar className="h-40 w-40">
                  <AvatarImage src="/placeholder.svg?height=160&width=160" alt="Profilbild" />
                  <AvatarFallback>MM</AvatarFallback>
                </Avatar>

                <div className="w-full max-w-md">
                  <div className="border-2 border-dashed rounded-lg p-6 text-center cursor-pointer hover:border-primary">
                    <div className="flex flex-col items-center justify-center space-y-2">
                      <Upload className="h-8 w-8 text-gray-400" />
                      <p>Klicke oder ziehe ein Bild hierher</p>
                      <p className="text-xs text-gray-500">PNG, JPG oder GIF, max. 5MB</p>
                    </div>
                  </div>
                  <div className="mt-4 flex justify-center">
                    <Button variant="outline" type="button">
                      Bild auswählen
                    </Button>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Passwort */}
        <TabsContent value="passwort" className="flex-1 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>Passwort ändern</CardTitle>
              <CardDescription>Ändere dein Passwort, um dein Konto zu schützen.</CardDescription>
            </CardHeader>
            <CardContent className="space-y-6">
              <div className="space-y-4 max-w-md">
                <div className="space-y-2">
                  <Label htmlFor="current-password">Aktuelles Passwort</Label>
                  <Input id="current-password" type="password" />
                </div>
                <Separator />
                <div className="space-y-2">
                  <Label htmlFor="new-password">Neues Passwort</Label>
                  <Input id="new-password" type="password" />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="confirm-password">Passwort bestätigen</Label>
                  <Input id="confirm-password" type="password" />
                </div>
              </div>

              <div className="pt-4">
                <Button>Passwort ändern</Button>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Benachrichtigungen */}
        <TabsContent value="benachrichtigungen" className="flex-1 overflow-auto">
          <Card>
            <CardHeader>
              <CardTitle>Benachrichtigungseinstellungen</CardTitle>
              <CardDescription>Lege fest, wie und wann du benachrichtigt werden möchtest.</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                <div className="space-y-4">
                  <h3 className="text-lg font-medium">E-Mail-Benachrichtigungen</h3>
                  <div className="grid gap-4">
                    {Object.entries(emailNotifications).map(([key, value]) => (
                      <div key={key} className="flex items-center justify-between">
                        <div>
                          <Label className="font-medium">
                            {key === "security" && "Sicherheitsbenachrichtigungen"}
                            {key === "productUpdates" && "Produktupdates"}
                            {key === "newsletter" && "Newsletter"}
                          </Label>
                          <p className="text-sm text-muted-foreground">
                            {key === "security" && "Erhalte Benachrichtigungen über Sicherheitsupdates"}
                            {key === "productUpdates" && "Erhalte Benachrichtigungen über neue Funktionen"}
                            {key === "newsletter" && "Erhalte monatliche Updates und Neuigkeiten"}
                          </p>
                        </div>
                        <div
                          onClick={() =>
                            setEmailNotifications((prev) => ({
                              ...prev,
                              [key]: !value,
                            }))
                          }
                          className={`h-6 w-11 cursor-pointer rounded-full p-1 ${
                            value ? "bg-green-500" : "bg-red-500"
                          }`}
                        >
                          <div
                            className={`h-4 w-4 rounded-full bg-white transition-transform ${
                              value ? "translate-x-5" : "translate-x-0"
                            }`}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                <Separator />

                <div className="space-y-4">
                  <h3 className="text-lg font-medium">Push-Benachrichtigungen</h3>
                  <div className="grid gap-4">
                    <div className="flex items-center justify-between">
                      <div>
                        <Label className="font-medium">Aktivieren</Label>
                        <p className="text-sm text-muted-foreground">Push-Benachrichtigungen im Browser aktivieren</p>
                      </div>
                      <div
                        onClick={() => setPushNotificationsEnabled((prev) => !prev)}
                        className={`h-6 w-11 cursor-pointer rounded-full p-1 ${
                          pushNotificationsEnabled ? "bg-green-500" : "bg-red-500"
                        }`}
                      >
                        <div
                          className={`h-4 w-4 rounded-full bg-white transition-transform ${
                            pushNotificationsEnabled ? "translate-x-5" : "translate-x-0"
                          }`}
                        ></div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}
