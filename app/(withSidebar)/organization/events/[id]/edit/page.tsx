// ...existing imports...

export default function EditEventPage({ params }: { params: { id: string } }) {
  // ...existing variables...

  return (
    <>
      <SiteHeader
        // ...existing props...
      >
        {/* ...breadcrumb... */}
      </SiteHeader>

      <div className="flex flex-1 flex-col space-y-6 p-4 md:p-6">
        {/* ...existing markup... */}

        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as any)}
          className="space-y-6"
        >
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="basic" className="flex items-center gap-2">
              <Info className="h-4 w-4" />
              Basis
            </TabsTrigger>
            <TabsTrigger value="agenda" className="flex items-center gap-2">
              <ListTodo className="h-4 w-4" />
              Agenda
            </TabsTrigger>
          </TabsList>

          <TabsContent value="basic">
            <EventBasicInfoForm
              form={basicInfoForm}
              onTabChange={() => setActiveTab("agenda")}
              submitLabel="Weiter: Agenda"
              isEdit
            />
          </TabsContent>

          <TabsContent value="agenda">
            <EventAgendaForm
              agendaItems={agendaItems}
              onAgendaItemsChange={setAgendaItems}
              onTabChange={() => setActiveTab("basic")}
              eventId={params.id}
              submitLabel="Speichern"
              isSubmitting={isSubmitting}
              eventStart={basicInfoForm.getValues("start")}
              eventEnd={basicInfoForm.getValues("end")}
            />
          </TabsContent>
        </Tabs>
      </div>
    </>
  );
}