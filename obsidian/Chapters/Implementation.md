> [!tip] 
> Tutaj szczegółowo opiszesz projektowanie, implementację oraz konfigurację Twojego systemu zdalnego post-processingu. Powinny być tutaj zawarte informacje na temat architektury systemu, użytych narzędzi i bibliotek, a także szczegóły implementacji poszczególnych komponentów.
> 

> [!todo] 
> **Nowe podrozdziały**:
> 
3.1. Projekt systemu:
>- 3.1.1. Architektura systemu
>- 3.1.2. Wybór technologii i narzędzi

> [!todo] 
> 3.2. Implementacja systemu:
>- 3.2.1. Sukcesywne aproksymacje analizowanej bryły
>- 3.2.2. Optymalizacja przesyłania danych
>- 3.2.3. Interfejs użytkownika i nawigacja po wynikach 

---
# Wstęp
W trzecim rozdziale skoncentrujemy się na procesie projektowania, budowie oraz implementacji systemu zdalnego post-processingu. Rozpoczniemy od zaprezentowania architektury systemu, wskazując na kluczowe komponenty i uzasadniając wybór konkretnej struktury. Kolejno, szczegółowo omówimy technologie i narzędzia, które zostały wykorzystane w trakcie tworzenia projektu, podkreślając ich rolę w osiągnięciu zakładanych celów. Implementacja poszczególnych modułów zostanie przedstawiona w sposób przystępny, z uwzględnieniem technicznych wyzwań oraz metod ich rozwiązania. Szczególną uwagę poświęcimy innowacyjnemu podejściu do sukcesywnych aproksymacji analizowanej bryły, które stanowi serce systemu, umożliwiając efektywne przesyłanie danych.

---
# System architecture

![[Pasted image 20240319223035.png]]Powyżej przedstawiony jest diagram ilustrujący wstępną architekturę systemu/aplikacji. W diagramie wyodrębniono trzy główne komponenty:

- **Klient**: Reprezentuje użytkownika końcowego systemu, który za pośrednictwem interfejsu użytkownika komunikuje się z systemem.
- **Serwer Post-Processingu**: Stanowi centralny węzeł systemu, odpowiedzialny za przetwarzanie danych, wykonanie post-processingu i sukcesywne aproksymacje analizowanej bryły.
- **Baza Danych**: Miejsce przechowywania danych wejściowych, wyników post-processingu oraz innych niezbędnych informacji dla działania systemu.

Strzałki wskazują na kierunek przepływu danych między komponentami, pokazując, jak użytkownik komunikuje się z serwerem post-processingu, a ten z kolei z bazą danych. Ta uproszczona architektura służy jako punkt wyjścia do dalszego rozwoju i szczegółowego projektowania systemu.

```python
import matplotlib.pyplot as plt
import matplotlib.patches as patches

fig, ax = plt.subplots(figsize=(10, 8))

# Main components
components = {
    "Klient": {"pos": (0.5, 0.8), "color": "skyblue"},
    "Serwer Post-Processingu": {"pos": (0.5, 0.5), "color": "lightgreen"},
    "Baza Danych": {"pos": (0.5, 0.2), "color": "lightcoral"}
}

# Connections
connections = [
    ("Klient", "Serwer Post-Processingu"),
    ("Serwer Post-Processingu", "Baza Danych"),
]

# Draw components
for comp, details in components.items():
    ax.text(details["pos"][0], details["pos"][1], comp, ha="center", va="center", fontsize=12,
            bbox=dict(boxstyle="round", facecolor=details["color"], edgecolor="black"))

# Draw connections
for conn in connections:
    start = components[conn[0]]["pos"]
    end = components[conn[1]]["pos"]
    ax.annotate("", xy=end, xycoords='data', xytext=start, textcoords='data',
                arrowprops=dict(arrowstyle="->", lw=2, color="black"))

# Settings
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')

plt.title("Wstępna Architektura Systemu", fontsize=16)
plt.show()

```

![[Pasted image 20240319223435.png]]

Oto szczegółowa propozycja architektury systemu, która zawiera rozszerzoną strukturę komponentów i ich wzajemnych połączeń:

- **Użytkownik** komunikuje się z systemem przez **Interfejs Użytkownika**, który jest zaprojektowany tak, aby zapewniać intuicyjną i efektywną interakcję.
- **Interfejs Użytkownika** połączony jest z **API/Zarządzaniem Sesją**, które obsługuje żądania i odpowiada za utrzymanie ciągłości sesji użytkownika.
- **Serwer Post-Processingu** jest rdzeniem systemu, gdzie odbywa się przetwarzanie danych. Do serwera dołączone są dwa kluczowe moduły:
    - **Moduł Aproksymacji** odpowiada za sukcesywne aproksymacje analizowanej bryły, co pozwala na efektywne przesyłanie danych.
    - **Moduł Analizy Danych** przetwarza dane wejściowe i wynikowe, wspomagając decyzje dotyczące optymalizacji procesu post-processingu.
