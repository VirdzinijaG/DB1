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

const conn = mysql.createConnection({
    host: "localhost",
    user: "nodejs",
    password: "nodejs123456",
    database: "zmones",
    multipleStatements: true,
});

function dbConnect() {
    return new Promise((resolve, reject) => {
        conn.connect((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function dbDisconnect() {
    return new Promise((resolve, reject) => {
        conn.end((err) => {
            if (err) {
                reject(err);
                return;
            }
            resolve();
        });
    });
}

function dbQuery() {
    return new Promise((resolve, reject) => {
        conn.query(...arguments, (err, results, fields) => {
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
while (run) {
    console.log(`
1. zmoniu sarasas
2. prideti zmogu
3. pakeisti zmogaus info
4. istrinti zmogu
0. baigti
    `);
    let pasirinkikmas = await inputText("Pasirink: ");
    pasirinkikmas = parseInt(pasirinkikmas);
    switch (pasirinkikmas) {
        case 1:
            try {
                await dbConnect();
                let r = await dbQuery("select id, vardas, pavarde, gim_data, alga from zmones");
                printTable(r);
            }
            catch (err) {
                console.log("Klaida: ", err);
            } finally {
                try {
                    await dbDisconnect();
                } catch (err) {
                }
            }
        case 2:
            let vardas = await inputText("Ivesk varda: ");
            let pavarde = await inputText("Ivesk pavarde: ");
            let alga = parseFloat(await inputText("Ivesk alga: "));
            if (vardas.trim() !== "" && pavarde.trim() !== "" && isFinite(alga)) {
                try {
                    await dbConnect();
                    let r = await dbQuery("insert into zmones (vardas, pavarde, alga) values (?, ?, ?)", [vardas, pavarde, alga]);
                    printTable(r);
                }
                catch (err) {
                    console.log("Klaida: ", err);
                } finally {
                    try {
                        await dbDisconnect();
                    } catch (err) {
                    }
                }
            } else {
                console.log("Blogai ivesti duomenys");
            }

        case 3:
        case 4:
        case 0:
            run = false;
            break;
        default:
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
