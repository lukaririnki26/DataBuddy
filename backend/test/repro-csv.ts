import csv = require("csv-parser");
import { BadRequestException } from "@nestjs/common";

const stream = require("stream");

async function parseCSV(buffer: Buffer, options: any) {
    return new Promise((resolve, reject) => {
        const results: any[] = [];
        let detectedHeaders: string[] = [];
        const separator = options.separator || ",";

        const bufferStream = new stream.PassThrough();
        bufferStream.end(buffer);

        bufferStream
            .pipe(
                csv({
                    separator,
                    mapHeaders: ({ header }) => header.trim(),
                }),
            )
            .on("headers", (headers) => {
                detectedHeaders = headers;
            })
            .on("data", (data) => results.push(data))
            .on("end", () => {
                console.log(`Parsed ${results.length} rows. Headers: ${detectedHeaders.length}`);
                if (results.length === 0 && detectedHeaders.length === 0) {
                    reject(new Error("File appears to be empty"));
                } else {
                    resolve(results);
                }
            })
            .on("error", reject);
    });
}

async function run() {
    console.log("--- Test 1: Valid CSV ---");
    try {
        await parseCSV(Buffer.from("name,age\nalice,30\nbob,40"), {});
        console.log("Test 1 Passed");
    } catch (e) {
        console.error("Test 1 Failed:", e.message);
    }

    console.log("\n--- Test 2: Header Only ---");
    try {
        await parseCSV(Buffer.from("name,age"), {});
        console.log("Test 2 Passed (Expected Success)");
    } catch (e) {
        console.error("Test 2 Failed (Unexpected):", e.message);
    }

    console.log("\n--- Test 3: Empty Buffer ---");
    try {
        await parseCSV(Buffer.from(""), {});
        console.log("Test 3 Passed (Unexpected)");
    } catch (e) {
        console.error("Test 3 Failed (Expected):", e.message);
    }
}

run();
