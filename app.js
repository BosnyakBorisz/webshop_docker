const FELHASZNALOK_API_CIME = "http://localhost:3000/users";

const allapotElem = document.querySelector("#users-status");
const felhasznalokTablaTorze = document.querySelector("#users-table-body");

function allapotBeallitasa(uzenet, tipus) {
	allapotElem.innerHTML = uzenet;
	allapotElem.className = `alert alert-${tipus}`;
}

function felhasznaloSorHozzaadasa(felhasznalo) {
	const sor = document.createElement("tr");
	const ertekek = [felhasznalo.name, felhasznalo.email, felhasznalo.city, felhasznalo.phone, felhasznalo.role];

	ertekek.forEach((ertek) => {
		const cella = document.createElement("td");
		cella.innerHTML = ertek == null || ertek === "" ? "-" : String(ertek);
		sor.append(cella);
	});

	felhasznalokTablaTorze.append(sor);
}

async function felhasznalokBetoltese() {
	try {
		const valasz = await fetch(FELHASZNALOK_API_CIME);

		if (!valasz.ok) {
			throw new Error(`A szerver ${valasz.status} hibát adott.`);
		}

		const felhasznalok = await valasz.json();

		felhasznalokTablaTorze.replaceChildren();

		if (felhasznalok.length === 0) {
			allapotBeallitasa("Nincs megjeleníthető felhasználó.", "secondary");
			return;
		}

		felhasznalok.forEach(felhasznaloSorHozzaadasa);
		allapotBeallitasa(`${felhasznalok.length} felhasználó betöltve.`, "success");
	} catch (hiba) {
		allapotBeallitasa(`Nem sikerült betölteni a felhasználókat: ${hiba.message}`, "danger");
	}
}


felhasznalokBetoltese();
