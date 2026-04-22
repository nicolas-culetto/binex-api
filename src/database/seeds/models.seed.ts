import fs from "fs";
import csv from 'csv-parser';
import { finished } from "stream/promises";

interface rawModelData {
    id: string,
    name: string,
    category: string,
    brand_id: number
}

export async function loadModels(jwtToken: string) {
    const rawData: rawModelData[] = [];

    const stream = fs.createReadStream('src/database/seeds/models.seed.csv')
        .pipe(csv())
        .on('data', (data) => {
            data.brand_id = Number(data.brand_id);

            rawData.push(data);
        });

    // await finish of stream
    await finished(stream);
    console.log("Raw Models Data:")
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

async function upload(rawData: rawModelData, jwtToken: string) {
    const dto = {
        name: rawData.name,
        category: rawData.category,
        brandId: rawData.brand_id,
    }

    // upload model
    const res = await fetch('http://localhost:3000/models/create', {
        method: 'POST',
        body: JSON.stringify(dto),
        headers: {
            Authorization: `Bearer ${jwtToken}`,
            'Content-Type': 'application/json'
        }
    })

    if (!res.ok) {
        const error = await res.json();
        throw new Error(JSON.stringify(error));
    }

    console.log("Model uploaded successful | ID = ", rawData.id);
}