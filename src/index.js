/*
meniu:

1. zmoniu sarasas
2. prideti zmogu
3. pakeisti zmogaus info
4. istrinti zmogu
0. baigti

1. is DB gauti visa zmoniu sarasa ir atspausdinti i ekrana
2.
    paklausti vardo, pavardes ir algos
    irasyti nauja irasa i zmoniu lentele
3. 
    paklausti id,
    paklausti vardo, pavardes ir algos
    pakeisti irasa zmoniu lenteleje su nurodytu id
4. 
    paklausti id,
    is zmoniu lenteles istrinti irasa su nurodytu id
0. baigti darba

*/

import readline from "readline";
import mysql from "mysql";

const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
});

function inputText(msg) {
    return new Promise((resolve) => {
        rl.question(msg, (text) => {
            resolve(text);
        });
    });
}

// connect pakeitimas, kad leistu prisijungti kelis kartus

function dbConnect() { // prisijungimas prie duomenu bazes
    const conn = mysql.createConnection({ // kintamasis sukurtas funkcijoje
        host: "localhost",
        user: "nodejs",
        password: "nodejs123456",
        database: "zmones",
        multipleStatements: true,
    });
    return new Promise((resolve, reject) => {
        conn.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve(conn);
        });
    });
}

function dbDisconnect(conn) {  // objektas, kuri norim atjungti
    if (conn) {
        return new Promise((resolve, reject) => {
            conn.end((err) => {
                if (err) {
                    reject(err);
                    return;
                }
                resolve();
            });
        });
    } else {
        return Promise.resolve();
    }
}

function dbQuery(conn, ...args) { // pirmas parametras connection, antras masyvas args 
    return new Promise((resolve, reject) => {
        conn.query(...args, (err, results, fields) => {
            if (err) {
                reject(err);
                return;
            }
            resolve({
                results,
                fields,
            });
        });
    });
}

function printTable(r) {
    let text = "";
    for (const col of r.fields) {
        text += col.name + "\t";
    }
    console.log(text);
    for (const row of r.results) {
        text = "";
        for (const col of r.fields) {
            text += row[col.name] + "\t";
        }
        console.log(text);
    }
}

let run = true;
while (run) { // meniu atspausdinamas // su backtick spaudina per kelias eilutes
    console.log(` 
1. zmoniu sarasas
2. prideti zmogu
3. pakeisti zmogaus info
4. istrinti zmogu
0. baigti
    `);
    let pasirinkikmas = await inputText("Pasirink: "); // pasirinkimo nustatytmas
    pasirinkikmas = parseInt(pasirinkikmas); // padaromas skaicius
    switch (pasirinkikmas) {
        /* let vardas;
        let pavarde;
        let alga;
        vienas is butu, kad nemestu klaidos, del tokio pacio deklaruoto kintamojo
        kintamuju deklaravimas virsuje */

        // kitas variantas suideti salygas i atskira(vidini) skaupa {}
        case 1:
            {
                let conn;
                try {
                    conn = await dbConnect(); // prisijungimas prie duomenu bazes
                    let r = await dbQuery(conn, "select id, vardas, pavarde, gim_data, alga from zmones"); // nusiunciama uzklausa
                    printTable(r); // gautas rezultatas atspausdinamas
                }
                catch (err) {
                    console.log("Klaida: ", err);
                } finally {
                    try {
                        await dbDisconnect(conn);
                    } catch (err) {
                    }
                }
            }
            break;
        case 2:
            {
                let vardas = await inputText("Ivesk varda: "); // ivedami nauji duomenys
                let pavarde = await inputText("Ivesk pavarde: ");
                let alga = parseFloat(await inputText("Ivesk alga: ")); // skaicius
                if (vardas.trim() !== "" && pavarde.trim() !== "" && isFinite(alga)) {
                    // trim() - salina tarpu simbolius is eilutes pradzios ir pabaigos
                    // isFinite - tikrina ar nera teigimama/neigiama begalybe, nei NaN
                    let conn;
                    try {
                        conn = await dbConnect();
                        let r = await dbQuery(conn, "insert into zmones (vardas, pavarde, alga) values (?, ?, ?)", [vardas, pavarde, alga]); // nauju duomenu ivedimas i duomenu baze
                        // printTable(r);
                    }
                    catch (err) {
                        console.log("Klaida: ", err);
                    } finally {
                        try {
                            await dbDisconnect(conn);
                        } catch (err) {
                        }
                    }
                } else {
                    console.log("Blogai ivesti duomenys");
                }
            }
            break;
        case 3:
            {
                let id = parseInt(await inputText("Ivesk id: "));
                let vardas = await inputText("Ivesk varda: "); // ivedami nauji duomenys
                let pavarde = await inputText("Ivesk pavarde: ");
                let alga = parseFloat(await inputText("Ivesk alga: ")); // skaicius
                if (isFinite(id) && vardas.trim() !== "" && pavarde.trim() !== "" && isFinite(alga)) {
                    // trim() - salina tarpu simbolius is eilutes pradzios ir pabaigos
                    // isFinite - tikrina ar nera teigimama/neigiama begalybe, nei NaN
                    let conn;
                    try {
                        conn = await dbConnect();
                        let r = await dbQuery(conn, "update zmones set vardas = ?, pavarde = ?, alga = ? where id = ?", [vardas, pavarde, alga, id]); // atnaujinami duomenys duomenu bazeje pagal id
                        // printTable(r);
                    }
                    catch (err) {
                        console.log("Klaida: ", err);
                    } finally {
                        try {
                            await dbDisconnect(conn);
                        } catch (err) {
                        }
                    }
                } else {
                    console.log("Blogai ivesti duomenys");
                }
            }
            break;
        case 4:
            {
                let id = parseInt(await inputText("Ivesk id: "));
                if (isFinite(id)) {
                    // isFinite - tikrina ar nera teigimama/neigiama begalybe, nei NaN
                    let conn;
                    try {
                        conn = await dbConnect();
                        await dbQuery(conn, "delete from zmones where id = ?", [id]); // duomenu istrinimas duomenu bazeje pagal id
                        // printTable(r);
                    }
                    catch (err) {
                        console.log("Klaida: ", err);
                    } finally {
                        try {
                            await dbDisconnect(conn);
                        } catch (err) {
                        }
                    }
                } else {
                    console.log("Blogai ivesti duomenys");
                }
            }
            break;
        case 0: // baigia darba
            run = false;
            break;
        default: // ivedus netinkama pasirinkima
            console.log("Ismok naudotis klaviatura");
    }
}

rl.close();
// try {
// await dbConnect();
// let r = await dbQuery("select * from zmones");
// printTable(r);
// console.log("------------------------------------------------");
// r = await dbQuery("select * from kontaktai");
// printTable(r);
// console.log("------------------------------------------------");

//     await inputText("Kelintas meniu?")
//     if (inputText === "1") {
//         await dbConnect();
//         let r = await dbQuery("select * from zmones");
//         printTable(r);
//         console.log("------------------------------------------------");
//     }

// } catch (err) {
//     console.log("Klaida: ", err);
// } finally {
//     try {
//         await dbDisconnect();
//     } catch (err) {
//     }
//     rl.close();
// }



// await inputText("Kelintas meniu? ")
// if (userInput === 1) {
//     try {
//         await dbConnect();
//         let r = await dbQuery("select * from zmones");
//         printTable(r);
//         console.log("------------------------------------------------");
//     } catch (err) {
//         console.log("Klaida: ", err);
//     } finally {
//         try {
//             await dbDisconnect();
//         } catch (err) {
//         }
//         rl.close();
//         }
// }
