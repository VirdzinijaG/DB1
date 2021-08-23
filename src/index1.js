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
// destytojo
// viskas sukelta i try 

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

function dbConnect() {
    const conn = mysql.createConnection({
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

function dbDisconnect(conn) {
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

function dbQuery(conn, ...args) {
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

let conn;
try {
    conn = await dbConnect();
    let run = true;
    while (run) {
        console.log(`
1. zmoniu sarasas
2. prideti zmogu
3. pakeisti zmogaus info
4. istrinti zmogu
0. baigti
    `);
        let pasirinkimas = await inputText("Pasirink: ");
        pasirinkimas = parseInt(pasirinkimas);
        switch (pasirinkimas) {
            case 1:
                {
                    try {
                        let r = await dbQuery(conn, "select id, vardas, pavarde, gim_data, alga from zmones");
                        printTable(r);
                        console.log("------------------------------------------------");
                    } catch (err) {
                        console.log("Klaida: ", err);
                    }
                }
                break;
            case 2:
                {
                    let vardas = await inputText("Ivesk varda: ");
                    let pavarde = await inputText("Ivesk pavarde: ");
                    let alga = parseFloat(await inputText("Ivesk alga: "));
                    if (vardas.trim() !== "" && pavarde.trim() !== "" && isFinite(alga)) {
                        try {
                            let r = await dbQuery(conn, "insert into zmones (vardas, pavarde, alga) values (?, ?, ?)", [vardas, pavarde, alga]);
                            console.log("Naujo iraso id: " + r.results.insertId);
                        } catch (err) {
                            console.log("Klaida: ", err);
                        }
                    } else {
                        console.log("Blogai ivesti duomenys");
                    }
                }
                break;
            case 3:
                {
                    let id = parseInt(await inputText("Ivesk id: "));
                    let vardas = await inputText("Ivesk varda: ");
                    let pavarde = await inputText("Ivesk pavarde: ");
                    let alga = parseFloat(await inputText("Ivesk alga: "));
                    if (isFinite(id) && vardas.trim() !== "" && pavarde.trim() !== "" && isFinite(alga)) {
                        try {
                            let r = await dbQuery(conn, "update zmones set vardas = ?, pavarde = ?, alga = ? where id = ?", [vardas, pavarde, alga, id]);
                        } catch (err) {
                            console.log("Klaida: ", err);
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
                        try {
                            await dbQuery(conn, "delete from zmones where id = ?", [id]);
                        } catch (err) {
                            console.log("Klaida: ", err);
                        }
                    } else {
                        console.log("Blogai ivesti duomenys");
                    }
                }
                break;
            case 0:
                run = false;
                break;
            default:
                console.log("Mulki, ismok naudotis klaviaruta !!!");
        }
    }
} catch (err) {
    console.log("Klaida: ", err);
} finally {
    try {
        await dbDisconnect(conn);
    } catch (err) {
        // ignored
    }
    rl.close();
}


// try {
//   await dbConnect();
//   let r = await dbQuery("select * from zmones");
//   printTable(r);
//   console.log("------------------------------------------------");
//   r = await dbQuery("select * from kontaktai");
//   printTable(r);
//   console.log("------------------------------------------------");

//   //   await dbQuery(
//   //     "insert into zmones(vardas, pavarde) values ('vardenis', 'pavardenis')",
//   //   );

//     let vardas = await inputText("Naujas vardas: ");
//     let alga = parseFloat(await inputText("Kokia bus alga?: "));
//     let id = parseInt(await inputText("Koks id: "));
//     await dbQuery(
//       `update zmones set vardas = ?, alga = ?, gim_data = ? where id = ?`,
//       [vardas, alga, new Date(), id]
//     );

//   r = await dbQuery(`
//   select vardas, pavarde, tipas, reiksme
//   from zmones left join kontaktai on zmones.id = kontaktai.zmones_id
//   order by vardas, pavarde
//   `);
//   printTable(r);
// } catch (err) {
//   console.log("Klaida: ", err);
// } finally {
//   try {
//     await dbDisconnect();
//   } catch (err) {
//     // ignored
//   }
//   rl.close();
// }
