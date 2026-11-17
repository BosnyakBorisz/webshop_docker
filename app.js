const API_CIM = "http://localhost:3000/users";
const urlap = document.getElementById("felhasznalo-urlap");
const tabla = document.getElementById("users-table-body");
const listaAllapot = document.getElementById("users-status");
const urlapAllapot = document.getElementById("urlap-allapot");
const urlapCim = document.getElementById("urlap-cim");
const mentesGomb = document.getElementById("felhasznaloMentes");
const megseGomb = document.getElementById("szerkesztesMegse");
const nevMezo = document.getElementById("nev");
const emailMezo = document.getElementById("email");
const varosMezo = document.getElementById("varos");
const telefonMezo = document.getElementById("telefon");
const szerepkorMezo = document.getElementById("szerepkor");
let szerkesztettAzonosito = null;

function allapotKiirasa(elem, szoveg, tipus) {
	elem.textContent = szoveg;
	elem.className = `alert alert-${tipus}`;
}

async function felhasznalokBetoltese() {
	try {
		const valasz = await fetch(API_CIM);
		if (!valasz.ok) throw new Error(`HTTP ${valasz.status}`);

		const felhasznalok = await valasz.json();
		if (!Array.isArray(felhasznalok)) throw new Error("A válasz nem felhasználólista.");

		tabla.replaceChildren();
		felhasznalok.forEach((felhasznalo) => {
			const sor = document.createElement("tr");
			[felhasznalo.name, felhasznalo.email, felhasznalo.city, felhasznalo.phone, felhasznalo.role].forEach((ertek) => {
				const cella = document.createElement("td");
				cella.innerHTML = ertek || "-";
				sor.append(cella);
			});

			const cella = document.createElement("td");
			if (felhasznalo.id == null) {
				cella.innerHTML = "Nincs azonosító";
			} else {
				const modositGomb = document.createElement("button");
				modositGomb.className = "btn btn-sm btn-outline-primary me-2";
				modositGomb.innerHTML = "Módosítás";
				modositGomb.addEventListener("click", () => urlapBeallitasa(felhasznalo));

				const torolGomb = document.createElement("button");
				torolGomb.className = "btn btn-sm btn-outline-danger";
				torolGomb.innerHTML = "Törlés";
				torolGomb.addEventListener("click", () => felhasznaloTorlese(felhasznalo.id));
				cella.append(modositGomb, torolGomb);
			}
			sor.append(cella);
			tabla.append(sor);
		});

		allapotKiirasa(listaAllapot, felhasznalok.length ? `${felhasznalok.length} felhasználó betöltve.` : "Nincs felhasználó.", felhasznalok.length ? "success" : "secondary");
	} catch (hiba) {
		allapotKiirasa(listaAllapot, `Nem sikerült betölteni a felhasználókat: ${hiba.message}`, "danger");
	}
}

function urlapBeallitasa(felhasznalo = null) {
	szerkesztettAzonosito = felhasznalo ? felhasznalo.id : null;
	urlap.reset();
	if (felhasznalo) {
		nevMezo.value = felhasznalo.name || "";
		emailMezo.value = felhasznalo.email || "";
		varosMezo.value = felhasznalo.city || "";
		telefonMezo.value = felhasznalo.phone || "";
		szerepkorMezo.value = felhasznalo.role || "customer";
	}
	urlapCim.innerHTML = felhasznalo ? "Felhasználó módosítása" : "Új felhasználó";
	mentesGomb.innerHTML = felhasznalo ? "Módosítás mentése" : "Létrehozás";
	megseGomb.classList.toggle("d-none", !felhasznalo);
}

async function felhasznaloTorlese(azonosito) {
	if (azonosito == null || !window.confirm("Biztosan törlöd ezt a felhasználót?")) return;

	try {
		const valasz = await fetch(`${API_CIM}/${azonosito}`, { method: "DELETE" });
		if (!valasz.ok) throw new Error(`HTTP ${valasz.status}`);
		allapotKiirasa(listaAllapot, "Felhasználó törölve.", "success");
		await felhasznalokBetoltese();
	} catch (hiba) {
		allapotKiirasa(listaAllapot, `Nem sikerült törölni: ${hiba.message}`, "danger");
	}
}

urlap.addEventListener("submit", async (esemeny) => {
	esemeny.preventDefault();

	const nev = nevMezo.value.trim();
	const email = emailMezo.value.trim();
	const varos = varosMezo.value.trim();
	const telefon = telefonMezo.value.trim();
	const szerepkor = szerepkorMezo.value;

	if (!urlap.checkValidity() || nev.length < 2 || !varos || !telefon || !szerepkor) {
		allapotKiirasa(urlapAllapot, "Ellenőrizd a mezőket. A név legalább 2 karakter legyen.", "danger");
		return;
	}

	const ujFelhasznalo = { name: nev, email, city: varos, phone: telefon, role: szerepkor };
	const szerkesztes = szerkesztettAzonosito !== null;
	const celUrl = szerkesztes ? `${API_CIM}/${szerkesztettAzonosito}` : API_CIM;
	mentesGomb.disabled = true;

	try {
		const valasz = await fetch(celUrl, {
			method: szerkesztes ? "PUT" : "POST",
			headers: { "Content-Type": "application/json" },
			body: JSON.stringify(ujFelhasznalo)
		});
		if (!valasz.ok) throw new Error(`HTTP ${valasz.status}`);

		urlapBeallitasa();
		allapotKiirasa(urlapAllapot, szerkesztes ? "Felhasználó módosítva." : "Felhasználó létrehozva.", "success");
		await felhasznalokBetoltese();
	} catch (hiba) {
		allapotKiirasa(urlapAllapot, `Nem sikerült a mentés: ${hiba.message}`, "danger");
	} finally {
		mentesGomb.disabled = false;
	}
});

megseGomb.addEventListener("click", () => urlapBeallitasa());
felhasznalokBetoltese();