- **Baza Danych** i **Magazyn Danych** stanowią pamięć systemu, gdzie przechowywane są dane wejściowe, wyniki obliczeń oraz inne niezbędne informacje. Baza danych jest bezpośrednio związana z modułem aproksymacji, natomiast magazyn danych wspiera moduł analizy danych.
- Połączenia między **Bazą Danych** oraz **Magazynem Danych** a **API/Zarządzaniem Sesją** umożliwiają dynamiczne dostosowywanie procesów w zależności od potrzeb użytkownika oraz efektywną wymianę danych.

Ta szczegółowa architektura uwypukla zarówno strukturę systemu, jak i złożoność interakcji między poszczególnymi komponentami, podkreślając ich indywidualne role w procesie zdalnego post-processingu i optymalizacji przesyłania danych.

```python
fig, ax = plt.subplots(figsize=(12, 10))

# Components and their properties
components = {
    "Użytkownik": {"pos": (0.15, 0.8), "color": "skyblue"},
    "Interfejs Użytkownika": {"pos": (0.15, 0.6), "color": "skyblue"},
    "API/Zarządzanie Sesją": {"pos": (0.5, 0.6), "color": "lightgreen"},
    "Serwer Post-Processingu": {"pos": (0.5, 0.4), "color": "lightgreen"},
    "Moduł Aproksymacji": {"pos": (0.3, 0.4), "color": "lightgreen"},
    "Moduł Analizy Danych": {"pos": (0.7, 0.4), "color": "lightgreen"},
    "Baza Danych": {"pos": (0.5, 0.2), "color": "lightcoral"},
    "Magazyn Danych": {"pos": (0.7, 0.2), "color": "lightcoral"},
}

# Connections
connections = [
    ("Użytkownik", "Interfejs Użytkownika"),
    ("Interfejs Użytkownika", "API/Zarządzanie Sesją"),
    ("API/Zarządzanie Sesją", "Serwer Post-Processingu"),
    ("Serwer Post-Processingu", "Moduł Aproksymacji"),
    ("Serwer Post-Processingu", "Moduł Analizy Danych"),
    ("Moduł Aproksymacji", "Baza Danych"),
    ("Moduł Analizy Danych", "Magazyn Danych"),
    ("Baza Danych", "API/Zarządzanie Sesją"),
    ("Magazyn Danych", "API/Zarządzanie Sesją"),
]

# Draw components
for comp, details in components.items():
    ax.text(details["pos"][0], details["pos"][1], comp, ha="center", va="center", fontsize=10,
            bbox=dict(boxstyle="round", facecolor=details["color"], edgecolor="black", alpha=0.8))

# Draw connections
for conn in connections:
    start = components[conn[0]]["pos"]
    end = components[conn[1]]["pos"]
    ax.annotate("", xy=end, xycoords='data', xytext=start, textcoords='data',
                arrowprops=dict(arrowstyle="->", lw=1.5, color="black"))

# Settings
ax.set_xlim(0, 1)
ax.set_ylim(0, 1)
ax.axis('off')

plt.title("Szczegółowa Architektura Systemu", fontsize=16)
plt.show()

```

# Technologie
Wybór języków programowania i technologii do implementacji systemu zależy od kilku czynników, takich jak wymagania dotyczące wydajności, skalowalności, bezpieczeństwa oraz dostępność bibliotek i narzędzi. Biorąc pod uwagę, że znam Golang, TypeScript (TS) i Rust, oto propozycje dotyczące ich wykorzystania w kontekście zaproponowanej architektury systemu:

### Golang (Go)

**Zastosowanie**: Idealny do budowy wydajnego i skalowalnego **Serwera Post-Processingu** oraz **API/Zarządzania Sesją**.

**Zalety**:

- Konkurencyjność i prosta obsługa współbieżności, co jest kluczowe przy obsłudze wielu żądań.
- Szeroka biblioteka standardowa i liczne narzędzia do tworzenia sieciowych aplikacji serwerowych.
- Dobra integracja z systemami baz danych i efektywna obsługa operacji wejścia/wyjścia.

**Biblioteki i narzędzia**:

- **Gin** lub **Echo** dla REST API – lekkie i szybkie frameworki do tworzenia RESTful API.
- **GORM** lub **sqlx** dla obsługi baz danych – oferują łatwe w użyciu ORM (Object-Relational Mapping) lub bezpośrednie wykonywanie zapytań SQL.

### TypeScript (TS)

