import fs from "fs";
import csv from 'csv-parser';
import { finished } from "stream/promises";

interface rawBrandData {
    id: string,
    name: string,
    logo_url: string
}

export async function loadBrands(jwtToken: string) {
    const rawData: rawBrandData[] = [];

    const stream = fs.createReadStream('src/database/seeds/brands.seed.csv')
        .pipe(csv())
        .on('data', (data) => {
            rawData.push(data);
        });

    // await finish of stream
    await finished(stream);
    console.log("Raw Brands Data:")
    console.log(rawData);

    for (const data of rawData) {
        try {
            await upload(data, jwtToken);
        } catch (error) {
            console.error(error);
            continue;
        }
    };
}

async function upload(rawData: rawBrandData, jwtToken: string) {
    const form = new FormData();
    form.append("name", rawData.name);

    // get brand logo blob
    const imgRes = await fetch(rawData.logo_url);

    if (!imgRes.ok) {
        const error = await imgRes.json();
        throw new Error(JSON.stringify(error));
    }

    const blob = await imgRes.blob();
    form.append("file", blob);

    // upload brand
    const res = await fetch('http://localhost:3000/brands/create', {
        method: 'POST',
        body: form,
        headers: {
            Authorization: `Bearer ${jwtToken}`
        }
    })

    if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error));
    }

    console.log("Brand uploaded successful | ID = ", rawData.id);
}