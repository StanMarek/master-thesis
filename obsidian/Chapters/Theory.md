> [!tip] 
>  W tej części pracy przedstawisz teoretyczne podstawy i koncepcje związane z post-processingiem danych, optymalizacją transferu danych oraz technologiami wykorzystywanymi w pracy. To ważne, aby czytelnik mógł zrozumieć naukowe i techniczne podstawy Twojej pracy.

> [!todo] 
>  **Nowe podrozdziały**:

 - 2.1. Podstawy post-processingu w obliczeniach numerycznych
 - 2.2. Przegląd istniejących rozwiązań
 - 2.3. Przegląd istniejących metod przesyłania danych
 - 2.3. Teoria optymalizacji i jej zastosowanie w transferze danych
---
# Wstęp

W rozdziale drugim rozpoczynamy od zbudowania solidnych fundamentów teoretycznych, niezbędnych do głębokiego zrozumienia złożonych zagadnień stojących za zdalnym post-processingiem oraz optymalizacją przesyłania danych. Przystępując do tej sekcji, czytelnik zostanie wprowadzony w świat obliczeń numerycznych, z których wywodzi się potrzeba post-processingu. Następnie, przeglądając literaturę naukową i techniczną, przedstawimy szeroki zakres metod przesyłania danych, kładąc szczególny nacisk na ich efektywność i ograniczenia. W dalszej części, teoria optymalizacji zostanie zbadana pod kątem jej aplikacji w kontekście minimalizacji transferu danych, zapewniając tym samym kompleksowe tło dla zaprojektowanego systemu. Ostatecznie, zakończymy rozdział wprowadzeniem do technologii i koncepcji zdalnego post-processingu, tworząc most między teorią a praktyczną realizacją projektu.

---
# Przegląd dostępnych rozwiązań

Przegląd dostępnych systemów do post-processingu danych numerycznych obejmuje zarówno komercyjne, jak i otwartoźródłowe opcje, które mogą być wykorzystywane do różnych zastosowań, od analizy danych po wizualizację wyników obliczeń numerycznych. Oto kilka rekomendowanych systemów:
1. **MFEM** - Jest to lekka, skalowalna biblioteka C++ dla metod elementów skończonych. MFEM jest otwartoźródłowa i zapewnia elastyczne narzędzia do zaawansowanej analizy numerycznej i eksploracji danych​ ([Wikipedia](https://en.wikipedia.org/wiki/List_of_numerical-analysis_software))​.
2. **Salome** - Otwartoźródłowe oprogramowanie, które zapewnia ogólną platformę do pre- i post-processingu w symulacjach numerycznych. Jest to szczególnie przydatne w kontekście kompleksowych analiz inżynierskich​ ([Wikipedia](https://en.wikipedia.org/wiki/List_of_numerical-analysis_software))​.

Dla zainteresowanych analizą i wizualizacją danych, oto kilka rekomendowanych narzędzi:
- **ParaView** - Choć nie wymieniony bezpośrednio w przeglądzie, ParaView jest potężnym, otwartoźródłowym narzędziem do wizualizacji danych naukowych, które często wykorzystywane jest do post-processingu danych z symulacji numerycznych. Pozwala na analizę dużych zbiorów danych i jest wysoce konfigurowalny.
- **VisIt** - Podobnie jak ParaView, VisIt to zaawansowane oprogramowanie do wizualizacji, które obsługuje szeroką gamę formatów danych i pozwala na tworzenie złożonych wizualizacji. Jest często używany w badaniach naukowych i inżynierskich do analizy wyników symulacji numerycznych.

Wybór odpowiedniego systemu zależy od specyficznych wymagań projektu, takich jak rodzaj danych, potrzebna dokładność analizy czy preferencje dotyczące oprogramowania otwartoźródłowego lub komercyjnego. Dostępne są zarówno narzędzia specjalizujące się w określonych dziedzinach, jak i bardziej ogólne rozwiązania, które mogą być dostosowane do różnorodnych zastosowań.

Systemy do post-processingu, które omówiłem, można generalnie podzielić na narzędzia desktopowe (do użytku na komputerze lokalnym) oraz narzędzia, które mogą być wykorzystywane zdalnie, w zależności od konkretnego oprogramowania i jego implementacji. Oto jak można sklasyfikować niektóre z nich:

### Desktopowe

- **MFEM** i **Salome** są typowo oprogramowaniami desktopowymi. Są one zazwyczaj instalowane na lokalnym komputerze użytkownika i służą do przeprowadzania zaawansowanych analiz oraz symulacji bezpośrednio na tej maszynie.
    
- **ParaView** i **VisIt** to również aplikacje desktopowe, które instaluje się na komputerze użytkownika. Pozwalają one na lokalną wizualizację i analizę dużych zbiorów danych generowanych przez symulacje numeryczne.
    

### Możliwość użytku zdalnego

- Niektóre z narzędzi, takie jak **ParaView** i **VisIt**, oferują także możliwość pracy zdalnej poprzez uruchomienie serwera na zdalnym klastrze obliczeniowym lub w chmurze. Użytkownik może połączyć się z takim serwerem za pomocą klienta desktopowego, co umożliwia analizę dużych zbiorów danych bez potrzeby przenoszenia ich na lokalny komputer.

### Webowe/zdalne

-   ParaViewWeb - Jest to biblioteka JavaScript, która umożliwia budowanie aplikacji webowych z zaawansowaną wizualizacją naukową. Aplikacje mogą korzystać z backendu VTK i/lub ParaView do przetwarzania i renderowania dużych zbiorów danych. ParaViewWeb oferuje wiele znanych komponentów UI, ale także zawiera widgety specjalnie dostosowane do interakcji wizualizacji naukowej, takie jak edytory transfer function czy widżety do kontroli właściwości światła​ ([Kitware](https://kitware.github.io/paraviewweb/docs/index.html))​.
    
- **INOWAS** - Platforma bazująca na modelu numerycznym MODFLOW-2005, opracowana przez US Geological Survey do symulacji przepływu wód gruntowych w układach wodonośnych. INOWAS umożliwia tworzenie, pisanie i odczytywanie plików wejściowych i wyjściowych MODFLOW-2005, a także obliczanie modeli przepływu wód gruntowych z użyciem przeglądarki internetowej. Platforma obsługuje również modelowanie transportu rozpuszczalników za pomocą pakietu MT3DMS oraz modelowanie przepływu i transportu wód o zmiennej gęstości przy użyciu pakietu SEAWAT​ ([INOWAS](https://www.inowas.com/modflow/))​.

Podsumowując, większość systemów do post-processingu omówionych w przeglądzie to aplikacje desktopowe, choć niektóre oferują opcje zdalne lub pracę z serwerami obliczeniowymi, co może być przydatne przy analizie bardzo dużych zbiorów danych. W przypadku potrzeby pracy zdalnej lub przez przeglądarkę internetową, warto rozważyć dodatkowe rozwiązania chmurowe lub webowe specjalizujące się w tego typu funkcjonalnościach.