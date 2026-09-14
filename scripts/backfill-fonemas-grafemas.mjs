import assert from "node:assert";
import fs from "node:fs";
import { createClient } from "@libsql/client";

const VOWELS = "aeiouáéíóúü";
const isVowel = (c) => c !== undefined && VOWELS.includes(c);

export function analyze(raw) {
	const word = raw.trim().normalize("NFC").toLowerCase();
	const grafemas = [...word].filter((c) => /\p{L}/u.test(c)).length;

	let fonemas = 0;
	for (let i = 0; i < word.length; ) {
		const c = word[i];
		const n = word[i + 1];
		const n2 = word[i + 2];
		if (c === "c" && n === "h") {
			fonemas++;
			i += 2;
		} else if (c === "l" && n === "l") {
			fonemas++;
			i += 2;
		} else if (c === "r" && n === "r") {
			fonemas++;
			i += 2;
		} else if ((c === "q" || c === "g") && n === "u" && isVowel(n2)) {
			fonemas++;
			i += 2;
		} else if (c === "h") {
			i += 1;
		} else if (c === "x") {
			fonemas += 2;
			i += 1;
		} else {
			if (/\p{L}/u.test(c)) fonemas++;
			i += 1;
		}
	}

	return { fonemas, grafemas };
}

assert.deepStrictEqual(analyze("Herencia"), { fonemas: 7, grafemas: 8 });
assert.deepStrictEqual(analyze("Guerra"), { fonemas: 4, grafemas: 6 });
assert.deepStrictEqual(analyze("Queso"), { fonemas: 4, grafemas: 5 });
assert.deepStrictEqual(analyze("Perro"), { fonemas: 4, grafemas: 5 });
assert.deepStrictEqual(analyze("Chico"), { fonemas: 4, grafemas: 5 });
assert.deepStrictEqual(analyze("Llave"), { fonemas: 4, grafemas: 5 });
assert.deepStrictEqual(analyze("Examen"), { fonemas: 7, grafemas: 6 });
assert.deepStrictEqual(analyze("Casa"), { fonemas: 4, grafemas: 4 });
assert.deepStrictEqual(analyze("Huevo"), { fonemas: 4, grafemas: 5 });
assert.deepStrictEqual(analyze("Pingüino"), { fonemas: 8, grafemas: 8 });
assert.deepStrictEqual(analyze("Vergüenza"), { fonemas: 9, grafemas: 9 });

function loadEnv() {
	if (process.env.LIBSQL_URL && process.env.LIBSQL_TOKEN) {
		return {
			LIBSQL_URL: process.env.LIBSQL_URL,
			LIBSQL_TOKEN: process.env.LIBSQL_TOKEN,
		};
	}
	const raw = fs.readFileSync(new URL("../.dev.vars", import.meta.url), "utf8");
	return Object.fromEntries(
		raw
			.split("\n")
			.filter((line) => line.includes("="))
			.map((line) => {
				const i = line.indexOf("=");
				return [line.slice(0, i), line.slice(i + 1)];
			}),
	);
}

async function ensureColumn(db, name) {
	const info = await db.execute("PRAGMA table_info(Silaba)");
	if (!info.rows.some((row) => row.name === name)) {
		await db.execute(`ALTER TABLE Silaba ADD COLUMN ${name} INTEGER;`);
		console.log(`added column ${name}`);
	} else {
		console.log(`column ${name} already exists`);
	}
}

async function main() {
	const env = loadEnv();
	const db = createClient({ url: env.LIBSQL_URL, authToken: env.LIBSQL_TOKEN });

	await ensureColumn(db, "fonemas");
	await ensureColumn(db, "grafemas");

	const result = await db.execute("SELECT id, word FROM Silaba ORDER BY id;");
	assert.strictEqual(
		result.rows.length === 1306 || process.env.ALLOW_ANY_COUNT === "1",
		true,
		`unexpected row count: ${result.rows.length}`,
	);

	const updates = result.rows.map((row) => {
		const { fonemas, grafemas } = analyze(row.word);
		return {
			sql: "UPDATE Silaba SET fonemas = ?, grafemas = ? WHERE id = ?;",
			args: [fonemas, grafemas, row.id],
		};
	});

	for (let i = 0; i < updates.length; i += 500) {
		await db.batch(updates.slice(i, i + 500), "write");
	}

	console.log(`updated ${updates.length} rows`);
	const check = await db.execute(
		"SELECT word, fonemas, grafemas FROM Silaba ORDER BY id LIMIT 5;",
	);
	for (const row of check.rows) console.log(JSON.stringify(row));
}

main().catch((error) => {
	console.error(error);
	process.exit(1);
});
