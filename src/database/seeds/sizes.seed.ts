import fs from 'fs';
import csv from 'csv-parser';
import { finished } from "stream/promises";

interface rawSizeData {
    segment: string,
    brandId: number,
    cm: number,
    eu: number,
    us: string,
    uk: string
}

export async function loadSizes(jwtToken: string) {
    const rawData: rawSizeData[] = [];

    const stream = fs.createReadStream('src/database/seeds/sizes.seed.csv')
        .pipe(csv())
        .on('data', (data) => {
            data.brandId = Number(data.brandId),
            data.cm = Number(data.cm)
            data.eu = Number(data.eu)

            rawData.push(data);
        });

    // await finish of stream
    await finished(stream);

    for (const data of rawData) {
        try {
            await upload(data, jwtToken);
        } catch (error) {
            console.error(error);
            continue;
        }
    }
}

async function upload(rawData: rawSizeData, jwtToken: string) {
    const res = await fetch('http://localhost:3000/sizes/create', {
        method: 'POST',
        body: JSON.stringify(rawData),
        headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    });

    if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error));
    }

    const data = await res.json();

    console.log("Size uploaded successful | ID = ", data.id);
}