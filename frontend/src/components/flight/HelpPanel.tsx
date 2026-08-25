export function HelpPanel() {
  return (
    <div className="mt-3 rounded-xl border border-indigo-100 bg-indigo-50 px-4 py-3 text-xs text-slate-600 space-y-1.5">
      <p className="font-semibold text-indigo-700 mb-2">Referenca polja</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5">
        <div>
          <span className="font-semibold text-slate-700">Aviokompanija</span> -
          Kompanija koja operiše let (BTS kod, npr. DL = Delta)
        </div>
        <div>
          <span className="font-semibold text-slate-700">Polazni / dolazni aerodrom</span>{" "}
          - IATA kod jednog od 50 najprometnijih aerodroma u SAD
        </div>
        <div>
          <span className="font-semibold text-slate-700">Datum leta</span> - Iz
          datuma se izvode mjesec i dan u sedmici koje model koristi
        </div>
        <div>
          <span className="font-semibold text-slate-700">Sat polaska</span> -
          Planirani sat polaska po lokalnom vremenu polaznog aerodroma (0-23)
        </div>
        <div>
          <span className="font-semibold text-slate-700">Udaljenost</span> -
          Dužina rute u miljama. Popunjava se automatski iz odabranih aerodroma
        </div>
        <div>
          <span className="font-semibold text-slate-700">Temperatura</span> -
          Temperatura zraka na polaznom aerodromu u °C. Povoljno: -5 do 35 °C
        </div>
        <div>
          <span className="font-semibold text-slate-700">Padavine</span> -
          Količina kiše u mm/h. Povoljno: ≤ 1 mm/h, kritično: &gt; 5 mm/h
        </div>
        <div>
          <span className="font-semibold text-slate-700">Snijeg</span> -
          Snježne padavine u cm/h. Kritično: &gt; 1 cm/h (odleđivanje, čišćenje piste)
        </div>
        <div>
          <span className="font-semibold text-slate-700">Vjetar</span> - Brzina
          vjetra u km/h. Povoljno: ≤ 30 km/h, kritično: &gt; 50 km/h
        </div>
        <div>
          <span className="font-semibold text-slate-700">Oblačnost</span> -
          Pokrivenost neba oblacima u %. Otežano: &gt; 85% (niska baza oblaka)
        </div>
        <div className="sm:col-span-2">
          <span className="font-semibold text-slate-700">Preuzmi prognozu</span>{" "}
          - Automatski popunjava vremenska polja iz Open-Meteo prognoze za
          odabrani aerodrom, datum i sat (do 16 dana unaprijed)
        </div>
      </div>
      <p className="mt-2 text-[10px] text-slate-400">
        Indikatori: <span className="text-green-600 font-semibold">Zeleno</span>{" "}
        = povoljno &nbsp;•&nbsp;{" "}
        <span className="text-amber-600 font-semibold">Žuto</span> = otežano
        &nbsp;•&nbsp; <span className="text-red-600 font-semibold">Crveno</span>{" "}
        = kritično
      </p>
    </div>
  );
}
