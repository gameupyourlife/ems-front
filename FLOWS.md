# Flow Template Aufbau
``` ts
id: string;
name: string;
description: string;
trigger: Condition[];
actions: Action[];
createdAt: Date;
updatedAt: Date;
createdBy: string;
updatedBy: string;
isUserCreated: boolean; // true if created by the user, false if default template
```
Jedes FlowTemplate hat eine eindeutige ID und besteht aus einer Menge von Conditions, dem Trigger, und einer Menge von Actions.
Die Actions sollen dann ausgeführt werden, wenn alle Conditions erfüllt sind. Ist dies der Fall so wird ein Flow Run gestartet, also eine Instanz aus diesem Template generiert, welches durchläuft und dann fehlschlagen kann oder erfolgreich beendet wird. Im Optimalfall werden hierbei Logs zu allen Actions aufgezeichnet um diese nachvollziehen zu können und auch wird das erfolgreiche Durchlaufen oder das Fehlschlagen der einzelnen Actions und nicht nur des gesamten Flow Runs dokumentiert.

# Trigger
## Conditions
Es gibt 5 Arten von Conditions diese sind:
    
- date 
- relativeDate 
- numOfAttendees
- status
- registration

Grundsätzlich ist eine Condition wie folgt aufgebaut:
    
``` ts
id: string;
type: ConditionType;
details: ConditionDetails;
// Etwaige andere Meta-Eigenschaften 
```
Entsprechend abhängig von der ConditionType sind die ConditionDetails. Diese sind als JSON in der Datenbank gespeichert und grundlegend unterschiedlich.

### Date
``` ts
operator: "before" | "after" | "on";
value: date,
```

Um eine Zeitspanne zu definieren sind zwei Date Conditions notwendig.

### Relative Date
``` ts
operator: "before" | "after" | "equal",
value: number,
valueType: "hours" | "days" | "weeks" | "months" ,
valueRelativeTo: "event.start" | "event.end",
valueRelativeOperator: "before" | "after"
```

- operator wie in Date definiert
- value entsprechend die in valueType definierte Anzahl an Zeiteinheiten
- valueRelativeOperator definiert die Relation des Values zu dem in valueRelativeTo definierten Event Zeitpunktes
#### Beispiel
``` 
operator: "after",
value: 14,
valueType: "days",
valueRelativeTo: "event.start",
valueRelativeOperator: "before"
```
Diese Condition wäre ab 2 Wochen vor dem Eventstart wahr.

``` 
operator: "before",
value: 2,
valueType: "weeks",
valueRelativeTo: "event.start",
valueRelativeOperator: "before"
```
Diese Condition wäre bis zu 2 Wochen vor dem Eventstart wahr.

Im Gegensatz zur Date Condition, bei welcher es sich um vor, nach oder an einem beliebigen Datum handelt ist dies Condition relativ zu dem Event Start oder Ende und somit universell einsetzbar.
### Teilnehmerzahl (numOfAttendees)
``` ts
operator: "greaterThan" | "lessThan" | "equalTo",
valueType: "absolute" | "percentage",
value: number,
```

Ist im valueType percentage ausgewählt, so ist die im Value gegeben Zahl als Prozente relativ zur maximalen Teilnehmeranzahl des Events zu verstehen. 
``` 
operator: "lessThan",
valueType: "percentage",
value: 25,
```
Hierbei handelt es sich um die Bedingung, dass das Event weniger als 25% ausgelastet ist. Es sich also weniger Leute Angemeldet haben als 1/4 der Kapazität.  
### Status

``` ts
operator: "is" | "isNot",
value: "active" | "cancelled" | "completed" | "archived" | "draft", //Entsprechend alle möglichen Event Stati
```

### Registration

``` ts
null
```

Die Registration Condition besitzt keine details. Sie ist dann wahr, wenn sich ein neuer Nutzer zu einem Event anmeldet. Dieser Nutzer kann in Actions mittels der `trigger.registration.user` Variable referenziert werden. Die Registration Condition ist pro Flow unique und kann somit nur einmal vorkommen.

Verglichen zu den anderen Conditions handelt es sich beim der Registration Condition um einen Sonderfall. Alle Anderen Conditions sind binär entweder dauerhaft wahr oder falsch. So ist der Status von einem Event entweder der angegebene oder nicht und damit unabhängig von der Anzahl und Art der Durchführung an Runs. Die Registration Condition hingegen ist immer nur in dem Augenblick der Neuregistrierung eines bestimmten Users erfüllt. Dies hat zur Folge, dass jede Registrierung, also jedes Erfüllen diese Condition, eine Überprüfung der anderen dem Flow zugeordneten Conditions zum jeweiligen Zustandes des Events im Augenblick der Registrierung notwendig macht. 

In der Praxis hat dies die Folge, dass mit jeder Registrierung zu einem Event überprüft werden muss, ob dieses Event ein Flow mit Registration Condition besitzt und wenn dies der Fall ist, dieser Überprüft und ggf. instanziiert werden muss. Die mögliche Alternative, in welcher der Zustand des Events im Augenblick der Registrierung gespeichert wird, wird für die Praxis als nicht notwendig erachtet. Alle Betrachtungen diesbezüglich werden nicht weiter vorgenommen. 



# Actions
## Action Types
Es gibt 5 Arten von Actions diese sind:
    
- email 
- statusChange 
- fileShare          // Noch nicht implementierbar? 
- imageChange 
- titleChange 
- descriptionChange

Grundsätzlich ist eine Action wie auch eine Condition wie folgt aufgebaut:
    
``` ts
id: string;
type: ActionType;
details: ActionDetails;
// Etwaige andere Meta-Eigenschaften 
```
Entsprechend abhängig von dem ActionType sind die ActionDetails. Diese sind als JSON in der Datenbank gespeichert und grundlegend unterschiedlich.

### Email
> NOCH NICHT DEFINIERT, DA DIE MAIL TEMPLATES NOCH NICHT GENAU STEHEN ETC.

### Status Change
``` ts
newStatus: "active" | "cancelled" | "completed" | "archived" | "draft"; //Entsprechend alle möglichen Event Stati
```

### FileShare
> AUCH NOCH NICHT RICHTIG DEFINIERT, DA DAS FILE PERMS SYSTEM NOCH NICHT STEHT. GRUNDSÄTZLICH ABER SOWAS IN DER ART

``` ts
fileId: string;
status: "private" | "public";
```

### ImageChange
``` ts
newImage: string; // URL or ID form uploaded File format
```


### TitleChange
``` ts
newTitle: string;
```

### DescriptionChange
``` ts
newDescription: string;
```