**Zastosowanie**: Doskonały do tworzenia **Interfejsu Użytkownika**.

**Zalety**:

- Umożliwia tworzenie bardziej złożonych i bezpiecznych aplikacji dzięki statycznemu typowaniu.
- Łatwa integracja z popularnymi frameworkami front-endowymi, które wspierają budowę responsywnych i interaktywnych interfejsów użytkownika.
- Ułatwia współpracę i utrzymanie kodu na dużą skalę.

**Frameworki i narzędzia**:

- **React** lub **Angular** – zaawansowane frameworki do tworzenia interfejsów użytkownika z bogatym wsparciem dla TypeScript.
- **Redux** (w przypadku React) lub **NgRx** (dla Angular) – do zarządzania stanem aplikacji.

### Rust

**Zastosowanie**: Może być wykorzystany do rozwoju krytycznych pod względem wydajności komponentów, takich jak **Moduł Aproksymacji** lub **Moduł Analizy Danych**.

**Zalety**:

- Zapewnia bardzo wysoką wydajność i bezpieczeństwo, szczególnie w obszarach krytycznych dla wydajności, dzięki brakowi garbage collection i silnemu systemowi typów.
- Idealny do obliczeń numerycznych i operacji na dużych zbiorach danych dzięki precyzyjnej kontroli nad zasobami systemowymi.

**Biblioteki i narzędzia**:

- **Serde** – dla serializacji i deserializacji danych (np. JSON), co może być użyteczne przy komunikacji z bazą danych lub interfejsami API.
- **Tokio** lub **Actix** – asynchroniczne frameworki do tworzenia wydajnych aplikacji sieciowych, które mogą być użyte w specyficznych przypadkach.

Wykorzystując te języki i technologie, możesz zbudować wydajny, bezpieczny i skalowalny system, który będzie spełniał stawiane mu wymagania. Oczywiście, każdy z tych języków i technologii posiada swoje własne zestawy narzędzi i bibliotek, które mogą być lepiej dostosowane do konkretnych potrzeb projektu, więc zawsze warto rozważyć również inne opcje dostępne na rynku.

![[Pasted image 20240319224218.png]]

### Bazy danych

#### Dla operacji na danych strukturalnych (np. zarządzanie sesjami, użytkownikami):

- **PostgreSQL**: Bardzo potężna, otwartoźródłowa baza danych relacyjna, która oferuje zaawansowane funkcje, takie jak pełnotekstowe wyszukiwanie, transakcje, typy danych JSON itd. Jest to doskonały wybór dla aplikacji wymagających elastyczności i niezawodności.
- **MySQL/MariaDB**: Popularne, otwartoźródłowe bazy danych relacyjne, które są dobrze znane ze swojej wydajności i stabilności. Są szeroko stosowane w wielu aplikacjach internetowych.

#### Dla operacji na danych nieustrukturyzowanych (np. logi):

- **MongoDB**: Baza danych NoSQL, która przechowuje dane w formacie podobnym do JSON. Idealna dla aplikacji, które wymagają szybkiego dostępu do dużych wolumenów danych nieustrukturyzowanych lub półstrukturyzowanych.
- **Cassandra**: Baza danych NoSQL zaprojektowana do obsługi dużych ilości danych rozproszonych na wielu serwerach. Dobra do zastosowań wymagających wysokiej dostępności bez pojedynczego punktu awarii.

### Magazyny danych

#### Dla analizy dużych zbiorów danych:

- **ClickHouse**: Otwartoźródłowy, kolumnowy magazyn danych zaprojektowany do przetwarzania zapytań analitycznych w czasie rzeczywistym na dużą skalę. Doskonały do analizy i raportowania w czasie rzeczywistym.
- **Apache Druid**: Magazyn danych zaprojektowany do szybkich zapytań OLAP na dużych zbiorach danych. Bardzo dobrze sprawdza się w analizie danych zdarzeniowych w czasie rzeczywistym.

#### Dla big data i przetwarzania strumieniowego:

- **Apache Kafka**: Platforma przetwarzania strumieniowego, która może być używana jako magazyn danych do przechowywania strumieni danych w czasie rzeczywistym. Idealna dla systemów wymagających wysokiej przepustowości i niskiego opóźnienia.
- **Hadoop HDFS**: System plików przeznaczony do przechowywania bardzo dużych zbiorów danych. W połączeniu z narzędziami ekosystemu Hadoop, takimi jak Hive czy HBase, umożliwia efektywne przetwarzanie i analizę big data.

Wybierając bazę danych i magazyn danych, warto rozważyć nie tylko obecne, ale i przyszłe potrzeby systemu, aby zapewnić jego skalowalność i możliwość adaptacji do rosnących wolumenów danych oraz zmieniających się wymagań.