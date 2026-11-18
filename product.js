const API_CIM = "http://localhost:3000/products";

const urlap = document.getElementById("product-form");
const lista = document.getElementById("products-list");
const listaAllapot = document.getElementById("products-status");
const urlapAllapot = document.getElementById("form-status");
const mentesGomb = document.getElementById("product-submit");

const nevMezo = document.getElementById("product-name");
const arMezo = document.getElementById("product-price");
const keszletMezo = document.getElementById("product-stock");
const ertekelesMezo = document.getElementById("product-rating");
const gyartoMezo = document.getElementById("manufacturer-name");
const orszagMezo = document.getElementById("manufacturer-country");
const kepMezo = document.getElementById("product-image");
const jellemzokMezo = document.getElementById("product-features");

function allapotKiirasa(elem, szoveg, tipus) {
  elem.textContent = szoveg;
  elem.className = `alert alert-${tipus}`;
}

function elemLetrehozasa(tag, szoveg = "", className = "") {
  const elem = document.createElement(tag);
  elem.textContent = szoveg;
  elem.className = className;
  return elem;
}

function termekKartya(termek) {
  const oszlop = elemLetrehozasa("div", "", "col-12 col-md-6 col-xl-4");
  const kartya = elemLetrehozasa("article", "", "card product-card h-100");
  const kepDoboz = elemLetrehozasa("div", "", "product-media");
  const tartalom = elemLetrehozasa("div", "", "card-body product-card-body d-flex flex-column");
  const nev = termek.name || "Névtelen termék";
  const gyarto = [termek.manufacturer?.name, termek.manufacturer?.country].filter(Boolean).join(" · ");
  const jellemzok = Array.isArray(termek.features) ? termek.features : [];

  if (termek.image) {
    const kep = elemLetrehozasa("img", "", "product-image");
    kep.src = termek.image;
    kep.alt = `${nev} termékkép`;
    kep.loading = "lazy";
    kep.addEventListener("error", () => {
      kep.replaceWith(elemLetrehozasa("span", "A kép nem érhető el", "product-placeholder"));
    });
    kepDoboz.append(kep);
  } else {
    kepDoboz.append(elemLetrehozasa("span", "Nincs termékkép", "product-placeholder"));
  }
  kartya.append(kepDoboz);

  tartalom.append(
    elemLetrehozasa("h3", nev, "product-title"),
    elemLetrehozasa("p", `${Number(termek.price || 0).toLocaleString("hu-HU")} Ft`, "product-price"),
    elemLetrehozasa("p", `Készlet: ${termek.stock ?? 0} db · Értékelés: ${termek.rating ?? 0}/5`, "product-meta")
  );
  if (gyarto) tartalom.append(elemLetrehozasa("p", `Gyártó: ${gyarto}`, "product-manufacturer"));

  if (jellemzok.length) {
    const jellemzoLista = elemLetrehozasa("ul", "", "product-features");
    jellemzok.forEach((jellemzo) => jellemzoLista.append(elemLetrehozasa("li", String(jellemzo))));
    tartalom.append(jellemzoLista);
  }

  if (termek.id != null) {
    const torlesGomb = elemLetrehozasa("button", "Törlés", "btn btn-outline-danger btn-sm product-delete mt-auto align-self-start");
    torlesGomb.type = "button";
    torlesGomb.addEventListener("click", () => termekTorlese(termek.id));
    tartalom.append(torlesGomb);
  }

  kartya.append(tartalom);
  oszlop.append(kartya);
  return oszlop;
}

async function termekekBetoltese() {
  allapotKiirasa(listaAllapot, "Termékek betöltése...", "info");
  try {
    const valasz = await fetch(API_CIM);
    if (!valasz.ok) throw new Error(`HTTP ${valasz.status}`);
    const termekek = await valasz.json();
    if (!Array.isArray(termekek)) throw new Error("Az API válasza nem terméklista.");

    lista.replaceChildren();
    termekek.forEach((termek) => lista.append(termekKartya(termek)));
    allapotKiirasa(
      listaAllapot,
      termekek.length ? `${termekek.length} termék betöltve.` : "Még nincs termék a kínálatban.",
      termekek.length ? "success" : "secondary"
    );
  } catch (hiba) {
    allapotKiirasa(listaAllapot, `Hiba a betöltéskor: ${hiba.message}`, "danger");
  }
}

async function termekTorlese(azonosito) {
  if (!confirm("Biztosan törlöd ezt a terméket?")) return;
  try {
    const valasz = await fetch(`${API_CIM}/${encodeURIComponent(azonosito)}`, { method: "DELETE" });
    if (!valasz.ok) throw new Error(`HTTP ${valasz.status}`);
    await termekekBetoltese();
    allapotKiirasa(listaAllapot, "A terméket töröltük.", "success");
  } catch (hiba) {
    allapotKiirasa(listaAllapot, `Törlési hiba: ${hiba.message}`, "danger");
  }
}

urlap.addEventListener("submit", async (esemeny) => {
  esemeny.preventDefault();

  const nev = nevMezo.value.trim();
  const ar = Number(arMezo.value);
  const keszlet = Number(keszletMezo.value);
  const ertekeles = Number(ertekelesMezo.value);
  const gyartoNev = gyartoMezo.value.trim();
  const gyartoOrszag = orszagMezo.value.trim();
  const kep = kepMezo.value.trim();
  const jellemzok = jellemzokMezo.value.split(",").map((j) => j.trim()).filter(Boolean);

  if (nev.length < 2 || !gyartoNev || !gyartoOrszag) {
    allapotKiirasa(urlapAllapot, "A név legalább 2 karakter, a gyártó és az ország megadása kötelező.", "warning");
    return;
  }

  const ujTermek = {name: nev, price: ar, stock: keszlet, rating: ertekeles, manufacturer: { name: gyartoNev, country: gyartoOrszag }, image: kep, features: jellemzok};

  mentesGomb.disabled = true;
  try {
    const valasz = await fetch(API_CIM, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(ujTermek)
    });
    if (!valasz.ok) throw new Error(`HTTP ${valasz.status}`);

    urlap.reset();
    ertekelesMezo.value = "0";
    allapotKiirasa(urlapAllapot, "A terméket sikeresen létrehoztuk.", "success");
    await termekekBetoltese();
  } catch (hiba) {
    allapotKiirasa(urlapAllapot, `Mentési hiba: ${hiba.message}`, "danger");
  } finally {
    mentesGomb.disabled = false;
  }
});

termekekBetoltese();
